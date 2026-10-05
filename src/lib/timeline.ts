// Grid placement for the alternating timeline at 1024+ (D15). Every era card spans two rows and the
// next card starts one row later on the other side, so it begins at the previous card's vertical
// midpoint. A label (employer heading or title rung) takes one full-width row after the card above
// it has ended, and the stagger restarts below it. Below 1024 the rows are ignored and everything
// stacks on a single rail.
export type TimelineKind = 'employer' | 'title' | 'era';
export type TimelineSide = 'left' | 'right';

export interface TimelinePlacement {
  kind: TimelineKind;
  row: number;
  span: 1 | 2;
  side?: TimelineSide;
}

export function layoutTimeline<T extends { kind: TimelineKind }>(
  items: readonly T[]
): (T & TimelinePlacement)[] {
  let cursor = 1;
  let eras = 0;
  return items.map((item, index) => {
    const row = cursor;
    if (item.kind !== 'era') {
      cursor = row + 1;
      return { ...item, row, span: 1 };
    }
    const side: TimelineSide = eras++ % 2 === 0 ? 'left' : 'right';
    cursor = items[index + 1]?.kind === 'era' ? row + 1 : row + 2;
    return { ...item, row, span: 2, side };
  });
}

// "2015 to 2017" into the two years the round badge shows.
export function yearSpan(years: string): { start: string; end: string } {
  const [start = years, end = ''] = years.split(' to ');
  return { start, end };
}
