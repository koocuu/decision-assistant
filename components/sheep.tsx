/**
 * 决策助手吉祥物：扁平小羊（白羊座灵感）。Web 版，与移动端 Sheep 同一只角色。
 * mood 与移动端保持同一套角色规范；float=true 时做克制浮动和眨眼。
 */
export type SheepMood = "idle" | "thinking" | "happy" | "celebrate";

export function Sheep({
  size = 64,
  mood = "idle",
  float = false,
  className
}: {
  size?: number;
  mood?: SheepMood;
  float?: boolean;
  className?: string;
}) {
  const spread = mood === "thinking" ? 24 : 14;
  const happyEyes = mood === "happy" || mood === "celebrate";
  const eyeOffset = mood === "thinking" ? -1.6 : 0;
  const mouthPath =
    mood === "thinking" ? "M56 70 q4 1.5 8 0" : mood === "happy" ? "M54 68 q6 6 12 0" : "M56 69 q4 3.5 8 0";
  const classes = [
    float ? "sheep-float" : "",
    float && mood !== "thinking" && mood !== "celebrate" ? "sheep-can-blink" : "",
    mood === "celebrate" ? "sheep-celebrate" : "",
    className ?? ""
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <svg width={size} height={(size * 124) / 120} viewBox="0 0 120 124" className={classes || undefined} aria-hidden="true">
      <ellipse cx="60" cy="113" rx="30" ry="6" fill="#0B0E14" opacity="0.05" />
      <path d="M60 16 V26" stroke="#1456d8" strokeWidth="3" strokeLinecap="round" />
      <path
        d={`M60 18 q-${spread} 2 -${spread + 8} -6`}
        stroke="#5b93e8"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={`M60 18 q${spread} 2 ${spread + 8} -6`}
        stroke="#1456d8"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="60" cy="15" r="3.5" fill="#1456d8" />
      <circle cx={60 - (spread + 8)} cy="12" r="2.6" fill="#5b93e8" />
      <circle cx={60 + (spread + 8)} cy="12" r="2.6" fill="#1456d8" className={mood === "thinking" ? "sheep-thinking-dot" : undefined} />
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
      {happyEyes ? (
        <>
          <path d="M48.5 61 q3.5 -3 7 0" stroke="#16263A" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <path d="M64.5 61 q3.5 -3 7 0" stroke="#16263A" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <g className="sheep-eyes" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
          <circle cx="52" cy={62 + eyeOffset} r="3.4" fill="#16263A" />
          <circle cx="68" cy={62 + eyeOffset} r="3.4" fill="#16263A" />
          <circle cx="53.2" cy={60.8 + eyeOffset} r="1.1" fill="#fff" />
          <circle cx="69.2" cy={60.8 + eyeOffset} r="1.1" fill="#fff" />
        </g>
      )}
      <ellipse cx="45" cy="69" rx="3.6" ry="2.3" fill="#F7CABF" opacity={happyEyes ? "0.95" : "0.72"} />
      <ellipse cx="75" cy="69" rx="3.6" ry="2.3" fill="#F7CABF" opacity={happyEyes ? "0.95" : "0.72"} />
      {mood === "celebrate" ? (
        <ellipse cx="60" cy="70" rx="4.8" ry="3.4" fill="#9A7858" opacity="0.9" />
      ) : (
        <path d={mouthPath} stroke="#9A7858" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      )}
      {mood === "celebrate" ? (
        <g className="sheep-sparkles">
          <circle cx="26" cy="26" r="3" fill="#5b93e8" />
          <circle cx="60" cy="5" r="2.4" fill="#5b93e8" />
          <circle cx="94" cy="28" r="2.8" fill="#1456d8" />
        </g>
      ) : null}
    </svg>
  );
}
