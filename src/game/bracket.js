export const KNOCKOUT_ROUND_ORDER = ["R32", "R16", "QF", "SF", "FINAL"];

export const BRACKET_MATCHES = {
  M73: { round: "R32", slots: ["2A", "2B"] },
  M74: { round: "R32", slots: ["1E", "3ABCDF"] },
  M75: { round: "R32", slots: ["1F", "2C"] },
  M76: { round: "R32", slots: ["1C", "2F"] },
  M77: { round: "R32", slots: ["1I", "3CDFGH"] },
  M78: { round: "R32", slots: ["2E", "2I"] },
  M79: { round: "R32", slots: ["1A", "3CEFHI"] },
  M80: { round: "R32", slots: ["1L", "3EHIJK"] },
  M81: { round: "R32", slots: ["1D", "3BEFIJ"] },
  M82: { round: "R32", slots: ["1G", "3AEHIJ"] },
  M83: { round: "R32", slots: ["2K", "2L"] },
  M84: { round: "R32", slots: ["1H", "2J"] },
  M85: { round: "R32", slots: ["1B", "3EFGIJ"] },
  M86: { round: "R32", slots: ["1J", "2H"] },
  M87: { round: "R32", slots: ["1K", "3DEIJL"] },
  M88: { round: "R32", slots: ["2D", "2G"] },

  M89: { round: "R16", children: ["M73", "M75"] },
  M90: { round: "R16", children: ["M74", "M77"] },
  M91: { round: "R16", children: ["M76", "M78"] },
  M92: { round: "R16", children: ["M79", "M80"] },
  M93: { round: "R16", children: ["M83", "M84"] },
  M94: { round: "R16", children: ["M81", "M82"] },
  M95: { round: "R16", children: ["M86", "M88"] },
  M96: { round: "R16", children: ["M85", "M87"] },

  M97: { round: "QF", children: ["M89", "M90"] },
  M98: { round: "QF", children: ["M93", "M94"] },
  M99: { round: "QF", children: ["M91", "M92"] },
  M100: { round: "QF", children: ["M95", "M96"] },

  M101: { round: "SF", children: ["M97", "M98"] },
  M102: { round: "SF", children: ["M99", "M100"] },
  M104: { round: "FINAL", children: ["M101", "M102"] },
};

const R32_IDS = Object.entries(BRACKET_MATCHES)
  .filter(([, match]) => match.round === "R32")
  .map(([id]) => id);

export function getSlotRank(slot) {
  return Number(slot[0]);
}

export function getSlotGroup(slot) {
  return slot.at(-1);
}

export function getConcreteSlotCandidates(slot) {
  const rank = getSlotRank(slot);
  if (rank !== 3) return [slot];
  return slot
    .slice(1)
    .split("")
    .map((groupId) => `3${groupId}`);
}

export function getParentMatchId(matchId) {
  return Object.entries(BRACKET_MATCHES).find(([, match]) => match.children?.includes(matchId))?.[0] || null;
}

export function getMatchAncestors(matchId) {
  const ancestors = [matchId];
  let current = matchId;
  while (getParentMatchId(current)) {
    current = getParentMatchId(current);
    ancestors.push(current);
  }
  return ancestors;
}

export function getSlotLeafMatchId(slot) {
  for (const matchId of R32_IDS) {
    const match = BRACKET_MATCHES[matchId];
    if (match.slots.some((candidate) => getConcreteSlotCandidates(candidate).includes(slot))) {
      return matchId;
    }
  }
  return null;
}

export function getFirstMeetingMatchId(leftSlot, rightSlot) {
  const leftLeaf = getSlotLeafMatchId(leftSlot);
  const rightLeaf = getSlotLeafMatchId(rightSlot);
  if (!leftLeaf || !rightLeaf) return null;
  const rightAncestors = getMatchAncestors(rightLeaf);
  return getMatchAncestors(leftLeaf).find((matchId) => rightAncestors.includes(matchId)) || null;
}

export function isLegalFinalPair(leftSlot, rightSlot) {
  return getFirstMeetingMatchId(leftSlot, rightSlot) === "M104";
}

export function getTeamSlot(slotMap, teamCode) {
  const entries = Object.entries(slotMap).filter(([, team]) => team?.code === teamCode);
  const concrete = entries.find(([slot]) => getSlotRank(slot) !== 3 || slot.length === 2);
  return concrete?.[0] || entries[0]?.[0] || null;
}

export function getSlotTeam(slotMap, slot) {
  return slotMap[slot] || null;
}

export function createBracketSlotMap(groupResults) {
  const slotMap = {};
  const thirdRows = [];

  for (const group of groupResults) {
    group.standings.forEach((standing, index) => {
      const slot = `${index + 1}${group.id}`;
      if (index < 2) {
        slotMap[slot] = standing.team;
      } else if (index === 2) {
        thirdRows.push({ groupId: group.id, slot, standing });
      }
    });
  }

  const selectedThirds = thirdRows
    .sort((left, right) => {
      if (right.standing.points !== left.standing.points) return right.standing.points - left.standing.points;
      if (right.standing.gd !== left.standing.gd) return right.standing.gd - left.standing.gd;
      if (right.standing.gf !== left.standing.gf) return right.standing.gf - left.standing.gf;
      return right.standing.team.baseRating - left.standing.team.baseRating;
    })
    .slice(0, 8);
  const availableThirds = new Map(selectedThirds.map((item) => [item.slot, item.standing.team]));
  const thirdSlots = R32_IDS.flatMap((matchId) =>
    BRACKET_MATCHES[matchId].slots.filter((slot) => getSlotRank(slot) === 3),
  );

  function assignThirdSlots(index, used, assignments) {
    if (index >= thirdSlots.length) return assignments;
    const slot = thirdSlots[index];
    const candidates = getConcreteSlotCandidates(slot).filter((candidate) => availableThirds.has(candidate) && !used.has(candidate));

    for (const candidate of candidates) {
      const next = assignThirdSlots(index + 1, new Set([...used, candidate]), [...assignments, [slot, candidate]]);
      if (next) return next;
    }

    return null;
  }

  for (const [slot, concreteSlot] of assignThirdSlots(0, new Set(), []) || []) {
    const team = availableThirds.get(concreteSlot);
    slotMap[concreteSlot] = team;
    slotMap[slot] = team;
  }

  return slotMap;
}
