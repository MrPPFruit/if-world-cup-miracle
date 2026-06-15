#!/usr/bin/env python3
"""Normalize generated character art into the project's transparent PNG format."""

from __future__ import annotations

import argparse
from collections import deque
from pathlib import Path

from PIL import Image


CANVAS_SIZE = (442, 604)
MAX_SUBJECT_SIZE = (398, 560)
BOTTOM_PADDING = 18
MIN_TOP_PADDING = 12


def is_chroma_green(red: int, green: int, blue: int, alpha: int) -> bool:
    if alpha == 0:
        return False
    return green >= 120 and green - max(red, blue) >= 42


def is_chroma_magenta(red: int, green: int, blue: int, alpha: int) -> bool:
    if alpha == 0:
        return False
    return red >= 130 and blue >= 92 and green <= 116 and min(red, blue) - green >= 42


def is_chroma_red_fringe(red: int, green: int, blue: int, alpha: int) -> bool:
    if alpha == 0:
        return False
    return red >= 220 and green <= 70 and blue <= 76 and alpha < 200


def is_removable_background(pixel: tuple[int, int, int, int]) -> bool:
    red, green, blue, alpha = pixel
    if alpha == 0:
        return True

    # Built-in image generation often returns either real transparency,
    # a flat chroma-key background, or a drawn light checkerboard. Only remove
    # background pixels connected to the canvas edge so white footballs/eyes
    # inside the character stay intact.
    if green >= 210 and red <= 60 and blue <= 80:
        return True

    if green >= 170 and red <= 120 and blue <= 120 and green - max(red, blue) >= 80:
        return True

    if red >= 210 and blue >= 210 and green <= 80:
        return True

    channel_max = max(red, green, blue)
    channel_min = min(red, green, blue)
    return channel_max >= 214 and (channel_max - channel_min) <= 18


def remove_edge_connected_background(image: Image.Image) -> Image.Image:
    image = image.convert("RGBA")
    width, height = image.size
    pixels = image.load()
    visited = bytearray(width * height)
    removable = bytearray(width * height)
    queue: deque[tuple[int, int]] = deque()

    def enqueue(x: int, y: int) -> None:
        index = y * width + x
        if visited[index]:
            return
        if not is_removable_background(pixels[x, y]):
            return
        visited[index] = 1
        queue.append((x, y))

    for x in range(width):
        enqueue(x, 0)
        enqueue(x, height - 1)
    for y in range(height):
        enqueue(0, y)
        enqueue(width - 1, y)

    while queue:
        x, y = queue.popleft()
        removable[y * width + x] = 1
        for next_x, next_y in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= next_x < width and 0 <= next_y < height:
                enqueue(next_x, next_y)

    for y in range(height):
        for x in range(width):
            if removable[y * width + x]:
                red, green, blue, _ = pixels[x, y]
                pixels[x, y] = (red, green, blue, 0)

    return image


def cleanup_chroma_fringe(image: Image.Image) -> Image.Image:
    """Remove chroma-key specks left on antialiased transparent edges.

    The generated teams can legitimately use red or green in flags, kits, and
    props, so this only removes key-colored pixels that are small, thin, or near
    transparent canvas. Larger opaque color regions are kept as subject detail.
    """
    image = image.convert("RGBA")
    width, height = image.size
    pixels = image.load()
    alpha = image.getchannel("A")

    near_clear = bytearray(width * height)
    for y in range(height):
        for x in range(width):
            _, _, _, current_alpha = pixels[x, y]
            index = y * width + x
            if current_alpha < 210:
                near_clear[index] = 1
                continue
            for next_x in range(max(0, x - 2), min(width, x + 3)):
                for next_y in range(max(0, y - 2), min(height, y + 3)):
                    if alpha.getpixel((next_x, next_y)) < 18:
                        near_clear[index] = 1
                        break
                if near_clear[index]:
                    break

    suspicious = bytearray(width * height)
    for y in range(height):
        for x in range(width):
            red, green, blue, current_alpha = pixels[x, y]
            if (
                is_chroma_green(red, green, blue, current_alpha)
                or is_chroma_magenta(red, green, blue, current_alpha)
                or is_chroma_red_fringe(red, green, blue, current_alpha)
            ):
                suspicious[y * width + x] = 1

    visited = bytearray(width * height)
    remove = bytearray(width * height)
    queue: deque[tuple[int, int]] = deque()

    for start_y in range(height):
        for start_x in range(width):
            start_index = start_y * width + start_x
            if visited[start_index] or not suspicious[start_index]:
                continue

            visited[start_index] = 1
            queue.append((start_x, start_y))
            component: list[tuple[int, int]] = []
            near_count = 0
            low_alpha_count = 0
            min_x = max_x = start_x
            min_y = max_y = start_y

            while queue:
                x, y = queue.popleft()
                component.append((x, y))
                index = y * width + x
                if near_clear[index]:
                    near_count += 1
                if pixels[x, y][3] < 230:
                    low_alpha_count += 1
                min_x = min(min_x, x)
                max_x = max(max_x, x)
                min_y = min(min_y, y)
                max_y = max(max_y, y)

                for next_x, next_y in (
                    (x + 1, y),
                    (x - 1, y),
                    (x, y + 1),
                    (x, y - 1),
                    (x + 1, y + 1),
                    (x - 1, y - 1),
                    (x + 1, y - 1),
                    (x - 1, y + 1),
                ):
                    if not (0 <= next_x < width and 0 <= next_y < height):
                        continue
                    next_index = next_y * width + next_x
                    if visited[next_index] or not suspicious[next_index]:
                        continue
                    visited[next_index] = 1
                    queue.append((next_x, next_y))

            component_size = len(component)
            if not near_count and not low_alpha_count:
                continue

            bbox_width = max_x - min_x + 1
            bbox_height = max_y - min_y + 1
            thin_component = min(bbox_width, bbox_height) <= 10
            near_ratio = near_count / component_size
            low_alpha_ratio = low_alpha_count / component_size

            should_remove_component = (
                component_size <= 520
                or thin_component
                or near_ratio >= 0.32
                or low_alpha_ratio >= 0.22
            )

            for x, y in component:
                index = y * width + x
                if should_remove_component or near_clear[index] or pixels[x, y][3] < 190:
                    remove[index] = 1

    for y in range(height):
        for x in range(width):
            if remove[y * width + x]:
                red, green, blue, _ = pixels[x, y]
                pixels[x, y] = (red, green, blue, 0)

    return image


def normalize_character(source: Path, output: Path) -> None:
    image = cleanup_chroma_fringe(remove_edge_connected_background(Image.open(source)))
    alpha = image.getchannel("A")
    bounds = alpha.getbbox()
    subject = image.crop(bounds) if bounds else image
    subject.thumbnail(MAX_SUBJECT_SIZE, Image.Resampling.LANCZOS)

    canvas_width, canvas_height = CANVAS_SIZE
    canvas = Image.new("RGBA", CANVAS_SIZE, (0, 0, 0, 0))
    x = (canvas_width - subject.width) // 2
    y = canvas_height - subject.height - BOTTOM_PADDING
    if y < MIN_TOP_PADDING:
        y = (canvas_height - subject.height) // 2

    canvas.alpha_composite(subject, (x, y))
    output.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(output)


def clean_existing_character(source: Path, output: Path) -> None:
    image = cleanup_chroma_fringe(remove_edge_connected_background(Image.open(source)))
    output.parent.mkdir(parents=True, exist_ok=True)
    image.save(output)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument(
        "--clean-only",
        action="store_true",
        help="clean chroma remnants without resizing or repositioning the asset",
    )
    args = parser.parse_args()
    if args.clean_only:
        clean_existing_character(args.source, args.output)
    else:
        normalize_character(args.source, args.output)


if __name__ == "__main__":
    main()
