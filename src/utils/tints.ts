// Soft pastel bands used on card tops (from the Studify-style reference).
// A key (usually the vacancy category) always maps to the same tint.
const TINTS = [
  'from-[#c9f3e1] to-[#eefbf5] dark:from-emerald-900/40 dark:to-transparent',
  'from-[#e3f7c4] to-[#f6fce9] dark:from-lime-900/40 dark:to-transparent',
  'from-[#ffe0c7] to-[#fff4ea] dark:from-orange-900/40 dark:to-transparent',
  'from-[#ffd6e3] to-[#fff0f5] dark:from-pink-900/40 dark:to-transparent',
  'from-[#cfe4ff] to-[#eef5ff] dark:from-sky-900/50 dark:to-transparent',
  'from-[#e6d9ff] to-[#f6f1ff] dark:from-violet-900/40 dark:to-transparent'
];

export const tintFor = (key: string) => {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return TINTS[h % TINTS.length];
};
