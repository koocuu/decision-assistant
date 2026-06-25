import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Easing, StyleSheet, View } from "react-native";
import Svg, { Circle, Ellipse, G, Path } from "react-native-svg";

/**
 * 决策助手的吉祥物：扁平小羊（白羊座灵感）。
 * 只用于"陪伴区"（首页问候 / 生成中 / 空状态 / 复盘提醒），报告区不出现。
 * mood 与 Web 侧角色规范保持一致：
 *  - idle：轻微微笑，天线收拢
 *  - thinking：瞳孔上移、嘴更中性、天线张开
 *  - happy：眯眼笑，腮红略明显
 *  - celebrate：眯眼开口笑，一次性轻弹并出现少量星点
 */
export type SheepMood = "idle" | "thinking" | "happy" | "celebrate";

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
  const celebrate = useRef(new Animated.Value(0)).current;
  const sparkle = useRef(new Animated.Value(0)).current;
  const [reduceMotion, setReduceMotion] = useState(false);
  const [blinking, setBlinking] = useState(false);
  const amplitude = mood === "thinking" ? 9 : 4;
  const canLoop = animate && !reduceMotion && mood !== "celebrate";

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) {
        setReduceMotion(enabled);
      }
    });

    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotion);
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!canLoop) {
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
  }, [bob, canLoop, mood]);

  useEffect(() => {
    if (!canLoop || mood === "thinking") {
      return;
    }

    let blinkTimer: ReturnType<typeof setTimeout>;
    let resetTimer: ReturnType<typeof setTimeout>;

    function scheduleBlink() {
      blinkTimer = setTimeout(
        () => {
          setBlinking(true);
          resetTimer = setTimeout(() => {
            setBlinking(false);
            scheduleBlink();
          }, 140);
        },
        4000 + Math.round(Math.random() * 3000)
      );
    }

    scheduleBlink();
    return () => {
      clearTimeout(blinkTimer);
      clearTimeout(resetTimer);
    };
  }, [canLoop, mood]);

  useEffect(() => {
    if (mood !== "celebrate" || reduceMotion) {
      return;
    }

    celebrate.setValue(0);
    sparkle.setValue(0);
    Animated.parallel([
      Animated.sequence([
        Animated.timing(celebrate, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true
        }),
        Animated.timing(celebrate, {
          toValue: 0,
          duration: 230,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true
        })
      ]),
      Animated.sequence([
        Animated.delay(80),
        Animated.timing(sparkle, {
          toValue: 1,
          duration: 280,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true
        }),
        Animated.timing(sparkle, {
          toValue: 0,
          duration: 420,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true
        })
      ])
    ]).start();
  }, [celebrate, mood, reduceMotion, sparkle]);

  const translateY = bob.interpolate({ inputRange: [0, 1], outputRange: [0, -amplitude] });
  const celebrateScale = celebrate.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] });
  const celebrateY = celebrate.interpolate({ inputRange: [0, 1], outputRange: [0, -6] });
  const wrapperTransform =
    mood === "celebrate" && !reduceMotion
      ? [{ translateY: celebrateY }, { scale: celebrateScale }]
      : canLoop
        ? [{ translateY }]
        : undefined;
  const cheekOpacity = mood === "happy" || mood === "celebrate" ? 0.95 : 0.72;
  const eyeOffset = mood === "thinking" ? -1.6 : 0;
  const showHappyEyes = mood === "happy" || mood === "celebrate" || blinking;
  const mouthPath =
    mood === "thinking"
      ? "M56 70 q4 1.5 8 0"
      : mood === "happy"
        ? "M54 68 q6 6 12 0"
        : "M56 69 q4 3.5 8 0";

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
      <Circle cx={60 - (spread + 8)} cy={12} r={2.6} fill={blueLight} />
      <Circle cx={60 + (spread + 8)} cy={12} r={2.6} fill={blue} />

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
      {showHappyEyes ? (
        <>
          <Path d="M48.5 61 q3.5 -3 7 0" stroke={eye} strokeWidth={2.4} fill="none" strokeLinecap="round" />
          <Path d="M64.5 61 q3.5 -3 7 0" stroke={eye} strokeWidth={2.4} fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <Circle cx={52} cy={62 + eyeOffset} r={3.4} fill={eye} />
          <Circle cx={68} cy={62 + eyeOffset} r={3.4} fill={eye} />
          <Circle cx={53.2} cy={60.8 + eyeOffset} r={1.1} fill="#FFFFFF" />
          <Circle cx={69.2} cy={60.8 + eyeOffset} r={1.1} fill="#FFFFFF" />
        </>
      )}

      {/* 腮红 + 嘴 */}
      <Ellipse cx={45} cy={69} rx={3.6} ry={2.3} fill={cheek} opacity={cheekOpacity} />
      <Ellipse cx={75} cy={69} rx={3.6} ry={2.3} fill={cheek} opacity={cheekOpacity} />
      {mood === "celebrate" ? (
        <Ellipse cx={60} cy={70} rx={4.8} ry={3.4} fill={mouth} opacity={0.9} />
      ) : (
        <Path d={mouthPath} stroke={mouth} strokeWidth={1.8} fill="none" strokeLinecap="round" />
      )}
    </Svg>
  );

  if (!wrapperTransform) {
    return svg;
  }

  return (
    <View style={[styles.stage, { width: size, height: (size * 124) / 120 }]}>
      <Animated.View style={{ transform: wrapperTransform }}>{svg}</Animated.View>
      {mood === "celebrate" && !reduceMotion ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.sparkles,
            {
              opacity: sparkle,
              transform: [
                {
                  translateY: sparkle.interpolate({ inputRange: [0, 1], outputRange: [0, -7] })
                }
              ]
            }
          ]}
        >
          <View style={[styles.sparkle, styles.sparkleLeft, { width: size * 0.07, height: size * 0.07 }]} />
          <View style={[styles.sparkle, styles.sparkleTop, { width: size * 0.055, height: size * 0.055 }]} />
          <View style={[styles.sparkle, styles.sparkleRight, { width: size * 0.06, height: size * 0.06 }]} />
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    position: "relative"
  },
  sparkles: {
    ...StyleSheet.absoluteFillObject
  },
  sparkle: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: blueLight
  },
  sparkleLeft: {
    left: "16%",
    top: "22%"
  },
  sparkleTop: {
    left: "48%",
    top: "6%"
  },
  sparkleRight: {
    right: "13%",
    top: "24%",
    backgroundColor: blue
  }
});
