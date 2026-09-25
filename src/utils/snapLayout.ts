// Helper utilities for draggable FABs and edge/corner snap layout

export type SnapPosition = 'TL' | 'TM' | 'TR' | 'LM' | 'RM' | 'BL' | 'BM' | 'BR';

export interface Point {
  x: number;
  y: number;
}

export interface SnapCoordsResult {
  kana: Point;
  hanViet: Point;
  read: Point;
}

/**
 * Calculates resting positions for up to 3 buttons (Kana, Han-Viet, Read).
 * If multiple buttons share the same snap position:
 * - Line up horizontally if at 'TM' (top-middle) or 'BM' (bottom-middle)
 * - Line up vertically for all other 6 positions ('TL', 'TR', 'LM', 'RM', 'BL', 'BR')
 */
export function getSnapCoords(
  posKana: SnapPosition,
  posHanViet: SnapPosition,
  arg3?: SnapPosition | number,
  arg4?: number,
  arg5?: number,
  arg6 = 50,
  arg7 = 10
): SnapCoordsResult {
  let posRead: SnapPosition | undefined = undefined;
  let windowWidth: number;
  let windowHeight: number;
  let btnSize = 50;
  let gap = 10;

  if (typeof arg3 === 'number') {
    // Called as: getSnapCoords(posKana, posHanViet, windowWidth, windowHeight, btnSize, gap)
    windowWidth = arg3;
    windowHeight = arg4 ?? 700;
    btnSize = arg5 ?? 50;
    gap = arg6 ?? 10;
  } else {
    // Called as: getSnapCoords(posKana, posHanViet, posRead, windowWidth, windowHeight, btnSize, gap)
    posRead = arg3;
    windowWidth = arg4 ?? 400;
    windowHeight = arg5 ?? 700;
    btnSize = arg6 ?? 50;
    gap = arg7 ?? 10;
  }

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

  const positions: SnapPosition[] = ['TL', 'TM', 'TR', 'LM', 'RM', 'BL', 'BM', 'BR'];
  const res: SnapCoordsResult = {
    kana: { x: 0, y: 0 },
    hanViet: { x: 0, y: 0 },
    read: { x: 0, y: 0 },
  };

  // Fixed order for clustered buttons: Han-Viet first, then Kana, then Read
  const allBtns: Array<{ id: 'hanViet' | 'kana' | 'read'; snap: SnapPosition }> = [
    { id: 'hanViet', snap: posHanViet },
    { id: 'kana', snap: posKana },
  ];
  if (posRead) {
    allBtns.push({ id: 'read', snap: posRead });
  }

  for (const p of positions) {
    const cluster = allBtns.filter((b) => b.snap === p);
    const n = cluster.length;
    if (n === 0) continue;

    if (n === 1) {
      res[cluster[0].id] = getBase(p);
      continue;
    }

    // Multiple buttons at position p:
    if (p === 'TM' || p === 'BM') {
      // Horizontal row, centered
      const totalW = n * btnSize + (n - 1) * gap;
      const startX = (windowWidth - totalW) / 2;
      const y = p === 'TM' ? myTop : windowHeight - myBot - btnSize;
      cluster.forEach((b, idx) => {
        res[b.id] = { x: startX + idx * (btnSize + gap), y };
      });
    } else if (p === 'BL' || p === 'BR') {
      // Stacking vertically upwards from bottom
      const x = p === 'BL' ? mx : windowWidth - mx - btnSize;
      const bottomY = windowHeight - myBot - btnSize;
      cluster.forEach((b, idx) => {
        res[b.id] = { x, y: bottomY - idx * (btnSize + gap) };
      });
    } else if (p === 'TL' || p === 'TR') {
      // Stacking vertically downwards from top
      const x = p === 'TL' ? mx : windowWidth - mx - btnSize;
      cluster.forEach((b, idx) => {
        res[b.id] = { x, y: myTop + idx * (btnSize + gap) };
      });
    } else {
      // LM or RM: Centered vertically
      const x = p === 'LM' ? mx : windowWidth - mx - btnSize;
      const totalH = n * btnSize + (n - 1) * gap;
      const startY = (windowHeight - totalH) / 2;
      cluster.forEach((b, idx) => {
        res[b.id] = { x, y: startY + idx * (btnSize + gap) };
      });
    }
  }

  // If posRead wasn't provided, assign base of BR
  if (!posRead) {
    res.read = getBase('BR');
  }

  return res;
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
  forBtn: 'kana' | 'hanviet' | 'read',
  activeSnaps: { kana: SnapPosition; hanViet: SnapPosition; read?: SnapPosition } | SnapPosition,
  maxDist = SNAP_RANGE
): SnapPosition | null {
  const positions: SnapPosition[] = ['TL', 'TM', 'TR', 'LM', 'RM', 'BL', 'BM', 'BR'];
  let closest: SnapPosition | null = null;
  let minDist = Infinity;

  const snaps =
    typeof activeSnaps === 'string'
      ? { kana: activeSnaps, hanViet: activeSnaps }
      : activeSnaps;

  for (const pos of positions) {
    const testKana = forBtn === 'kana' ? pos : snaps.kana;
    const testHV = forBtn === 'hanviet' ? pos : snaps.hanViet;
    const testRead = forBtn === 'read' ? pos : snaps.read;
    const coords = getSnapCoords(testKana, testHV, testRead, windowWidth, windowHeight);
    const targetPt = forBtn === 'kana' ? coords.kana : forBtn === 'hanviet' ? coords.hanViet : coords.read;
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
