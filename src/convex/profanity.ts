/**
 * Minimal server-side profanity filter for chat messages and usernames.
 *
 * Leet-speak substitutions (0→o, 1→i, 3→e…) are normalized 1:1 before
 * matching, so character positions are preserved and the original message can
 * be masked with asterisks at exactly the matched spans.
 */
const LEET: Record<string, string> = {
  "0": "o",
  "1": "i",
  "!": "i",
  "3": "e",
  "4": "a",
  "@": "a",
  "5": "s",
  $: "s",
  "7": "t",
  "+": "t",
  "9": "g",
};

const BANNED_WORDS = [
  "fuck",
  "fuk",
  "shit",
  "bitch",
  "bastard",
  "asshole",
  "dick",
  "cock",
  "cunt",
  "pussy",
  "nigger",
  "nigga",
  "faggot",
  "retard",
  "whore",
  "slut",
  "wanker",
  "bollocks",
  "twat",
  "prick",
  "motherfucker",
  "kys",
  "kill yourself",
  "porn",
  "nudes",
];

// Reverse map: letter → leet variants that normalize to it.
const VARIANTS: Record<string, string> = {};
for (const [leet, letter] of Object.entries(LEET)) {
  VARIANTS[letter] = (VARIANTS[letter] ?? "") + leet;
}

function normalize(text: string): string {
  let out = "";
  for (const ch of text.toLowerCase()) out += LEET[ch] ?? ch;
  return out;
}

function buildRegex(word: string): RegExp {
  const src = [...word]
    .map((c) =>
      c === " " ? "\\s+" : `[${c}${VARIANTS[c] ?? ""}]`,
    )
    .join("");
  return new RegExp(`\\b${src}\\b`, "g");
}

const PATTERNS = BANNED_WORDS.map(buildRegex);

/** True if the text contains a banned word (even in leet-speak). */
export function containsProfanity(text: string): boolean {
  const normalized = normalize(text);
  return PATTERNS.some((re) => re.test(normalized));
}

/** Return the text with every banned word replaced by asterisks. */
export function filterProfanity(text: string): string {
  const normalized = normalize(text);
  let out = text;
  for (const re of PATTERNS) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(normalized)) !== null) {
      out =
        out.slice(0, m.index) +
        "*".repeat(m[0].length) +
        out.slice(m.index + m[0].length);
      if (m[0].length === 0) break; // safety against zero-length matches
    }
  }
  return out;
}
