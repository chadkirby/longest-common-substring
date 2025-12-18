import { describe, it, expect } from 'vitest';
import { findCommonPhrases as fcp } from '../index';

describe('findCommonPhrases', () => {
  it('honors threshold', () => {
    const strings: [string, string] = [
      `one two two three three three`,
      `three three three two two one`
    ];
    let [res0] = fcp(...strings, { threshold: 1, trimOverlaps: true });

    expect(res0).deep.equal([
      { offset: 0, substring: 'one', tokenOffset: 0, tokens: ['one'] },
      { offset: 4, substring: 'two two', tokenOffset: 1, tokens: ['two', 'two'] },
      { offset: 12, substring: 'three three three', tokenOffset: 3, tokens: ['three', 'three', 'three'] }
    ]);

    [res0] = fcp(...strings, { threshold: 2, trimOverlaps: true });
    expect(res0).deep.equal([
      { offset: 4, substring: 'two two', tokenOffset: 1, tokens: ['two', 'two'] },
      { offset: 12, substring: 'three three three', tokenOffset: 3, tokens: ['three', 'three', 'three'] }
    ]);

    [res0] = fcp(...strings, { threshold: 3, trimOverlaps: true });
    expect(res0).deep.equal([
      { offset: 12, substring: 'three three three', tokenOffset: 3, tokens: ['three', 'three', 'three'] }
    ]);

    [res0] = fcp(...strings, { threshold: 4, trimOverlaps: true });
    expect(res0).deep.equal([]);
  });

  it('is optionally case-insensitive', () => {
    const strings: [string, string] = [
      `Smythe teaches a thing comprising magic beans (par 45, "blah blah")`,
      `A thing comprising magic beans configured to provide a climbable vine.`
    ];
    let [res0, res1] = fcp(...strings);

    expect(res0).deep.equal([
      { offset: 17, substring: 'thing comprising magic beans', tokenOffset: 3, tokens: ['thing', 'comprising', 'magic', 'beans'] }
    ]);
    expect(res1).deep.equal([
      { offset: 2, substring: 'thing comprising magic beans', tokenOffset: 1, tokens: ['thing', 'comprising', 'magic', 'beans'] }
    ]);

    [res0, res1] = fcp(...strings, { tokenNormalizer: (tk) => tk.toLowerCase() });
    expect(res0).deep.equal([
      { offset: 15, substring: 'a thing comprising magic beans', tokenOffset: 2, tokens: ['a', 'thing', 'comprising', 'magic', 'beans'] }
    ]);
    expect(res1).deep.equal([
      { offset: 0, substring: 'A thing comprising magic beans', tokenOffset: 0, tokens: ['a', 'thing', 'comprising', 'magic', 'beans'] }
    ]);
  });

  it('is optionally stem-insensitive', () => {
    const strings: [string, string] = [
      `Smythe teaches providing a climbable vine`,
      `A thing comprising magic beans configured to provide a climbable vine.`
    ];
    let [res0, res1] = fcp(...strings);
    expect(res0).deep.equal([
      { offset: 25, substring: 'a climbable vine', tokenOffset: 3, tokens: ['a', 'climbable', 'vine'] }
    ]);
    expect(res1).deep.equal([
      { offset: 53, substring: 'a climbable vine', tokenOffset: 8, tokens: ['a', 'climbable', 'vine'] }
    ]);

    [res0, res1] = fcp(...strings, { conflateStems: true });
    expect(res0).deep.equal([
      { offset: 15, substring: 'providing a climbable vine', tokenOffset: 2, tokens: ['provid', 'a', 'climbabl', 'vine'] }
    ]);
    expect(res1).deep.equal([
      { offset: 45, substring: 'provide a climbable vine', tokenOffset: 7, tokens: ['provid', 'a', 'climbabl', 'vine'] }
    ]);
  });

  it('ignores non-word chars', () => {
    const strings: [string, string] = [
      `In the song, she sings that she's got "nothing in common" with the human race`,
      `sometimes I think I've got nothing in common with the rest of the human race`
    ];
    const [res0, res1] = fcp(...strings, { threshold: 2 });

    expect(res0).deep.equal([
      { offset: 34, substring: 'got "nothing in common" with the', tokenOffset: 8, tokens: ['got', 'nothing', 'in', 'common', 'with', 'the'] },
      { offset: 63, substring: 'the human race', tokenOffset: 13, tokens: ['the', 'human', 'race'] }
    ]);
    expect(res1).deep.equal([
      { offset: 23, substring: 'got nothing in common with the', tokenOffset: 5, tokens: ['got', 'nothing', 'in', 'common', 'with', 'the'] },
      { offset: 62, substring: 'the human race', tokenOffset: 13, tokens: ['the', 'human', 'race'] }
    ]);
  });

  it('optionally de-overlaps', () => {
    const strings: [string, string] = [
      `b c b c b a b c`,
      `a b c b a`
    ];

    let [res0] = fcp(...strings, { threshold: 2 });
    expect(res0).deep.equal([
      { offset: 0, substring: 'b c b', tokenOffset: 0, tokens: ['b', 'c', 'b'] },
      { offset: 4, substring: 'b c b a', tokenOffset: 2, tokens: ['b', 'c', 'b', 'a'] },
      { offset: 10, substring: 'a b c', tokenOffset: 5, tokens: ['a', 'b', 'c'] }
    ]);

    [res0] = fcp(...strings, { threshold: 2, trimOverlaps: true });
    expect(res0).deep.equal([
      { offset: 0, substring: 'b c', tokenOffset: 0, tokens: ['b', 'c'] },
      { offset: 4, substring: 'b c b a', tokenOffset: 2, tokens: ['b', 'c', 'b', 'a'] },
      { offset: 12, substring: 'b c', tokenOffset: 6, tokens: ['b', 'c'] }
    ]);
  });

  it('returns empty sequence when appropriate', () => {
    expect(fcp('abcd', 'efgh')).deep.equal([[], []]);
    expect(fcp('abcd')).deep.equal([[], []]);
    expect(fcp('', 'efgh')).deep.equal([[], []]);
    expect(fcp()).deep.equal([[], []]);
  });

  it('handles optional plural', () => {
    const [res0] = fcp(
      `the thing(s) are green`,
      `one or more things are red`,
      { threshold: 1 }
    );
    expect(res0).deep.equal([
      { offset: 13, substring: 'are', tokenOffset: 2, tokens: ['are'] }
    ]);
  });
});
