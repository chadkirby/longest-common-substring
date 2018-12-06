function longestCommonSubstring(str1 = ``, str2 = ``) {
  let arr2 = str2.split('');
  let prev = [];
  let best = ``;
  str1.split('').forEach((char1, ii) => {
    prev = arr2.map((char2, jj) => {
      if (char1 !== char2) {
        return 0;
      }

      let length = 1 + (prev[jj - 1] || 0);

      if (length > best.length) {
        let end = ii + 1;
        best = str1.substring(end - length, end);
      }

      return length;
    });
  }, '');

  return best;
}

module.exports = { longestCommonSubstring };
