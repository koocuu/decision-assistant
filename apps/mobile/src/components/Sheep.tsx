import { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";
import Svg, { Circle, Ellipse, G, Path } from "react-native-svg";

/**
 * 决策助手的吉祥物：扁平小羊（白羊座灵感）。
 * 只用于"陪伴区"（首页问候 / 生成中 / 空状态 / 复盘提醒），报告区不出现。
 * mood 控制头顶决策分叉天线的姿态：
 *  - idle：天线收拢
 *  - thinking：天线张开（正在帮你拆解）
 *  - nudge：天线带提醒小点
 * animate=true 时整只小羊会做呼吸式上下浮动（活起来，不呆）。
 */
export type SheepMood = "idle" | "thinking" | "nudge";

const wool = "#FFFFFF";
const woolEdge = "#EDF0F4";
const face = "#F4ECDD";
const ear = "#EFE4D2";
const horn = "#CBA56F";
const eye = "#16263A";
const cheek = "#F7CABF";
const mouth = "#9A7858";
const blue = "#1456D8";
const blueLight = "#5B93E8";

export function Sheep({
  size = 64,
  mood = "idle",
  animate = false
}: {
  size?: number;
  mood?: SheepMood;
  animate?: boolean;
}) {
  const spread = mood === "thinking" ? 24 : 14;
  const bob = useRef(new Animated.Value(0)).current;
  const amplitude = mood === "thinking" ? 9 : 4;

  useEffect(() => {
    if (!animate) {
      return;
    }
    const duration = mood === "thinking" ? 1000 : 1500;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, {
          toValue: 1,
          duration,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true
        }),
        Animated.timing(bob, {
          toValue: 0,
          duration,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true
        })
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [animate, bob, mood]);

  const translateY = bob.interpolate({ inputRange: [0, 1], outputRange: [0, -amplitude] });

  const svg = (
    <Svg width={size} height={(size * 124) / 120} viewBox="0 0 120 124">
      <Ellipse cx={60} cy={113} rx={30} ry={6} fill="#0B0E14" opacity={0.05} />

      {/* 决策分叉天线 */}
      <Path d="M60 16 V26" stroke={blue} strokeWidth={3} strokeLinecap="round" />
      <Path
        d={`M60 18 q-${spread} 2 -${spread + 8} -6`}
        stroke={blueLight}
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d={`M60 18 q${spread} 2 ${spread + 8} -6`}
        stroke={blue}
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
      />
      <Circle cx={60} cy={15} r={3.5} fill={blue} />
      <Circle cx={60 - (spread + 8)} cy={12} r={mood === "nudge" ? 3.4 : 2.6} fill={blueLight} />
      <Circle cx={60 + (spread + 8)} cy={12} r={mood === "nudge" ? 3.4 : 2.6} fill={blue} />

      {/* 角 */}
      <Path d="M38 50 q-12 0 -12 12 q0 9 9 9 q-6 -3 -6 -9 q0 -8 9 -9z" fill={horn} />
      <Path d="M82 50 q12 0 12 12 q0 9 -9 9 q6 -3 6 -9 q0 -8 -9 -9z" fill={horn} />

      {/* 羊毛 */}
      <G stroke={woolEdge} strokeWidth={0.5}>
        <Circle cx={48} cy={40} r={14} fill={wool} />
        <Circle cx={72} cy={40} r={14} fill={wool} />
        <Circle cx={60} cy={34} r={15} fill={wool} />
        <Circle cx={36} cy={52} r={13} fill={wool} />
        <Circle cx={84} cy={52} r={13} fill={wool} />
        <Circle cx={60} cy={50} r={20} fill={wool} />
      </G>

      {/* 耳朵 */}
      <Ellipse cx={37} cy={66} rx={9} ry={6} fill={ear} rotation={-22} origin="37, 66" />
      <Ellipse cx={83} cy={66} rx={9} ry={6} fill={ear} rotation={22} origin="83, 66" />

      {/* 脸 */}
      <Ellipse cx={60} cy={64} rx={21} ry={19} fill={face} />

      {/* 眼睛 */}
      <Circle cx={52} cy={62} r={3.4} fill={eye} />
      <Circle cx={68} cy={62} r={3.4} fill={eye} />
      <Circle cx={53.2} cy={60.8} r={1.1} fill="#FFFFFF" />
      <Circle cx={69.2} cy={60.8} r={1.1} fill="#FFFFFF" />

      {/* 腮红 + 嘴 */}
      <Ellipse cx={45} cy={69} rx={3.6} ry={2.3} fill={cheek} />
      <Ellipse cx={75} cy={69} rx={3.6} ry={2.3} fill={cheek} />
      <Path d="M56 69 q4 3.5 8 0" stroke={mouth} strokeWidth={1.8} fill="none" strokeLinecap="round" />
    </Svg>
  );

  if (!animate) {
    return svg;
  }

  return <Animated.View style={{ transform: [{ translateY }] }}>{svg}</Animated.View>;
}
