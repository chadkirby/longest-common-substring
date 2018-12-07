const { memoizingStemmer: stemmer } = require('porter-stemmer');

const { assign } = Object;

function findCommonSubstrings(str1 = ``, str2 = ``, { threshold = 3 } = {}) {
  let arr2 = str2.split(``);
  let prev = [];
  let substrings = [];
  str1.split(``).forEach((char1, ii) => {
    prev = arr2.map((char2, jj) => {
      if (char1 !== char2) {
        return 0;
      }

      let length = 1 + (prev[jj - 1] || 0);

      if (length >= threshold) {
        let end = ii + 1;
        let offset1 = end - length;
        let substring = str1.substring(offset1, end);
        let curr = substrings[substrings.length - 1];
        if (curr && curr.offset1 === offset1) {
          substrings.pop();
        }
        substrings.push({ offset1, substring, offset2: jj + 1 - length });
      }

      return length;
    });
  }, ``);

  return substrings;
}

function findCommonPhrases(str1 = ``, str2 = ``, options = {}) {
  let { threshold = 3, trimOverlaps = false } = options;
  let tk1 = tokenizer(str1, options);
  let tk2 = tokenizer(str2, options);
  let vocabulary = makeVocabulary(tk1);

  let sequences = findCommonSubstrings(
    vocabulary.fromTokens(tk1),
    vocabulary.fromTokens(tk2),
    { threshold }
  );

  if (trimOverlaps) {
    sequences = reduceOverlaps(sequences, threshold);
  }

  return [
    makeOutput(sequences, tk1, `offset1`),
    makeOutput(sequences, tk2, `offset2`)
  ];
}

// de-overlap sequences
function reduceOverlaps(inputs, threshold = 0) {
  // sort by descending sequence length
  let sequences = inputs.slice().sort((aa, bb) => bb.substring.length - aa.substring.length);
  sequences.forEach((target, ii) => {
    if (!target.substring.length) {
      return;
    }
    let start = target.offset1;
    let end = start + target.substring.length;
    let candidates = sequences.slice(ii + 1);
    // find sequences that start inside a longer sequence
    let overlapping = candidates.filter(({ offset1 }) => offset1 > start && offset1 <= end);
    // ensure the substring starts at the end of the target.substring
    overlapping.forEach((seq) => assign(seq, {
      offset1: end,
      substring: seq.substring.slice(end - seq.offset1)
    }));

    // find sequences that end inside a longer sequence
    overlapping = candidates.filter(
      ({ offset1, substring: { length } }) => (offset1 + length) > start && (offset1 + length) <= end
    );
    // ensure the substring ends at the target.offset1
    overlapping.forEach((seq) => assign(seq, {
      substring: seq.substring.slice(0, start - seq.offset1)
    }));
  });

  // omit empties & sort by ascending offset1
  sequences = sequences.filter(({ substring: { length } }) => length >= threshold);
  return sequences.sort(({ offset1: aa }, { offset1: bb }) => aa - bb);
}

function makeOutput(sequences, { all: tokens }, offsetKey) {
  return sequences.map((seq) => {
    let index = seq[offsetKey] * 2 + 1;
    let length = 2 * seq.substring.length;
    let offset = tokens.slice(0, index).join(``).length;
    let substring = tokens.slice(index, index + length - 1).join(``);
    return { offset, substring };
  });
}

function tokenizer(str, { caseInsensitive = false, conflateStems = false }) {
  // split on word-chars & dashes with optional trailing "(s)"
  let all = str.split(/([-\w]+(?:[(]s[)])?)/);
  // odd-indexed items are the tokens
  let tokens = all.filter((tk, ii) => ii % 2);
  if (caseInsensitive) {
    tokens = tokens.map((token) => token.toLowerCase());
  }
  if (conflateStems) {
    tokens = tokens.map(stem);
  }
  return { all, tokens };
}

function makeVocabulary({ tokens }) {
  const NOTFOUND = String.fromCharCode(33);
  let uniqTokens = [ ...new Set(tokens) ];
  let vocab = new Map(uniqTokens.map((token, ii) => [ token, String.fromCharCode(ii + 65) ]));
  return assign(vocab, {
    fromTokens({ tokens }) {
      return tokens.map((tk) => vocab.get(tk) || NOTFOUND).join(``);
    }
  });
}

// list plurals that don't get stemmed such that
// stemmer(plural) === stemmer(singular)
const IRREGULARS = new Map([
  [ 'apparatuses', stemmer('apparatus') ],
  // the stemmer stems 'identification' differently from other forms of
  // 'identify'
  [ 'identification', stemmer('identify') ],
  [ 'people', stemmer('person') ],
  [ 'has', stemmer('have') ],
  [ 'had', stemmer('have') ]
]);

function stem(word) {
  if (!word) {
    return '';
  }
  // strip trailing optional plural(s)
  word = word.toLowerCase().replace(/[(]s[)]$/, '');
  if (/\W/.test(word)) {
    // individually stem each portion of a hyphenate (any any other word that
    // contains a non-word char)
    return word.split(/\W+/).map(stem).join(' ').trim().replace(/\s+/, ' ');
  }

  let irregularStem = IRREGULARS.get(word);
  if (irregularStem) {
    return irregularStem;
  }

  return stemmer(word);
}

module.exports = { findCommonSubstrings, findCommonPhrases, stem };
