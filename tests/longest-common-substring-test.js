const test = require('tape');

const { longestCommonSubstring: lcs } = require('../index');

test('longestCommonSubstring works', function(assert) {
  assert.equal(
    lcs('Testing common "abcd..." substring', 'abcd substring'),
    ' substring'
  );
  assert.equal(
    lcs('Testing common "abcd..." substring', 'a Testing common abcd substring'),
    'Testing common '
  );

  assert.equal(
    lcs('zabcdabcde', 'def abcd 123'),
    'abcd'
  );

  assert.end();
});

test('longestCommonSubstring returns empty sequence when appropriate', function(assert) {
  assert.equal(lcs('abcd', 'efgh'), '');
  assert.equal(lcs('abcd'), '');
  assert.equal(lcs('', 'efgh'), '');
  assert.equal(lcs(), '');
  assert.end();
});
