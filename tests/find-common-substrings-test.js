const test = require('tape');

const { findCommonSubstrings: fcs } = require('../index');

test('findCommonSubstrings works', function(assert) {
  assert.deepEqual(
    fcs('Testing common "abcd..." substring', 'abcd substring', { threshold: 3 }),
    [
      { offset1: 4, substring: 'ing', offset2: 11 },
      { offset1: 16, substring: 'abcd', offset2: 0 },
      { offset1: 24, substring: ' substring', offset2: 4 }
    ]
  );
  assert.deepEqual(
    fcs('Testing common "abcd..." substring', 'a Testing common abcd substring', { threshold: 4 }),
    [
      { offset1: 0, substring: 'Testing common ', offset2: 2 },
      { offset1: 16, substring: 'abcd', offset2: 17 },
      { offset1: 24, substring: ' substring', offset2: 21 }
    ]
  );

  assert.deepEqual(
    fcs('zabcdabcde', 'def abcd 123'),
    [
      { offset1: 1, substring: 'abcd', offset2: 4 },
      { offset1: 5, substring: 'abcd', offset2: 4 }
    ]
  );

  assert.end();
});

test('findCommonSubstrings honors threshold', function(assert) {
  let strings = [
    `I am old`,
    `old am I`
  ];
  let res = fcs(...strings, { threshold: 1 });

  assert.deepEqual(
    res,
    [

      { offset1: 0, substring: 'I', offset2: 7 },
      { offset1: 1, substring: ' am', offset2: 3 },
      { offset1: 4, substring: ' ', offset2: 3 },
      { offset1: 1, substring: ' am ', offset2: 3 },
      { offset1: 5, substring: 'old', offset2: 0 }
    ]
  );

  res = fcs(...strings, { threshold: 2 });
  assert.deepEqual(
    res,
    [
      { offset1: 1, substring: ' am ', offset2: 3 },
      { offset1: 5, substring: 'old', offset2: 0 }
    ]
  );

  res = fcs(...strings, { threshold: 3 });
  assert.deepEqual(
    res,
    [
      { offset1: 1, substring: ' am ', offset2: 3 },
      { offset1: 5, substring: 'old', offset2: 0 }
    ]
  );

  res = fcs(...strings, { threshold: 4 });
  assert.deepEqual(
    res,
    [ { offset1: 1, substring: ' am ', offset2: 3 } ]
  );
  res = fcs(...strings, { threshold: 5 });
  assert.deepEqual(
    res,
    []
  );
  assert.end();
});

test('findCommonSubstrings returns empty sequence when appropriate', function(assert) {
  assert.deepEqual(fcs('abcd', 'efgh'), []);
  assert.deepEqual(fcs('abcd'), []);
  assert.deepEqual(fcs('', 'efgh'), []);
  assert.deepEqual(fcs(), []);
  assert.end();
});
