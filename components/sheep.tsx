/**
 * 决策助手吉祥物：扁平小羊（白羊座灵感）。Web 版，与移动端 Sheep 同一只角色。
 * 只用于"陪伴区"（首页问候 / 空状态），报告与表单区不出现。
 * float=true 时做呼吸式上下浮动（见 globals.css 的 .sheep-float）。
 */
export function Sheep({
  size = 64,
  float = false,
  className
}: {
  size?: number;
  float?: boolean;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={(size * 124) / 120}
      viewBox="0 0 120 124"
      className={[float ? "sheep-float" : "", className ?? ""].join(" ").trim() || undefined}
      aria-hidden="true"
    >
      <ellipse cx="60" cy="113" rx="30" ry="6" fill="#0B0E14" opacity="0.05" />
      <path d="M60 16 V26" stroke="#1456d8" strokeWidth="3" strokeLinecap="round" />
      <path d="M60 18 q-16 2 -24 -6" stroke="#5b93e8" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M60 18 q16 2 24 -6" stroke="#1456d8" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="60" cy="15" r="3.5" fill="#1456d8" />
      <circle cx="36" cy="12" r="2.6" fill="#5b93e8" />
      <circle cx="84" cy="12" r="2.6" fill="#1456d8" />
      <path d="M38 50 q-12 0 -12 12 q0 9 9 9 q-6 -3 -6 -9 q0 -8 9 -9z" fill="#CBA56F" />
      <path d="M82 50 q12 0 12 12 q0 9 -9 9 q6 -3 6 -9 q0 -8 -9 -9z" fill="#CBA56F" />
      <circle cx="48" cy="40" r="14" fill="#fff" stroke="#EDF0F4" strokeWidth="0.5" />
      <circle cx="72" cy="40" r="14" fill="#fff" stroke="#EDF0F4" strokeWidth="0.5" />
      <circle cx="60" cy="34" r="15" fill="#fff" stroke="#EDF0F4" strokeWidth="0.5" />
      <circle cx="36" cy="52" r="13" fill="#fff" stroke="#EDF0F4" strokeWidth="0.5" />
      <circle cx="84" cy="52" r="13" fill="#fff" stroke="#EDF0F4" strokeWidth="0.5" />
      <circle cx="60" cy="50" r="20" fill="#fff" stroke="#EDF0F4" strokeWidth="0.5" />
      <ellipse cx="37" cy="66" rx="9" ry="6" fill="#EFE4D2" transform="rotate(-22 37 66)" />
      <ellipse cx="83" cy="66" rx="9" ry="6" fill="#EFE4D2" transform="rotate(22 83 66)" />
      <ellipse cx="60" cy="64" rx="21" ry="19" fill="#F4ECDD" />
      <circle cx="52" cy="62" r="3.4" fill="#16263A" />
      <circle cx="68" cy="62" r="3.4" fill="#16263A" />
      <circle cx="53.2" cy="60.8" r="1.1" fill="#fff" />
      <circle cx="69.2" cy="60.8" r="1.1" fill="#fff" />
      <ellipse cx="45" cy="69" rx="3.6" ry="2.3" fill="#F7CABF" />
      <ellipse cx="75" cy="69" rx="3.6" ry="2.3" fill="#F7CABF" />
      <path d="M56 69 q4 3.5 8 0" stroke="#9A7858" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </svg>
  );
}
