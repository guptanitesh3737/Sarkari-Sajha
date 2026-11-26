// Soft pastel bands used on card tops. A key (usually the vacancy category)
// always maps to the same tint. Values match the design handoff tokens.
export const TINT_HEX = ['#c9f3e1', '#e3f7c4', '#ffe0c7', '#ffd6e3', '#cfe4ff', '#e6d9ff'];

const TINTS = [
  'from-[#c9f3e1] to-[#eefbf5]',
  'from-[#e3f7c4] to-[#f6fce9]',
  'from-[#ffe0c7] to-[#fff4ea]',
  'from-[#ffd6e3] to-[#fff0f5]',
  'from-[#cfe4ff] to-[#eef5ff]',
  'from-[#e6d9ff] to-[#f6f1ff]'
];

const hashKey = (key: string) => {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return h;
};

/** Tailwind gradient classes for a key (use with `bg-gradient-to-b`). */
export const tintFor = (key: string) => TINTS[hashKey(key) % TINTS.length];

/** Raw tint colour for a key. */
export const tintHex = (key: string) => TINT_HEX[hashKey(key) % TINT_HEX.length];

/** Inline style for a tint band: `linear-gradient(180deg, tint, #fff)`. */
export const tintBand = (key: string) => ({ background: `linear-gradient(180deg, ${tintHex(key)}, #fff)` });
