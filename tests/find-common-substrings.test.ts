import { describe, it, expect } from 'vitest';
import { findCommonSubstrings as fcs } from '../index';

describe('findCommonSubstrings', () => {
  it('works', () => {
    expect(
      fcs('Testing common "abcd..." substring', 'abcd substring', { threshold: 3 })
    ).deep.equal([
      { offset1: 4, substring: 'ing', offset2: 11 },
      { offset1: 16, substring: 'abcd', offset2: 0 },
      { offset1: 24, substring: ' substring', offset2: 4 }
    ]);

    expect(
      fcs('Testing common "abcd..." substring', 'a Testing common abcd substring', { threshold: 4 })
    ).deep.equal([
      { offset1: 0, substring: 'Testing common ', offset2: 2 },
      { offset1: 16, substring: 'abcd', offset2: 17 },
      { offset1: 24, substring: ' substring', offset2: 21 }
    ]);

    expect(
      fcs('zabcdabcde', 'def abcd 123')
    ).deep.equal([
      { offset1: 1, substring: 'abcd', offset2: 4 },
      { offset1: 5, substring: 'abcd', offset2: 4 }
    ]);
  });

  it('honors threshold', () => {
    const strings: [string, string] = [
      `I am old`,
      `old am I`
    ];
    let res = fcs(...strings, { threshold: 1 });

    expect(res).deep.equal([
      { offset1: 0, substring: 'I', offset2: 7 },
      { offset1: 1, substring: ' am', offset2: 3 },
      { offset1: 4, substring: ' ', offset2: 3 },
      { offset1: 1, substring: ' am ', offset2: 3 },
      { offset1: 5, substring: 'old', offset2: 0 }
    ]);

    res = fcs(...strings, { threshold: 2 });
    expect(res).deep.equal([
      { offset1: 1, substring: ' am ', offset2: 3 },
      { offset1: 5, substring: 'old', offset2: 0 }
    ]);

    res = fcs(...strings, { threshold: 3 });
    expect(res).deep.equal([
      { offset1: 1, substring: ' am ', offset2: 3 },
      { offset1: 5, substring: 'old', offset2: 0 }
    ]);

    res = fcs(...strings, { threshold: 4 });
    expect(res).deep.equal([
      { offset1: 1, substring: ' am ', offset2: 3 }
    ]);

    res = fcs(...strings, { threshold: 5 });
    expect(res).deep.equal([]);
  });

  it('returns empty sequence when appropriate', () => {
    expect(fcs('abcd', 'efgh')).deep.equal([]);
    expect(fcs('abcd')).deep.equal([]);
    expect(fcs('', 'efgh')).deep.equal([]);
    expect(fcs()).deep.equal([]);
  });
});
