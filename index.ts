import { memoizingStemmer as stemmer } from 'porter-stemmer';

const { assign } = Object;

interface Substring {
  offset1: number;
  substring: string;
  offset2: number;
}

interface Options {
  threshold?: number;
  trimOverlaps?: boolean;
  tokenNormalizer?: (tk: string) => string;
  conflateStems?: boolean;
  splitter?: RegExp;
}

interface TokenizerResult {
  all: string[];
  tokens: string[];
}

interface Vocabulary extends Map<string, string> {
  fromTokens: (tokenizerResult: TokenizerResult) => string;
}

function findCommonSubstrings(str1 = ``, str2 = ``, { threshold = 3 } = {}): Substring[] {
  const arr2 = str2.split(``);
  let prev: number[] = [];
  const substrings: Substring[] = [];
  str1.split(``).forEach((char1, ii) => {
    prev = arr2.map((char2, jj) => {
      if (char1 !== char2) {
        return 0;
      }

      const length = 1 + (prev[jj - 1] || 0);

      if (length >= threshold) {
        const end = ii + 1;
        const offset1 = end - length;
        const substring = str1.substring(offset1, end);
        const curr = substrings[substrings.length - 1];
        if (curr && curr.offset1 === offset1) {
          substrings.pop();
        }
        substrings.push({ offset1, substring, offset2: jj + 1 - length });
      }

      return length;
    });
  });

  return substrings;
}

function findCommonPhrases(str1 = ``, str2 = ``, options: Options = {}) {
  const tk1 = tokenizer(str1, options);
  const tk2 = tokenizer(str2, options);

  const sequences = findCommonTokens(tk1, tk2, options);
  return [
    makeOutput(sequences, tk1, `offset1`),
    makeOutput(sequences, tk2, `offset2`)
  ];
}

function findCommonTokens(tk1: TokenizerResult, tk2: TokenizerResult, options: Options) {
  const { threshold = 3, trimOverlaps = false } = options;
  const vocabulary = makeVocabulary(tk1);

  let sequences = findCommonSubstrings(
    vocabulary.fromTokens(tk1),
    vocabulary.fromTokens(tk2),
    { threshold }
  );

  if (trimOverlaps) {
    sequences = reduceOverlaps(sequences, threshold);
  }

  return sequences;
}

// de-overlap sequences
function reduceOverlaps(inputs: Substring[], threshold = 0): Substring[] {
  // sort by descending sequence length
  let sequences = inputs.slice().sort((aa, bb) => bb.substring.length - aa.substring.length);
  sequences.forEach((target, ii) => {
    if (!target.substring.length) {
      return;
    }
    const start = target.offset1;
    const end = start + target.substring.length;
    const candidates = sequences.slice(ii + 1);
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

function makeOutput(sequences: Substring[], { all, tokens }: TokenizerResult, offsetKey: 'offset1' | 'offset2') {
  return sequences.map((seq) => {
    const tokenOffset = seq[offsetKey];
    const index = tokenOffset * 2 + 1;
    const length = 2 * seq.substring.length;
    const offset = all.slice(0, index).join(``).length;
    const substring = all.slice(index, index + length - 1).join(``);
    return { offset, substring, tokenOffset, tokens: tokens.slice(tokenOffset, tokenOffset + seq.substring.length) };
  });
}

function tokenizer(str: string, { tokenNormalizer = (tk) => tk, conflateStems = false, splitter = /([-\w]+(?:[(]s[)])?)/ }: Options): TokenizerResult {
  // split on word-chars & dashes with optional trailing "(s)"
  const all = str.split(splitter);
  // odd-indexed items are the tokens
  let tokens = all.filter((_, ii) => ii % 2);
  tokens = tokens.map(tokenNormalizer);
  if (conflateStems) {
    tokens = tokens.map(stem);
  }
  return { all, tokens };
}

function makeVocabulary({ tokens }: TokenizerResult): Vocabulary {
  const NOTFOUND = String.fromCharCode(33);
  const uniqTokens = [ ...new Set(tokens) ];
  const vocab = new Map(uniqTokens.map((token, ii) => [ token, String.fromCharCode(ii + 65) ]));
  return assign(vocab, {
    fromTokens({ tokens }: TokenizerResult) {
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

function stem(word: string): string {
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

  const irregularStem = IRREGULARS.get(word);
  if (irregularStem) {
    return irregularStem;
  }

  return stemmer(word);
}

export { findCommonSubstrings, findCommonPhrases, findCommonTokens, stem };
