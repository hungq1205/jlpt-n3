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

  // 1. Top or Bottom middle: Line up HORIZONTALLY (Han-Viet left, Kana right)
  if (p === 'TM' || p === 'BM') {
    const totalW = btnSize * 2 + gap;
    const startX = (windowWidth - totalW) / 2;
    const y = p === 'TM' ? myTop : windowHeight - myBot - btnSize;
    return {
      hanViet: { x: startX, y },
      kana: { x: startX + btnSize + gap, y },
    };
  }

  // 2. Bottom corners (BL or BR): Line up VERTICALLY (Kana stacked above Han-Viet)
  if (p === 'BL' || p === 'BR') {
    const x = p === 'BL' ? mx : windowWidth - mx - btnSize;
    const bottomY = windowHeight - myBot - btnSize;
    return {
      hanViet: { x, y: bottomY },
      kana: { x, y: bottomY - (btnSize + gap) },
    };
  }

  // 3. Top corners (TL or TR): Line up VERTICALLY (Han-Viet on top, Kana below)
  if (p === 'TL' || p === 'TR') {
    const x = p === 'TL' ? mx : windowWidth - mx - btnSize;
    return {
      hanViet: { x, y: myTop },
      kana: { x, y: myTop + btnSize + gap },
    };
  }

  // 4. Side middles (LM or RM): Line up VERTICALLY (Han-Viet on top, Kana below)
  const x = p === 'LM' ? mx : windowWidth - mx - btnSize;
  const totalH = btnSize * 2 + gap;
  const startY = (windowHeight - totalH) / 2;
  return {
    hanViet: { x, y: startY },
    kana: { x, y: startY + btnSize + gap },
  };
}

// Snapping radius for dragging into new place is 80px (increased by 30px from 50px)
export const SNAP_RANGE = 80;

/**
 * Finds a snap position ONLY if the coordinate (x, y) is within a small range (maxDist, default 80px)
 * of that candidate position's resting slot.
 * Returns null if outside the range.
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

/**
 * Resolves the target corner ('TL', 'TR', 'BL', 'BR') based on quick swipe velocity,
 * starting snap position, and pointer coordinates.
 * Distributes direction equally between straight horizontal, straight vertical,
 * and diagonal corner repositions (each spanning an equal 30-degree sector in quadrant).
 */
export function getSwipeCorner(
  vx: number,
  vy: number,
  currentX: number,
  currentY: number,
  windowWidth: number,
  windowHeight: number,
  currentSnap?: SnapPosition
): SnapPosition {
  const absVx = Math.abs(vx);
  const absVy = Math.abs(vy);

  // If current snap position is one of the 4 corners:
  if (currentSnap && (currentSnap === 'TL' || currentSnap === 'TR' || currentSnap === 'BL' || currentSnap === 'BR')) {
    const curV: 'T' | 'B' = currentSnap[0] as 'T' | 'B';
    const curH: 'L' | 'R' = currentSnap[1] as 'L' | 'R';

    // Sector angle division: tan(30deg) = ~0.577, tan(60deg) = ~1.732
    // 1. Predominantly vertical swipe (within 30 degrees of pure vertical) -> straight vertical corner
    if (absVy > 1.732 * absVx) {
      const targetV = vy < 0 ? 'T' : 'B';
      return `${targetV}${curH}` as SnapPosition;
    }

    // 2. Predominantly horizontal swipe (within 30 degrees of pure horizontal) -> straight horizontal corner
    if (absVx > 1.732 * absVy) {
      const targetH = vx < 0 ? 'L' : 'R';
      return `${curV}${targetH}` as SnapPosition;
    }

    // 3. Diagonal swipe (middle 30-degree sector: 30deg to 60deg) -> diagonal corner
    const targetV = vy < 0 ? 'T' : 'B';
    const targetH = vx < 0 ? 'L' : 'R';
    return `${targetV}${targetH}` as SnapPosition;
  }

  // If current snap position is a side middle (LM, RM) or top/bottom middle (TM, BM):
  if (currentSnap) {
    if (currentSnap === 'BM') {
      if (absVx > 1.732 * absVy) return vx < 0 ? 'BL' : 'BR';
      return vx < 0 ? 'TL' : 'TR';
    }
    if (currentSnap === 'TM') {
      if (absVx > 1.732 * absVy) return vx < 0 ? 'TL' : 'TR';
      return vx < 0 ? 'BL' : 'BR';
    }
    if (currentSnap === 'LM') {
      if (absVy > 1.732 * absVx) return vy < 0 ? 'TL' : 'BL';
      return vy < 0 ? 'TR' : 'BR';
    }
    if (currentSnap === 'RM') {
      if (absVy > 1.732 * absVx) return vy < 0 ? 'TR' : 'BR';
      return vy < 0 ? 'TL' : 'BL';
    }
  }

  // General fallback using current pointer coordinates:
  // Predominantly vertical: keep current horizontal half, move vertical
  if (absVy > 1.732 * absVx) {
    const v: 'T' | 'B' = vy < 0 ? 'T' : 'B';
    const h: 'L' | 'R' = currentX < windowWidth / 2 ? 'L' : 'R';
    return `${v}${h}` as SnapPosition;
  }

  // Predominantly horizontal: keep current vertical half, move horizontal
  if (absVx > 1.732 * absVy) {
    const h: 'L' | 'R' = vx < 0 ? 'L' : 'R';
    const v: 'T' | 'B' = currentY < windowHeight / 2 ? 'T' : 'B';
    return `${v}${h}` as SnapPosition;
  }

  // Diagonal
  const h: 'L' | 'R' = vx < 0 ? 'L' : 'R';
  const v: 'T' | 'B' = vy < 0 ? 'T' : 'B';
  return `${v}${h}` as SnapPosition;
}
