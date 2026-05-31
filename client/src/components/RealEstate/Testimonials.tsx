import React, { useRef, useState } from 'react';
import { Animated, Easing, Pressable, Text, View } from 'react-native';
import { Star } from 'lucide-react-native';

const Testimonials = () => {
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const timers = useRef<Record<number, ReturnType<typeof setTimeout>>>({}).current;
  const animations = useRef<Record<number, Animated.Value>>({}).current;
  const testimonials = [
    { 
      name: 'Rajesh Kumar', 
      location: '3BHK Wakad', 
      comment: 'Found my dream home in 2 weeks with AI matching!', 
      initials: 'RK' 
    },
    { 
      name: 'Priya Sharma', 
      location: '2BHK Baner', 
      comment: 'Sold my property 20% above market rate with their AI pricing.', 
      initials: 'PS' 
    },
    { 
      name: 'Amit Patel', 
      location: '2BHK Hinjewadi', 
      comment: 'Seamless process from search to registration.', 
      initials: 'AP' 
    },
  ];

  testimonials.forEach((_, index) => {
    if (!animations[index]) animations[index] = new Animated.Value(0);
  });

  const activateCard = (index: number) => {
    if (timers[index]) clearTimeout(timers[index]);
    setActiveCard(index);
    Animated.timing(animations[index], {
      toValue: 1,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const releaseCard = (index: number) => {
    if (timers[index]) clearTimeout(timers[index]);
    timers[index] = setTimeout(() => {
      Animated.timing(animations[index], {
        toValue: 0,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
      setActiveCard(current => (current === index ? null : current));
    }, 650);
  };

  return (
    <View className="py-16 bg-white px-6">
      <View className="items-center mb-10">
        <Text className="text-3xl font-black text-gray-900 text-center tracking-tight">
          Customer Success Stories
        </Text>
        <Text className="text-gray-500 text-sm text-center mt-3 leading-5 font-medium px-4">
          See how our AI-powered solutions are helping people buy & sell properties smarter
        </Text>
      </View>

      <View className="gap-6">
        {testimonials.map((item, idx) => (
          <TestimonialCard
            key={item.name}
            item={item}
            index={idx}
            active={activeCard === idx}
            animation={animations[idx]}
            onActivate={() => activateCard(idx)}
            onRelease={() => releaseCard(idx)}
          />
        ))}
      </View>
    </View>
  );
};

const TestimonialCard = ({
  item,
  index,
  active,
  animation,
  onActivate,
  onRelease,
}: {
  item: { name: string; location: string; comment: string; initials: string };
  index: number;
  active: boolean;
  animation: Animated.Value;
  onActivate: () => void;
  onRelease: () => void;
}) => {
  const cardScale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.025],
  });
  const cardLift = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -7],
  });
  const avatarScale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.12],
  });
  const starLift = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -3],
  });

  return (
    <Pressable
      onHoverIn={onActivate}
      onHoverOut={onRelease}
      onPressIn={onActivate}
      onPressOut={onRelease}
      onPress={onActivate}
    >
      <Animated.View
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 24,
          padding: 32,
          borderWidth: 1,
          borderColor: active ? 'rgba(230,118,29,0.28)' : '#F3F4F6',
          borderTopWidth: 8,
          borderTopColor: '#E6761D',
          shadowColor: active ? '#E6761D' : '#0F172A',
          shadowOffset: { width: 0, height: active ? 16 : 8 },
          shadowOpacity: active ? 0.2 : 0.1,
          shadowRadius: active ? 22 : 12,
          elevation: active ? 12 : 6,
          transform: [{ translateY: cardLift }, { scale: cardScale }],
        }}
      >
        <Animated.View
          style={{ transform: [{ translateY: starLift }] }}
          className="flex-row gap-1.5 mb-5"
        >
          {[...Array(5)].map((_, i) => (
            <Star
              key={`${index}-${i}`}
              size={16}
              color="#E6761D"
              fill="#E6761D"
            />
          ))}
        </Animated.View>
        <Text className="text-gray-800 text-base italic leading-7 font-medium mb-6">
          "{item.comment}"
        </Text>
        <View className="flex-row items-center gap-4">
          <Animated.View
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              backgroundColor: active ? '#C95F0C' : '#E6761D',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#E6761D',
              shadowOffset: { width: 0, height: active ? 8 : 4 },
              shadowOpacity: active ? 0.26 : 0.14,
              shadowRadius: active ? 12 : 8,
              elevation: active ? 8 : 4,
              transform: [{ scale: avatarScale }],
            }}
          >
            <Text className="text-white font-black text-lg">{item.initials}</Text>
          </Animated.View>
          <View>
            <Text className="font-black text-gray-900 text-base">{item.name}</Text>
            <Text className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-0.5">
              {item.location}
            </Text>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
};

export default Testimonials;
