import React, { useRef, useState } from 'react';
import { Animated, Easing, Pressable, Text, View } from 'react-native';
import { ShieldCheck, Brain, Users, Handshake } from 'lucide-react-native';

const WhyChooseUs = () => {
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const featureTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const featureAnimations = useRef<Record<string, Animated.Value>>({}).current;
  const features = [
    { 
      title: 'Verified Listings Only', 
      desc: 'Every property undergoes legal and documentation checks for complete peace of mind.', 
      icon: ShieldCheck, 
      num: '01' 
    },
    { 
      title: 'Fair Market Valuation', 
      desc: 'Transparent pricing with no hidden charges or inflated rates guaranteed.', 
      icon: Brain, 
      num: '02' 
    },
    { 
      title: 'Local Market Expertise', 
      desc: 'Deep understanding of Pune and PCMC real estate trends and micro-markets.', 
      icon: Users, 
      num: '03' 
    },
    { 
      title: 'End-to-End Assistance', 
      desc: 'Complete support from property search to registration and final possession.', 
      icon: Handshake, 
      num: '04' 
    },
  ];

  features.forEach(item => {
    if (!featureAnimations[item.num]) {
      featureAnimations[item.num] = new Animated.Value(0);
    }
  });

  const activateFeature = (num: string) => {
    if (featureTimer.current) clearTimeout(featureTimer.current);
    setActiveFeature(num);
    Animated.timing(featureAnimations[num], {
      toValue: 1,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const releaseFeature = () => {
    if (featureTimer.current) clearTimeout(featureTimer.current);
    const active = activeFeature;
    featureTimer.current = setTimeout(() => {
      if (active) {
        Animated.timing(featureAnimations[active], {
          toValue: 0,
          duration: 260,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start();
      }
      setActiveFeature(null);
    }, 700);
  };

  return (
    <View className="py-16 bg-gray-50 px-6">
      <View className="items-center mb-12">
        <View className="flex-row items-center gap-3 mb-4">
          <View className="w-10 h-1 bg-[#E6761D] rounded-full" />
          <Text className="text-[#E6761D] text-xs font-black uppercase tracking-[4px]">Why Choose Us</Text>
          <View className="w-10 h-1 bg-[#E6761D] rounded-full" />
        </View>
        <Text className="text-3xl font-black text-gray-900 text-center tracking-tight leading-tight px-4">
          Why Choose ResaleExpert?
        </Text>
        <Text className="text-gray-500 text-sm text-center mt-3 font-medium">
          Trusted Resale Property Consultant in Pune & PCMC
        </Text>
      </View>

      <View style={{ width: '100%' }}>
        {features.map(item => (
          <FeatureCard
            key={item.num}
            item={item}
            active={activeFeature === item.num}
            animation={featureAnimations[item.num]}
            onActivate={() => activateFeature(item.num)}
            onRelease={releaseFeature}
            onHoverOut={() => {
              Animated.timing(featureAnimations[item.num], {
                toValue: 0,
                duration: 220,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
              }).start();
              setActiveFeature(null);
            }}
          />
        ))}
      </View>
    </View>
  );
};

const FeatureCard = ({
  item,
  active,
  animation,
  onActivate,
  onRelease,
  onHoverOut,
}: {
  item: {
    title: string;
    desc: string;
    icon: React.ComponentType<{ size: number; color: string }>;
    num: string;
  };
  active: boolean;
  animation: Animated.Value;
  onActivate: () => void;
  onRelease: () => void;
  onHoverOut: () => void;
}) => {
  const Icon = item.icon;
  const cardScale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.035],
  });
  const cardLift = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });
  const iconScale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.18],
  });
  const iconLift = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });
  const iconRotate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '10deg'],
  });

  return (
    <View style={{ marginBottom: 38, width: '100%' }}>
      <Pressable
        onHoverIn={onActivate}
        onHoverOut={onHoverOut}
        onPressIn={onActivate}
        onPressOut={onRelease}
        onPress={onActivate}
      >
        <Animated.View
          style={{
            width: '100%',
            backgroundColor: active ? 'rgba(230,118,29,0.45)' : 'rgba(230,118,29,0.16)',
            borderRadius: 20,
            padding: 2,
            shadowColor: active ? '#E6761D' : '#0F172A',
            shadowOffset: { width: 0, height: active ? 20 : 10 },
            shadowOpacity: active ? 0.36 : 0.18,
            shadowRadius: active ? 26 : 16,
            elevation: active ? 18 : 10,
            transform: [{ translateY: cardLift }, { scale: cardScale }],
          }}
        >
          <View
            style={{
              width: '100%',
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              padding: 24,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: active ? 'rgba(230,118,29,0.28)' : 'rgba(230,118,29,0.12)',
            }}
          >
            <View className="relative mb-4">
              <Animated.View
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 16,
                  backgroundColor: active ? '#E6761D' : 'rgba(230,118,29,0.12)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: [
                    { translateY: iconLift },
                    { scale: iconScale },
                    { rotate: iconRotate },
                  ],
                  shadowColor: '#E6761D',
                  shadowOffset: { width: 0, height: active ? 8 : 0 },
                  shadowOpacity: active ? 0.25 : 0,
                  shadowRadius: active ? 12 : 0,
                  elevation: active ? 8 : 0,
                }}
              >
                <Icon size={26} color={active ? '#FFFFFF' : '#E6761D'} />
              </Animated.View>
              <View className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#E6761D] items-center justify-center">
                <Text className="text-white text-[10px] font-black">{item.num}</Text>
              </View>
            </View>
            <Text className="text-gray-900 font-bold text-center text-lg mb-2 leading-tight">{item.title}</Text>
            <Text className="text-gray-600 text-sm text-center leading-6 font-medium">{item.desc}</Text>
          </View>
        </Animated.View>
      </Pressable>
    </View>
  );
};

export default WhyChooseUs;
