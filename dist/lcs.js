var h = {};
(function(n) {
  (function() {
    var c = {
      ational: "ate",
      tional: "tion",
      enci: "ence",
      anci: "ance",
      izer: "ize",
      bli: "ble",
      alli: "al",
      entli: "ent",
      eli: "e",
      ousli: "ous",
      ization: "ize",
      ation: "ate",
      ator: "ate",
      alism: "al",
      iveness: "ive",
      fulness: "ful",
      ousness: "ous",
      aliti: "al",
      iviti: "ive",
      biliti: "ble",
      logi: "log"
    }, f = {
      icate: "ic",
      ative: "",
      alize: "al",
      iciti: "ic",
      ical: "ic",
      ful: "",
      ness: ""
    }, r = "[^aeiou]", s = "[aeiouy]", t = r + "[^aeiouy]*", l = s + "[aeiou]*", g = "^(" + t + ")?" + l + t, v = "^(" + t + ")?" + l + t + "(" + l + ")?$", a = "^(" + t + ")?" + l + t + l + t, p = "^(" + t + ")?" + s;
    function x(e) {
      var o, z, $, i, u, E, k;
      if (e.length < 3)
        return e;
      if ($ = e.substr(0, 1), $ == "y" && (e = $.toUpperCase() + e.substr(1)), i = /^(.+?)(ss|i)es$/, u = /^(.+?)([^s])s$/, i.test(e) ? e = e.replace(i, "$1$2") : u.test(e) && (e = e.replace(u, "$1$2")), i = /^(.+?)eed$/, u = /^(.+?)(ed|ing)$/, i.test(e)) {
        var m = i.exec(e);
        i = new RegExp(g), i.test(m[1]) && (i = /.$/, e = e.replace(i, ""));
      } else if (u.test(e)) {
        var m = u.exec(e);
        o = m[1], u = new RegExp(p), u.test(o) && (e = o, u = /(at|bl|iz)$/, E = new RegExp("([^aeiouylsz])\\1$"), k = new RegExp("^" + t + s + "[^aeiouwxy]$"), u.test(e) ? e = e + "e" : E.test(e) ? (i = /.$/, e = e.replace(i, "")) : k.test(e) && (e = e + "e"));
      }
      if (i = /^(.+?)y$/, i.test(e)) {
        var m = i.exec(e);
        o = m[1], i = new RegExp(p), i.test(o) && (e = o + "i");
      }
      if (i = /^(.+?)(ational|tional|enci|anci|izer|bli|alli|entli|eli|ousli|ization|ation|ator|alism|iveness|fulness|ousness|aliti|iviti|biliti|logi)$/, i.test(e)) {
        var m = i.exec(e);
        o = m[1], z = m[2], i = new RegExp(g), i.test(o) && (e = o + c[z]);
      }
      if (i = /^(.+?)(icate|ative|alize|iciti|ical|ful|ness)$/, i.test(e)) {
        var m = i.exec(e);
        o = m[1], z = m[2], i = new RegExp(g), i.test(o) && (e = o + f[z]);
      }
      if (i = /^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$/, u = /^(.+?)(s|t)(ion)$/, i.test(e)) {
        var m = i.exec(e);
        o = m[1], i = new RegExp(a), i.test(o) && (e = o);
      } else if (u.test(e)) {
        var m = u.exec(e);
        o = m[1] + m[2], u = new RegExp(a), u.test(o) && (e = o);
      }
      if (i = /^(.+?)e$/, i.test(e)) {
        var m = i.exec(e);
        o = m[1], i = new RegExp(a), u = new RegExp(v), E = new RegExp("^" + t + s + "[^aeiouwxy]$"), (i.test(o) || u.test(o) && !E.test(o)) && (e = o);
      }
      return i = /ll$/, u = new RegExp(a), i.test(e) && u.test(e) && (i = /.$/, e = e.replace(i, "")), $ == "y" && (e = $.toLowerCase() + e.substr(1)), e;
    }
    var b = {}, R = function(e) {
      return b[e] || (b[e] = x(e)), b[e];
    };
    n != null && (n.stemmer = x, n.memoizingStemmer = R);
  })();
})(h);
const { assign: S } = Object;
function O(n = "", c = "", { threshold: f = 3 } = {}) {
  const r = c.split("");
  let s = [];
  const t = [];
  return n.split("").forEach((l, g) => {
    s = r.map((v, a) => {
      if (l !== v)
        return 0;
      const p = 1 + (s[a - 1] || 0);
      if (p >= f) {
        const x = g + 1, b = x - p, R = n.substring(b, x), e = t[t.length - 1];
        e && e.offset1 === b && t.pop(), t.push({ offset1: b, substring: R, offset2: a + 1 - p });
      }
      return p;
    });
  }), t;
}
function M(n = "", c = "", f = {}) {
  const r = y(n, f), s = y(c, f), t = T(r, s, f);
  return [
    d(t, r, "offset1"),
    d(t, s, "offset2")
  ];
}
function T(n, c, f) {
  const { threshold: r = 3, trimOverlaps: s = !1 } = f, t = L(n);
  let l = O(
    t.fromTokens(n),
    t.fromTokens(c),
    { threshold: r }
  );
  return s && (l = j(l, r)), l;
}
function j(n, c = 0) {
  let f = n.slice().sort((r, s) => s.substring.length - r.substring.length);
  return f.forEach((r, s) => {
    if (!r.substring.length)
      return;
    const t = r.offset1, l = t + r.substring.length, g = f.slice(s + 1);
    let v = g.filter(({ offset1: a }) => a > t && a <= l);
    v.forEach((a) => S(a, {
      offset1: l,
      substring: a.substring.slice(l - a.offset1)
    })), v = g.filter(
      ({ offset1: a, substring: { length: p } }) => a + p > t && a + p <= l
    ), v.forEach((a) => S(a, {
      substring: a.substring.slice(0, t - a.offset1)
    }));
  }), f = f.filter(({ substring: { length: r } }) => r >= c), f.sort(({ offset1: r }, { offset1: s }) => r - s);
}
function d(n, { all: c, tokens: f }, r) {
  return n.map((s) => {
    const t = s[r], l = t * 2 + 1, g = 2 * s.substring.length, v = c.slice(0, l).join("").length, a = c.slice(l, l + g - 1).join("");
    return { offset: v, substring: a, tokenOffset: t, tokens: f.slice(t, t + s.substring.length) };
  });
}
function y(n, { tokenNormalizer: c = (s) => s, conflateStems: f = !1, splitter: r = /([-\w]+(?:[(]s[)])?)/ }) {
  const s = n.split(r);
  let t = s.filter((l, g) => g % 2);
  return t = t.map(c), f && (t = t.map(C)), { all: s, tokens: t };
}
function L({ tokens: n }) {
  const c = "!", f = [...new Set(n)], r = new Map(f.map((s, t) => [s, String.fromCharCode(t + 65)]));
  return S(r, {
    fromTokens({ tokens: s }) {
      return s.map((t) => r.get(t) || c).join("");
    }
  });
}
const U = /* @__PURE__ */ new Map([
  ["apparatuses", h.memoizingStemmer("apparatus")],
  // the stemmer stems 'identification' differently from other forms of
  // 'identify'
  ["identification", h.memoizingStemmer("identify")],
  ["people", h.memoizingStemmer("person")],
  ["has", h.memoizingStemmer("have")],
  ["had", h.memoizingStemmer("have")]
]);
function C(n) {
  if (!n)
    return "";
  if (n = n.toLowerCase().replace(/[(]s[)]$/, ""), /\W/.test(n))
    return n.split(/\W+/).map(C).join(" ").trim().replace(/\s+/, " ");
  const c = U.get(n);
  return c || h.memoizingStemmer(n);
}
export {
  M as findCommonPhrases,
  O as findCommonSubstrings,
  T as findCommonTokens,
  C as stem
};
