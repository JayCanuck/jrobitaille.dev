import { describe, expect, it } from 'vitest';

import { layoutTimeline, startYear, type TimelineKind } from '@/lib/timeline';

// The alternating timeline interleaves at 1024+: every era card spans two grid rows and the next
// card starts one row later on the other side, so it begins at the previous card's midpoint. Labels
// (employer, title) take one full-width row and restart the stagger below the card above them.
const kinds = (...list: TimelineKind[]) => list.map(kind => ({ kind }));

describe('layoutTimeline', () => {
  it('keeps the item fields alongside the placement', () => {
    expect(layoutTimeline([{ kind: 'era', id: 'RV' }])).toEqual([
      { kind: 'era', id: 'RV', row: 1, span: 2, side: 'left' }
    ]);
  });

  it('starts each card one row after the previous card, alternating sides', () => {
    const rows = layoutTimeline(kinds('employer', 'title', 'era', 'era', 'era'));
    expect(rows).toEqual([
      { kind: 'employer', row: 1, span: 1 },
      { kind: 'title', row: 2, span: 1 },
      { kind: 'era', row: 3, span: 2, side: 'left' },
      { kind: 'era', row: 4, span: 2, side: 'right' },
      { kind: 'era', row: 5, span: 2, side: 'left' }
    ]);
  });

  it('places a label after the card above it has ended, then restarts the stagger', () => {
    const rows = layoutTimeline(kinds('era', 'era', 'title', 'era', 'employer', 'era'));
    expect(rows.map(item => item.row)).toEqual([1, 2, 4, 5, 7, 8]);
  });

  it('keeps alternating sides across labels', () => {
    const rows = layoutTimeline(kinds('era', 'title', 'era', 'title', 'era'));
    expect(rows.filter(item => item.kind === 'era').map(item => item.side)).toEqual([
      'left',
      'right',
      'left'
    ]);
  });

  it('returns no rows for no items', () => {
    expect(layoutTimeline([])).toEqual([]);
  });
});

describe('startYear', () => {
  it('takes the start of a year range', () => {
    expect(startYear('2015 to 2017')).toBe('2015');
  });

  it('returns a single year as is', () => {
    expect(startYear('2014')).toBe('2014');
  });
});
