import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, Pressable, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { ArrowRight, Building2, Sparkles } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const dots = [
  { top: 20, left: 28, color: '#60A5FA', delay: 0 },
  { top: 72, right: 34, color: '#22D3EE', delay: 520 },
  { bottom: 84, left: 58, color: '#34D399', delay: 980 },
  { bottom: 34, right: 86, color: '#60A5FA', delay: 320 },
  { top: 150, left: width * 0.48, color: '#22D3EE', delay: 740 },
];

const JourneyDot = ({ dot }: { dot: any }) => {
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(floatAnim, { toValue: 0, duration: 1500, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        ])
      ).start();
    }, dot.delay);

    return () => clearTimeout(timer);
  }, [dot.delay, floatAnim]);

  const translateY = floatAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -10] });
  const rotate = floatAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '5deg'] });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: dot.top,
        left: dot.left,
        right: dot.right,
        bottom: dot.bottom,
        width: 7,
        height: 7,
        borderRadius: 99,
        backgroundColor: dot.color,
        opacity: 0.7,
        transform: [{ translateY }, { rotate }],
      }}
    />
  );
};

const JourneyStepCard = ({ type }: { type: 'old' | 'new' }) => {
  const hoverAnim = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;
  const [hovered, setHovered] = useState(false);
  const isNew = type === 'new';
  const Icon = isNew ? Sparkles : Building2;

  useEffect(() => {
    if (!isNew) return;

    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 4200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [isNew, spinAnim]);

  const setHover = (next: boolean) => {
    setHovered(next);
    Animated.timing(hoverAnim, {
      toValue: next ? 1 : 0,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const lift = hoverAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -5] });
  const iconRotate = hoverAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', isNew ? '360deg' : '8deg'] });
  const spinRotate = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const iconScale = hoverAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });

  return (
    <Pressable
      onHoverIn={() => setHover(true)}
      onHoverOut={() => setHover(false)}
      onPressIn={() => setHover(true)}
      onPressOut={() => setHover(false)}
      style={{ width: width >= 760 ? '40%' : '100%' }}
    >
      <Animated.View
        className="rounded-2xl p-5 border overflow-hidden"
        style={{
          transform: [{ translateY: lift }],
          backgroundColor: isNew ? 'rgba(37, 99, 235, 0.18)' : hovered ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.10)',
          borderColor: isNew ? 'rgba(125, 211, 252, 0.35)' : 'rgba(255,255,255,0.20)',
          shadowColor: isNew ? '#22D3EE' : '#60A5FA',
          shadowOpacity: hovered ? 0.24 : 0.1,
          shadowRadius: hovered ? 22 : 10,
          shadowOffset: { width: 0, height: hovered ? 12 : 5 },
          elevation: hovered ? 8 : 3,
        }}
      >
        <Animated.View style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, opacity: hoverAnim }}>
          <LinearGradient colors={isNew ? ['rgba(59,130,246,0.25)', 'rgba(34,211,238,0.08)'] : ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0)']} style={{ flex: 1 }} />
        </Animated.View>
        <View className="flex-row items-center gap-3 mb-3">
          <Animated.View
            className="p-3 rounded-xl"
            style={{
              backgroundColor: isNew ? '#2563EB' : 'rgba(51,65,85,0.55)',
              transform: [{ rotate: isNew ? spinRotate : iconRotate }, { scale: iconScale }],
            }}
          >
            <Icon size={22} color={isNew ? '#fff' : '#CBD5E1'} />
          </Animated.View>
          <View className="flex-1">
            <Text className={isNew ? 'text-sm font-bold text-white uppercase' : 'text-sm font-bold text-slate-300'}>
              {isNew ? 'HOUSLY FINNTECH REALTY' : 'AAKAR INFRA SERVICES'}
            </Text>
            <Text className={isNew ? 'text-cyan-200 text-[10px]' : 'text-blue-200 text-[10px]'}>
              {isNew ? 'The future is now (2025)' : 'Where it began (2013)'}
            </Text>
          </View>
        </View>
        <Text className={isNew ? 'text-white text-xs leading-5' : 'text-slate-200 text-xs leading-5'}>
          {isNew
            ? 'Expanding horizons across real estate, finance, and technology under one powerful brand.'
            : 'Built on excellence and trust, establishing a legacy of quality infrastructure and civil engineering.'}
        </Text>
      </Animated.View>
    </Pressable>
  );
};

const JourneySection = () => {
  const arrowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(arrowAnim, { toValue: 1, duration: 1050, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(arrowAnim, { toValue: 0, duration: 1050, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    ).start();
  }, [arrowAnim]);

  const arrowTranslate = arrowAnim.interpolate({ inputRange: [0, 1], outputRange: [0, width >= 760 ? 8 : 0] });
  const arrowScale = arrowAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });

  return (
    <View className="mt-12 w-full">
      <LinearGradient
        colors={['#0F172A', '#1E3A8A', '#111827']}
        className="py-12 px-5 overflow-hidden"
      >
        <View pointerEvents="none" className="absolute inset-0">
          {dots.map((dot, index) => (
            <JourneyDot key={`${dot.color}-${index}`} dot={dot} />
          ))}
        </View>

        <View className="relative z-10 items-center">
          <View className="mb-10 items-center">
            <Text className="text-2xl font-bold text-white mb-2 text-center">Our Journey Forward</Text>
            <Text className="text-blue-100 text-xs text-center">A transformation story of vision and innovation</Text>
          </View>

          <View
            className="w-full items-center"
            style={{
              flexDirection: width >= 760 ? 'row' : 'column',
              justifyContent: 'center',
              gap: 14,
            }}
          >
            <JourneyStepCard type="old" />

            <Animated.View
              style={{
                transform: [{ translateX: arrowTranslate }, { scale: arrowScale }],
                marginVertical: width >= 760 ? 0 : 6,
              }}
            >
              <LinearGradient colors={['#3B82F6', '#06B6D4']} style={{ padding: 14, borderRadius: 999, shadowColor: '#22D3EE', shadowOpacity: 0.35, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 8 }}>
                <ArrowRight size={20} color="white" />
              </LinearGradient>
            </Animated.View>

            <JourneyStepCard type="new" />
          </View>

          <View className="mt-10 bg-white/10 rounded-2xl p-6 border border-white/20 w-full">
            <Text className="text-sm font-bold text-white italic text-center leading-6">
              "Building on our strong foundation, we are creating a future where real estate, finance, and technology converge to deliver unparalleled value."
            </Text>
            <Text className="text-blue-200 text-[10px] text-center mt-3 uppercase tracking-widest font-bold">
              Transforming Industries Together
            </Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

export default JourneySection;
