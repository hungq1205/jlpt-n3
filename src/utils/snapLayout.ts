// Helper utilities for draggable FABs and edge/corner snap layout

export type SnapPosition = 'TL' | 'TM' | 'TR' | 'LM' | 'RM' | 'BL' | 'BM' | 'BR';

export interface Point {
  x: number;
  y: number;
}

/**
 * Calculates resting positions for both buttons (Kana and Han-Viet).
 * If both share the same snap position:
 * - Line up horizontally if at 'TM' (top-middle) or 'BM' (bottom-middle)
 * - Line up vertically for all other 6 positions ('TL', 'TR', 'LM', 'RM', 'BL', 'BR')
 */
export function getSnapCoords(
  posKana: SnapPosition,
  posHanViet: SnapPosition,
  windowWidth: number,
  windowHeight: number,
  btnSize = 50,
  gap = 10
): { kana: Point; hanViet: Point } {
  const mx = 16;
  const myTop = 18;
  const myBot = 82; // Above bottom controls/navigation

  const getBase = (p: SnapPosition): Point => {
    switch (p) {
      case 'TL':
        return { x: mx, y: myTop };
      case 'TM':
        return { x: (windowWidth - btnSize) / 2, y: myTop };
      case 'TR':
        return { x: windowWidth - mx - btnSize, y: myTop };
      case 'LM':
        return { x: mx, y: (windowHeight - btnSize) / 2 };
      case 'RM':
        return { x: windowWidth - mx - btnSize, y: (windowHeight - btnSize) / 2 };
      case 'BL':
        return { x: mx, y: windowHeight - myBot - btnSize };
      case 'BM':
        return { x: (windowWidth - btnSize) / 2, y: windowHeight - myBot - btnSize };
      case 'BR':
        return { x: windowWidth - mx - btnSize, y: windowHeight - myBot - btnSize };
    }
  };

  // If different snap positions, simply place each at its own base
  if (posKana !== posHanViet) {
    return {
      kana: getBase(posKana),
      hanViet: getBase(posHanViet),
    };
  }

  // If both share the SAME snap position:
  const p = posKana;

  // 1. Top or Bottom middle: Line up HORIZONTALLY
  if (p === 'TM' || p === 'BM') {
    const totalW = btnSize * 2 + gap;
    const startX = (windowWidth - totalW) / 2;
    const y = p === 'TM' ? myTop : windowHeight - myBot - btnSize;
    return {
      kana: { x: startX, y },
      hanViet: { x: startX + btnSize + gap, y },
    };
  }

  // 2. Bottom corners (BL or BR): Line up VERTICALLY (Han-Viet stacked above Kana)
  if (p === 'BL' || p === 'BR') {
    const x = p === 'BL' ? mx : windowWidth - mx - btnSize;
    const bottomY = windowHeight - myBot - btnSize;
    return {
      kana: { x, y: bottomY },
      hanViet: { x, y: bottomY - (btnSize + gap) },
    };
  }

  // 3. Top corners (TL or TR): Line up VERTICALLY (Kana on top, Han-Viet below)
  if (p === 'TL' || p === 'TR') {
    const x = p === 'TL' ? mx : windowWidth - mx - btnSize;
    return {
      kana: { x, y: myTop },
      hanViet: { x, y: myTop + btnSize + gap },
    };
  }

  // 4. Side middles (LM or RM): Line up VERTICALLY
  const x = p === 'LM' ? mx : windowWidth - mx - btnSize;
  const totalH = btnSize * 2 + gap;
  const startY = (windowHeight - totalH) / 2;
  return {
    kana: { x, y: startY },
    hanViet: { x, y: startY + btnSize + gap },
  };
}

// Snapping radius for dragging into new place is 50px
export const SNAP_RANGE = 50;

/**
 * Finds a snap position ONLY if the coordinate (x, y) is within a small range (maxDist, default 85px)
 * of that candidate position's resting slot.
 * Returns null if outside the small range.
 */
export function findSnapPositionWithinRange(
  x: number,
  y: number,
  windowWidth: number,
  windowHeight: number,
  forBtn: 'kana' | 'hanviet',
  otherSnap: SnapPosition,
  maxDist = SNAP_RANGE
): SnapPosition | null {
  const positions: SnapPosition[] = ['TL', 'TM', 'TR', 'LM', 'RM', 'BL', 'BM', 'BR'];
  let closest: SnapPosition | null = null;
  let minDist = Infinity;

  for (const pos of positions) {
    const coords =
      forBtn === 'kana'
        ? getSnapCoords(pos, otherSnap, windowWidth, windowHeight)
        : getSnapCoords(otherSnap, pos, windowWidth, windowHeight);
    const targetPt = forBtn === 'kana' ? coords.kana : coords.hanViet;
    const center = { x: targetPt.x + 25, y: targetPt.y + 25 };
    const dist = Math.hypot(x - center.x, y - center.y);
    if (dist < minDist) {
      minDist = dist;
      closest = pos;
    }
  }

  if (minDist <= maxDist) {
    return closest;
  }
  return null;
}

/**
 * Finds the nearest of the 8 snap positions based on a drop coordinate (centerX, centerY).
 */
export function findNearestSnapPosition(
  x: number,
  y: number,
  windowWidth: number,
  windowHeight: number
): SnapPosition {
  const positions: SnapPosition[] = ['TL', 'TM', 'TR', 'LM', 'RM', 'BL', 'BM', 'BR'];
  let closest: SnapPosition = 'BR';
  let minDist = Infinity;

  for (const pos of positions) {
    const coords = getSnapCoords(pos, 'TM', windowWidth, windowHeight);
    const center = { x: coords.kana.x + 25, y: coords.kana.y + 25 };
    const dist = Math.hypot(x - center.x, y - center.y);
    if (dist < minDist) {
      minDist = dist;
      closest = pos;
    }
  }

  return closest;
}
