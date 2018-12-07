const test = require('tape');

const { findCommonPhrases: fcp } = require('../index');

test('findCommonPhrases honors threshold', function(assert) {
  let strings = [
    `one two two three three three`,
    `three three three two two one`
  ];
  let [ res0 ] = fcp(...strings, { threshold: 1, trimOverlaps: true });

  assert.deepEqual(
    res0,
    [
      { offset: 0, substring: 'one' },
      { offset: 4, substring: 'two two' },
      { offset: 12, substring: 'three three three' }
    ]
  );

  [ res0 ] = fcp(...strings, { threshold: 2, trimOverlaps: true });
  assert.deepEqual(
    res0,
    [
      { offset: 4, substring: 'two two' },
      { offset: 12, substring: 'three three three' }
    ]
  );

  [ res0 ] = fcp(...strings, { threshold: 3, trimOverlaps: true });
  assert.deepEqual(
    res0,
    [ { offset: 12, substring: 'three three three' } ]
  );

  [ res0 ] = fcp(...strings, { threshold: 4, trimOverlaps: true });
  assert.deepEqual(
    res0,
    []
  );

  assert.end();
});

test('findCommonPhrases is optionally caseInsensitive', function(assert) {
  let strings = [
    `Smythe teaches a thing comprising magic beans (par 45, "blah blah")`,
    `A thing comprising magic beans configured to provide a climbable vine.`
  ];
  let [ res0, res1 ] = fcp(...strings);

  assert.deepEqual(
    res0,
    [ { offset: 17, substring: 'thing comprising magic beans' } ]
  );
  assert.deepEqual(
    res1,
    [ { offset: 2, substring:'thing comprising magic beans' } ]
  );

  [ res0, res1 ] = fcp(...strings, { caseInsensitive: true });
  assert.deepEqual(
    res0,
    [ { offset: 15, substring: 'a thing comprising magic beans' } ]
  );
  assert.deepEqual(
    res1,
    [ { offset: 0, substring: 'A thing comprising magic beans' } ]
  );

  assert.end();
});

test('findCommonPhrases is optionally stem insensitive', function(assert) {
  let strings = [
    `Smythe teaches providing a climbable vine`,
    `A thing comprising magic beans configured to provide a climbable vine.`
  ];
  let [ res0, res1 ] = fcp(...strings);
  assert.deepEqual(
    res0,
    [ { offset: 25, substring: 'a climbable vine' } ]
  );
  assert.deepEqual(
    res1,
    [ { offset: 53, substring: 'a climbable vine' } ]
  );

  [ res0, res1 ] = fcp(...strings, { conflateStems: true });
  assert.deepEqual(
    res0,
    [ { offset: 15, substring: 'providing a climbable vine' } ]
  );
  assert.deepEqual(
    res1,
    [ { offset: 45, substring: 'provide a climbable vine' } ]
  );

  assert.end();
});

test('findCommonPhrases ignores non-word chars', function(assert) {
  let strings = [
    `In the song, she sings that she's got "nothing in common" with the human race`,
    `sometimes I think I've got nothing in common with the rest of the human race`
  ];
  let [ res0, res1 ] = fcp(...strings, { threshold: 2 });

  assert.deepEqual(
    res0,
    [
      { offset: 34, substring: 'got "nothing in common" with the' },
      { offset: 63, substring: 'the human race' }
    ]
  );
  assert.deepEqual(
    res1,
    [
      { offset: 23, substring: 'got nothing in common with the' },
      { offset: 62, substring: 'the human race' }
    ]
  );

  assert.end();

});

test('findCommonPhrases optionally de-overlaps', function(assert) {
  let strings = [
    `b c b c b a b c`,
    `a b c b a`
  ];

  let [ res0 ] = fcp(...strings, { threshold: 2 });
  assert.deepEqual(
    res0,
    [
      { offset: 0, substring: 'b c b' },
      { offset: 4, substring: 'b c b a' },
      { offset: 10, substring: 'a b c' }
    ]
  );

  [ res0 ] = fcp(...strings, { threshold: 2, trimOverlaps: true });
  assert.deepEqual(
    res0,
    [
      { offset: 0, substring: 'b c' },
      { offset: 4, substring: 'b c b a' },
      { offset: 12, substring: 'b c' }
    ]
  );

  assert.end();
});

test('findCommonPhrases returns empty sequence when appropriate', function(assert) {
  assert.deepEqual(fcp('abcd', 'efgh'), [ [], [] ]);
  assert.deepEqual(fcp('abcd'), [ [], [] ]);
  assert.deepEqual(fcp('', 'efgh'), [ [], [] ]);
  assert.deepEqual(fcp(), [ [], [] ]);
  assert.end();
});

test('optional plural', function(assert) {
  let [ res0 ] = fcp(
    `the thing(s) are green`,
    `one or more things are red`,
    { threshold: 1 }
  );
  assert.deepEqual(
    res0,
    [ { offset: 13, substring: 'are' } ]
  );

  assert.end();
});

