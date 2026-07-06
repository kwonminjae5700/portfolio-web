/**
 * 공용 버튼 스타일 레시피
 * <button>과 <Link> 양쪽에서 className으로 사용한다.
 */

const base =
  "inline-flex items-center justify-center gap-1.5 rounded-lg text-sm font-medium transition-colors " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 " +
  "disabled:opacity-50 disabled:cursor-not-allowed";

export const btnPrimary = `${base} bg-accent text-white hover:bg-accent-deep px-4 py-2`;

export const btnGhost = `${base} text-muted hover:text-ink hover:bg-wash px-4 py-2`;

export const btnOutline = `${base} border border-line text-body hover:border-faint hover:bg-wash px-4 py-2`;

export const btnDanger = `${base} text-red-600 hover:bg-red-50 px-4 py-2`;

/** 텍스트 인풋/텍스트에어리어 공용 스타일 */
export const inputBase =
  "w-full px-4 py-3 border border-line rounded-lg text-ink placeholder:text-faint " +
  "focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-transparent transition";
