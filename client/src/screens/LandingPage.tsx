import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Image,
  Dimensions,
  StatusBar,
  Animated,
  Modal,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {
  ArrowDown,
  ArrowRight,
  Building2,
  TrendingUp,
  Cpu,
  Award,
  Target,
  Users,
  Globe,
  Zap,
  CheckCircle2,
  ChevronUp,
} from 'lucide-react-native';
import JourneySection from '../components/RealEstate/JourneySection';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const { width, height } = Dimensions.get('window');

// ======================= DATA =======================
const divisions = [
  {
    title: 'Real Estate',
    description:
      'Premium residential and commercial properties. Building dreams, creating landmarks.',
    icon: Building2,
    gradient: ['#4F46E5', '#9333EA'],
    iconColor: '#4F46E5',
    softBg: '#EEF2FF',
    hoverBorder: '#A5B4FC',
    image:
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&h=650',
    services: [
      'Property Development',
      'Commercial Buildings',
      'Residential Apartments',
      'Real Estate Investment',
    ],
  },
  {
    title: 'Finance',
    description:
      'Comprehensive financial solutions and investment services. Empowering financial freedom.',
    icon: TrendingUp,
    gradient: ['#059669', '#0D9488'],
    iconColor: '#059669',
    softBg: '#D1FAE5',
    hoverBorder: '#6EE7B7',
    image:
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&h=650',
    services: [
      'Financial Planning',
      'Investment Advisory',
      'Wealth Management',
      'Risk Analysis',
    ],
  },
  {
    title: 'IT & Technology',
    description:
      'Cutting-edge technology solutions and digital transformation. Innovating tomorrow.',
    icon: Cpu,
    gradient: ['#2563EB', '#06B6D4'],
    iconColor: '#2563EB',
    softBg: '#DBEAFE',
    hoverBorder: '#93C5FD',
    image:
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=900&h=650',
    services: [
      'Software Development',
      'IT Consulting',
      'Digital Transformation',
      'Cloud & Automation',
    ],
  },
];

const stats = [
  { value: '12+', label: 'Years Combined Experience', icon: Award },
  { value: '100+', label: 'Projects Completed', icon: Target },
  { value: '500+', label: 'Happy Clients', icon: Users },
  { value: '3', label: 'Industry Sectors', icon: Globe },
];

const features = [
  {
    title: 'Innovative Solutions',
    text: 'Cutting-edge approaches to modern challenges',
    icon: Zap,
  },
  {
    title: 'Award-Winning Service',
    text: 'Recognized excellence across industries',
    icon: Award,
  },
  {
    title: 'Proven Track Record',
    text: 'Decades of successful project delivery',
    icon: CheckCircle2,
  },
  {
    title: 'Global Presence',
    text: 'Serving clients across multiple regions',
    icon: Globe,
  },
];

const timeline = [
  {
    year: '2012-2018',
    title: 'AAKAR INFRA SERVICES - The Beginning',
    description:
      'Started with a vision in infrastructure development, focusing on quality construction and civil engineering projects. Built a strong foundation with residential and commercial construction, establishing partnerships with leading developers across the region.',
    badge: 'Founded with commitment to excellence',
    points: [
      'Civil Engineering',
      'Infrastructure Development',
      'Construction Management',
      'Site Planning',
      'Residential Projects',
      'Commercial Construction',
    ],
  },
  {
    year: '2019-2021',
    title: 'Digital Transformation & Growth',
    description:
      'Embraced technology and innovation, introducing digital solutions for project management and client engagement. Diversified operations and expanded service offerings to meet evolving market demands with smart construction techniques and IoT integration.',
    badge: 'Launched technology division',
    points: [
      'Smart Construction',
      'Digital Project Management',
      'Client Portals',
      'IoT Integration',
      'Project Consulting',
      'Quality Assurance',
    ],
  },
  {
    year: '2025 & Beyond',
    title: 'HOUSLY FINNTECH REALTY - The Future',
    description:
      'Rebranded to HOUSLY FINNTECH REALTY, unifying three powerful divisions under one visionary brand. A comprehensive multi-sector conglomerate leading innovation in real estate, finance, and technology. Building tomorrow, today with AI-powered solutions and global expansion.',
    badge: 'Shaping the future of integrated services',
    points: [
      'Real Estate Development',
      'Financial Technology',
      'IT Solutions',
      'AI-Powered Solutions',
      'Blockchain Integration',
      'Smart City Projects',
    ],
  },
];

// ======================= HELPER COMPONENTS =======================
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

const SectionTitle = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);
  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
        alignItems: 'center',
        marginBottom: 32,
      }}
    >
      <Text className="text-2xl font-extrabold text-slate-800 text-center">
        {title}
      </Text>
      <Text className="text-slate-500 text-center mt-2 text-sm leading-5 px-4">
        {subtitle}
      </Text>
    </Animated.View>
  );
};

const GradientPill = ({ text }: { text: string }) => (
  <View className="px-4 py-2 rounded-full border border-indigo-200 bg-white/90">
    <Text className="text-indigo-600 text-xs font-semibold tracking-wider uppercase">
      {text}
    </Text>
  </View>
);

const floatingDots = [
  { top: 42, left: 18, size: 6, color: '#60A5FA', delay: 0 },
  { top: 92, right: 24, size: 7, color: '#22D3EE', delay: 450 },
  { top: 176, left: 48, size: 7, color: '#34D399', delay: 900 },
  { top: 260, right: 96, size: 6, color: '#60A5FA', delay: 650 },
  { top: 344, left: 142, size: 5, color: '#22D3EE', delay: 250 },
  { bottom: 168, right: 54, size: 7, color: '#34D399', delay: 1150 },
  { bottom: 246, left: 86, size: 6, color: '#60A5FA', delay: 800 },
];

const FloatingDot = ({ dot }: { dot: any }) => {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(floatAnim, {
              toValue: 1,
              duration: 1500,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(floatAnim, {
              toValue: 0,
              duration: 1500,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(opacityAnim, {
              toValue: 0.9,
              duration: 1500,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0.45,
              duration: 1500,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
          ]),
        ]),
      ).start();
    }, dot.delay);

    return () => clearTimeout(timer);
  }, [dot.delay, floatAnim, opacityAnim]);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -12],
  });
  const rotate = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '5deg'],
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: dot.top,
        left: dot.left,
        right: dot.right,
        bottom: dot.bottom,
        width: dot.size,
        height: dot.size,
        borderRadius: dot.size / 2,
        backgroundColor: dot.color,
        opacity: opacityAnim,
        transform: [{ translateY }, { rotate }],
      }}
    />
  );
};

const FloatingDots = () => (
  <View
    pointerEvents="none"
    style={{
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      overflow: 'hidden',
    }}
  >
    {floatingDots.map((dot, index) => (
      <FloatingDot key={`${dot.color}-${index}`} dot={dot} />
    ))}
  </View>
);

const UnderDevelopmentModal = ({
  division,
  onClose,
}: {
  division: any;
  onClose: () => void;
}) => {
  if (!division) return null;
  const Icon = division.icon;

  return (
    <Modal
      transparent
      visible={Boolean(division)}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-slate-950/60 px-5 items-center justify-center">
        <Pressable className="absolute inset-0" onPress={onClose} />
        <View
          className="w-full max-w-md bg-white rounded-3xl overflow-hidden border-2"
          style={{
            borderColor: division.hoverBorder,
            shadowColor: division.gradient[0],
            shadowOpacity: 0.24,
            shadowRadius: 24,
            shadowOffset: { width: 0, height: 14 },
            elevation: 14,
          }}
        >
          <LinearGradient
            colors={division.gradient}
            style={{ paddingHorizontal: 22, paddingVertical: 24 }}
          >
            <View className="flex-row items-center justify-between">
              <View className="w-14 h-14 rounded-2xl bg-white/20 items-center justify-center border border-white/30">
                <Icon size={28} color="#fff" />
              </View>
              <View className="px-3 py-1.5 rounded-full bg-white/20 border border-white/25">
                <Text className="text-white text-[11px] font-black uppercase tracking-wider">
                  Coming Soon
                </Text>
              </View>
            </View>
            <Text className="text-white text-2xl font-black mt-5">
              {division.title}
            </Text>
            <Text className="text-white/85 text-sm leading-5 mt-2">
              This division is currently under development.
            </Text>
          </LinearGradient>

          <View className="p-5">
            <Text className="text-slate-700 text-sm leading-6">
              We are preparing a dedicated experience for {division.title}.
              Services and details will be available soon.
            </Text>
            <View className="flex-row flex-wrap mt-4">
              {division.services.map((service: string) => (
                <View
                  key={service}
                  className="mr-2 mb-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200"
                >
                  <Text className="text-slate-600 text-[11px] font-bold">
                    {service}
                  </Text>
                </View>
              ))}
            </View>
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.9}
              className="mt-5 rounded-2xl overflow-hidden"
            >
              <LinearGradient
                colors={division.gradient}
                style={{ paddingVertical: 13, alignItems: 'center' }}
              >
                <Text className="text-white font-black text-sm">
                  Okay, Got It
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const heroDivisionPills = [
  { label: 'Real Estate', icon: Building2, color: '#4F46E5' },
  { label: 'Finance', icon: TrendingUp, color: '#059669' },
  { label: 'Technology', icon: Cpu, color: '#2563EB' },
];

const HeroDivisionPill = ({ item, index, visible }: any) => {
  const Icon = item.icon;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(18)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const shineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          delay: 250 + index * 120,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(translateAnim, {
          toValue: 0,
          delay: 250 + index * 120,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [index, opacityAnim, translateAnim, visible]);

  const setActive = (active: boolean) => {
    Animated.parallel([
      Animated.timing(rotateAnim, {
        toValue: active ? 1 : 0,
        duration: 700,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(shineAnim, {
        toValue: active ? 1 : 0,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const pulseOnce = () => {
    setActive(true);
    setTimeout(() => setActive(false), 760);
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  const scale = shineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.06],
  });

  return (
    <Pressable
      onPress={pulseOnce}
      onHoverIn={() => setActive(true)}
      onHoverOut={() => setActive(false)}
      style={{ marginRight: 8, marginBottom: 8 }}
    >
      <Animated.View
        style={{
          opacity: opacityAnim,
          transform: [{ translateY: translateAnim }, { scale }],
          shadowColor: item.color,
          shadowOpacity: 0.12,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 8 },
          elevation: 5,
        }}
        className="bg-white rounded-2xl border border-slate-200 px-4 py-3 overflow-hidden"
      >
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            opacity: shineAnim,
          }}
        >
          <LinearGradient
            colors={[`${item.color}20`, 'rgba(255,255,255,0)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ flex: 1 }}
          />
        </Animated.View>
        <View className="flex-row items-center">
          <Animated.View
            className="w-9 h-9 rounded-xl items-center justify-center mr-2"
            style={{
              backgroundColor: `${item.color}20`,
              transform: [{ rotate }],
            }}
          >
            <Icon size={18} color={item.color} />
          </Animated.View>
          <Text className="text-slate-700 font-medium text-sm">
            {item.label}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
};
// ======================= AAKAR HERITAGE (centered, small bottom spinner, animates upward & hides) =======================
const AakarHeritage = ({ onHide }: { onHide: () => void }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance fade-in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Gentle pulse effect on the small loader
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Auto-hide after 3 seconds: animate upward and fade out
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateYAnim, {
          toValue: -height,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start(() => onHide());
    }, 3000);

    return () => clearTimeout(timer);
  }, [fadeAnim, onHide, pulseAnim, translateYAnim]);

  return (
    <Animated.View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: fadeAnim,
        transform: [{ translateY: translateYAnim }],
        paddingHorizontal: 16,
        minHeight: height * 0.8,
      }}
    >
      <View className="items-center">
        {/* Main AAKAR content */}
        <View className="flex-row items-center gap-2 mb-6">
          <View className="h-px w-6 bg-gradient-to-r from-transparent to-slate-300" />
          <Text className="text-xs font-medium text-slate-400 uppercase tracking-[0.3em]">
            Est. 2013
          </Text>
          <View className="h-px w-6 bg-gradient-to-l from-transparent to-slate-300" />
        </View>
        <Text className="text-5xl font-medium text-slate-800 tracking-tight">
          AAKAR
        </Text>
        <View className="h-px w-24 bg-gradient-to-r from-transparent via-slate-300 to-transparent my-4" />
        <Text className="text-xl font-extralight text-slate-500 tracking-wide">
          Infra Services
        </Text>
        <Text className="text-sm text-slate-600 font-light max-w-md text-center mt-6 leading-relaxed">
          Experts in Real Estate Mandates, Construction, and More Since 2013
        </Text>
        <View className="flex-row flex-wrap justify-center gap-4 mt-4">
          <View className="flex-row items-center gap-2">
            <View className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <Text className="text-xs text-slate-500">10+ Years</Text>
          </View>
          <View className="w-px h-3 bg-slate-300" />
          <View className="flex-row items-center gap-2">
            <View className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <Text className="text-xs text-slate-500">390+ Projects</Text>
          </View>
          <View className="w-px h-3 bg-slate-300" />
          <View className="flex-row items-center gap-2">
            <View className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <Text className="text-xs text-slate-500">Pune & PCMC</Text>
          </View>
        </View>
        <View className="mt-4 flex-row flex-wrap justify-center gap-2 text-xs text-slate-500">
          <Text>Real Estate Mandates</Text>
          <Text className="text-slate-300">•</Text>
          <Text>Construction & Building</Text>
          <Text className="text-slate-300">•</Text>
          <Text>Digital Marketing</Text>
          <Text className="text-slate-300">•</Text>
          <Text>Finance & Home Loans</Text>
        </View>

        {/* Small elegant loader at the bottom */}
        <View className="mt-8 items-center">
          <Animated.View
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: '#0076D8',
              transform: [{ scale: pulseAnim }],
              marginBottom: 8,
            }}
          />
          <Text className="text-indigo-600 text-xs font-medium tracking-wider">
            SEARCHING FOR FUTURE
          </Text>
        </View>
      </View>
    </Animated.View>
  );
};
// ======================= HOUSLY HERO =======================
const HouslyHero = ({
  onScrollDown,
  visible,
}: {
  onScrollDown: () => void;
  visible: boolean;
}) => {
  const scaleAnim = useRef(new Animated.Value(0.96)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(30)).current;
  const titleSlide = useRef(new Animated.Value(20)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const scrollIndicatorAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ]).start();
      Animated.parallel([
        Animated.timing(titleSlide, {
          toValue: 0,
          delay: 150,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(titleOpacity, {
          toValue: 1,
          delay: 150,
          duration: 700,
          useNativeDriver: true,
        }),
      ]).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(scrollIndicatorAnim, {
            toValue: 8,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(scrollIndicatorAnim, {
            toValue: 0,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }
  }, [
    opacityAnim,
    scaleAnim,
    scrollIndicatorAnim,
    titleOpacity,
    titleSlide,
    translateYAnim,
    visible,
  ]);

  if (!visible) return null;

  return (
    <View className="px-5 pt-16 pb-10">
      <Animated.View
        style={{
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }, { translateY: translateYAnim }],
          alignItems: 'center',
        }}
      >
        <View className="mb-3">
          <GradientPill text="Reimagined 2025" />
        </View>
        <Animated.Text
          style={{
            opacity: titleOpacity,
            transform: [{ translateY: titleSlide }],
            fontSize: 44,
            fontWeight: '900',
            letterSpacing: -0.5,
            color: '#0076D8',
          }}
        >
          HOUSLY
        </Animated.Text>
        <Text className="text-slate-700 text-xl font-light tracking-[4px] mt-2 text-center">
          FINNTECH REALTY
        </Text>
        <Text className="text-slate-600 text-center mt-6 text-base leading-7 px-3">
          From building infrastructure to building futures. Our 12-year legacy
          continues with an expanded vision—unifying real estate, finance, and
          technology under one innovative brand.
        </Text>
        <View className="flex-row flex-wrap justify-center gap-3 mt-6">
          {heroDivisionPills.map((item, index) => (
            <HeroDivisionPill
              key={item.label}
              item={item}
              index={index}
              visible={visible}
            />
          ))}
        </View>
        <Text className="text-slate-600 text-center mt-6 text-base px-4 leading-6">
          Building integrated solutions across real estate, finance, and
          technology.
        </Text>
        {/* One Vision, Three Verticals, Limitless Possibilities with animated dots */}
        <View className="flex-row flex-wrap justify-center items-center mt-5">
          {['One Vision', 'Three Verticals', 'Limitless Possibilities'].map(
            (item, i) => (
              <View key={item} className="flex-row items-center mx-2 my-1">
                <Text className="text-slate-600 font-semibold text-sm">
                  {item}
                </Text>
                {i < 2 && (
                  <View className="ml-3 w-1.5 h-1.5 rounded-full bg-slate-400" />
                )}
              </View>
            ),
          )}
        </View>
        <TouchableOpacity onPress={onScrollDown} activeOpacity={0.9}>
          <LinearGradient
            colors={['#0076D8', '#06B6D4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: 999,
              paddingHorizontal: 24,
              paddingVertical: 16,
              marginTop: 26,
              shadowColor: '#0076D8',
              shadowOpacity: 0.25,
              shadowRadius: 18,
              shadowOffset: { width: 0, height: 8 },
              elevation: 8,
            }}
          >
            <View className="flex-row items-center">
              <Text className="text-white font-semibold text-base mr-2">
                Explore Our Divisions
              </Text>
              <ArrowDown size={18} color="#fff" />
            </View>
          </LinearGradient>
        </TouchableOpacity>
        <Animated.View
          style={{
            alignItems: 'center',
            marginTop: 32,
            transform: [{ translateY: scrollIndicatorAnim }],
          }}
        >
          <Text className="text-slate-500 text-sm mb-2">Scroll down</Text>
          <View className="w-6 h-10 rounded-full border-2 border-slate-400 items-center pt-2">
            <View className="w-1.5 h-2 rounded-full bg-slate-400" />
          </View>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

// ======================= DIVISION CARD =======================
const DivisionCard = ({ item, index, visible, onPress }: any) => {
  const Icon = item.icon;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(28)).current;
  const hoverAnim = useRef(new Animated.Value(0)).current;
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          delay: index * 140,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(translateAnim, {
          toValue: 0,
          delay: index * 140,
          duration: 700,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [index, opacityAnim, translateAnim, visible]);

  const setHover = (next: boolean) => {
    setHovered(next);
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: next ? 1.02 : 1,
        friction: 8,
        tension: 70,
        useNativeDriver: true,
      }),
      Animated.timing(hoverAnim, {
        toValue: next ? 1 : 0,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const onPressIn = () => setHover(true);
  const onPressOut = () => setHover(false);
  const imageScale = hoverAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1],
  });
  const servicesTranslate = hoverAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [14, 0],
  });
  const iconRotate = hoverAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '12deg'],
  });
  const bottomScale = hoverAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  if (!visible) return null;

  return (
    <Pressable
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onHoverIn={() => setHover(true)}
      onHoverOut={() => setHover(false)}
      onPress={onPress}
      style={{ width: width >= 980 ? '32%' : width >= 620 ? '48%' : '100%' }}
    >
      <Animated.View
        style={{
          opacity: opacityAnim,
          transform: [{ translateY: translateAnim }, { scale: scaleAnim }],
          marginBottom: 20,
        }}
      >
        <View
          className="bg-white rounded-2xl overflow-hidden shadow-lg"
          style={{
            borderWidth: 1,
            borderColor: hovered ? 'transparent' : '#E2E8F0',
            shadowColor: item.gradient[0],
            shadowOpacity: hovered ? 0.24 : 0.1,
            shadowRadius: hovered ? 24 : 10,
            shadowOffset: { width: 0, height: hovered ? 14 : 6 },
            elevation: hovered ? 10 : 4,
          }}
        >
          <Animated.View
            style={{
              position: 'absolute',
              inset: 0 as any,
              opacity: hoverAnim,
            }}
          >
            <LinearGradient colors={item.gradient} style={{ flex: 1 }} />
          </Animated.View>
          <View className="relative">
            <Animated.Image
              source={{ uri: item.image }}
              style={{
                width: '100%',
                height: 220,
                transform: [{ scale: imageScale }],
              }}
              resizeMode="cover"
            />
            <View className="absolute inset-0 bg-black/20" />
            <Animated.View
              className="absolute top-4 right-4 bg-white/90 rounded-2xl p-3"
              style={{
                transform: [
                  { rotate: iconRotate },
                  { scale: hovered ? 1.08 : 1 },
                ],
              }}
            >
              <Icon size={22} color={item.iconColor} />
            </Animated.View>
            <Animated.View
              style={{
                position: 'absolute',
                inset: 0 as any,
                opacity: hoverAnim,
              }}
            >
              <LinearGradient
                colors={['transparent', `${item.gradient[0]}55`]}
                style={{ flex: 1 }}
              />
            </Animated.View>
          </View>
          <View className="relative px-5 pb-5">
            <Animated.View
              className="-mt-6 mb-4"
              style={{
                transform: [
                  {
                    rotate: hoverAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '-6deg'],
                    }),
                  },
                  { scale: hovered ? 1.08 : 1 },
                ],
              }}
            >
              <LinearGradient
                colors={item.gradient}
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: 18,
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: item.gradient[0],
                  shadowOpacity: 0.25,
                  shadowRadius: 12,
                  shadowOffset: { width: 0, height: 6 },
                  elevation: 6,
                }}
              >
                <Icon size={24} color="#fff" />
              </LinearGradient>
            </Animated.View>
            <Text
              style={{
                color: hovered ? 'white' : '#1E293B',
                fontSize: 24,
                fontWeight: '800',
              }}
            >
              {item.title}
            </Text>
            <Text
              style={{
                color: hovered ? '#E2E8F0' : '#475569',
                marginTop: 8,
                lineHeight: 22,
                fontSize: 14,
              }}
            >
              {item.description}
            </Text>
            <Animated.View
              style={{
                marginTop: 16,
                opacity: hoverAnim,
                transform: [{ translateY: servicesTranslate }],
              }}
            >
              <View className="flex-row flex-wrap">
                {item.services.map((service: string) => (
                  <View
                    key={service}
                    className="mr-2 mb-2 flex-row items-center"
                  >
                    <View
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: 999,
                        backgroundColor: hovered ? 'white' : item.iconColor,
                        marginRight: 6,
                      }}
                    />
                    <Text
                      style={{
                        color: hovered ? '#CBD5E1' : '#64748B',
                        fontSize: 11,
                        fontWeight: '600',
                      }}
                    >
                      {service}
                    </Text>
                  </View>
                ))}
              </View>
            </Animated.View>
            <View className="mt-5 flex-row items-center">
              <Text
                style={{
                  color: hovered ? 'white' : '#2563EB',
                  fontWeight: '700',
                  fontSize: 14,
                  marginRight: 8,
                }}
              >
                Explore Division
              </Text>
              <Animated.View
                style={{
                  transform: [
                    {
                      translateX: hoverAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 8],
                      }),
                    },
                    { scale: hovered ? 1.1 : 1 },
                  ],
                }}
              >
                <ArrowRight size={16} color={hovered ? 'white' : '#2563EB'} />
              </Animated.View>
            </View>
          </View>
          <Animated.View
            style={{
              height: 5,
              transform: [{ scaleX: bottomScale }],
              transformOrigin: 'left' as any,
            }}
          >
            <LinearGradient colors={item.gradient} style={{ flex: 1 }} />
          </Animated.View>
        </View>
      </Animated.View>
    </Pressable>
  );
};

// ======================= STAT CARD =======================
const CountUpNumber = ({
  value,
  visible,
}: {
  value: string;
  visible: boolean;
}) => {
  const numericValue = Number(String(value).replace(/[^0-9]/g, ''));
  const suffix = String(value).replace(/[0-9]/g, '');
  const [displayValue, setDisplayValue] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!visible) {
      setDisplayValue(0);
      hasAnimated.current = false;
      return undefined;
    }

    if (hasAnimated.current) return undefined;

    hasAnimated.current = true;
    const delay = setTimeout(() => {
      const startedAt = Date.now();
      const duration = 1350;
      const timer = setInterval(() => {
        const progress = Math.min(1, (Date.now() - startedAt) / duration);
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        setDisplayValue(Math.round(numericValue * easedProgress));

        if (progress >= 1) {
          clearInterval(timer);
          setDisplayValue(numericValue);
        }
      }, 16);
    }, 120);

    return () => clearTimeout(delay);
  }, [numericValue, visible]);

  return (
    <Text className="text-3xl font-black text-slate-800">
      {displayValue}
      {suffix}
    </Text>
  );
};

const StatCard = ({ item, index, visible, countActive }: any) => {
  const Icon = item.icon;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(20)).current;
  const hoverAnim = useRef(new Animated.Value(0)).current;
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          delay: index * 120,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          delay: index * 120,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(translateAnim, {
          toValue: 0,
          delay: index * 120,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [index, opacityAnim, scaleAnim, translateAnim, visible]);

  const setHover = (next: boolean) => {
    setHovered(next);
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: next ? 1.015 : 1,
        friction: 10,
        tension: 65,
        useNativeDriver: true,
      }),
      Animated.timing(hoverAnim, {
        toValue: next ? 1 : 0,
        duration: 360,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const pulseHover = () => {
    setHover(true);
    setTimeout(() => setHover(false), 650);
  };

  const iconRotate = hoverAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '8deg'],
  });
  const lift = hoverAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -3],
  });
  const numberScale = hoverAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.025],
  });
  const rippleScale = hoverAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1.65],
  });
  const rippleOpacity = hoverAnim.interpolate({
    inputRange: [0, 0.55, 1],
    outputRange: [0, 0.24, 0],
  });
  const innerRippleScale = hoverAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.92, 1.28],
  });
  const innerRippleOpacity = hoverAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.2],
  });

  if (!visible) return null;

  return (
    <Pressable
      onHoverIn={() => setHover(true)}
      onHoverOut={() => setHover(false)}
      onPressIn={() => setHover(true)}
      onPressOut={() => setHover(false)}
      onPress={pulseHover}
      style={
        { width: (width - 56) / 2, marginBottom: 16, cursor: 'pointer' } as any
      }
    >
      <Animated.View
        style={{
          opacity: opacityAnim,
          transform: [
            { scale: scaleAnim },
            { translateY: Animated.add(translateAnim, lift) },
          ],
          shadowColor: '#0284C7',
          shadowOpacity: hovered ? 0.24 : 0.1,
          shadowRadius: hovered ? 24 : 10,
          shadowOffset: { width: 0, height: hovered ? 14 : 6 },
          elevation: hovered ? 10 : 4,
        }}
      >
        <View
          className="bg-white rounded-2xl p-4 border min-h-[150px] overflow-hidden"
          style={{ borderColor: hovered ? '#BAE6FD' : '#E2E8F0' }}
        >
          <Animated.View
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              opacity: hoverAnim,
            }}
          >
            <LinearGradient
              colors={[
                'rgba(59,130,246,0.10)',
                'rgba(34,211,238,0.03)',
                'rgba(255,255,255,0)',
              ]}
              style={{ flex: 1 }}
            />
          </Animated.View>
          <View
            style={{
              width: 60,
              height: 58,
              marginBottom: 8,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Animated.View
              style={{
                position: 'absolute',
                width: 52,
                height: 52,
                borderRadius: 26,
                borderWidth: 1,
                borderColor: '#38BDF8',
                opacity: rippleOpacity,
                transform: [{ scale: rippleScale }],
              }}
            />
            <Animated.View
              style={{
                position: 'absolute',
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: 'rgba(56,189,248,0.18)',
                opacity: innerRippleOpacity,
                transform: [{ scale: innerRippleScale }],
              }}
            />
            <Animated.View
              style={{
                transform: [
                  { rotate: iconRotate },
                  { scale: hovered ? 1.025 : 1 },
                ],
              }}
            >
              <LinearGradient
                colors={['#3B82F6', '#06B6D4']}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 15,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon size={21} color="#fff" />
              </LinearGradient>
            </Animated.View>
          </View>
          <Animated.View style={{ transform: [{ scale: numberScale }] }}>
            <CountUpNumber value={item.value} visible={countActive} />
          </Animated.View>
          <Text className="text-slate-600 text-sm mt-2 leading-5">
            {item.label}
          </Text>
          <Animated.View
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: 4,
              opacity: hoverAnim,
            }}
          >
            <LinearGradient
              colors={['#3B82F6', '#06B6D4']}
              style={{ flex: 1 }}
            />
          </Animated.View>
        </View>
      </Animated.View>
    </Pressable>
  );
};

// ======================= FEATURE CARD =======================
const FeatureCard = ({ item, index, visible }: any) => {
  const Icon = item.icon;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(20)).current;
  const hoverAnim = useRef(new Animated.Value(0)).current;
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          delay: index * 120,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(translateAnim, {
          toValue: 0,
          delay: index * 120,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [index, opacityAnim, translateAnim, visible]);

  const setHover = (next: boolean) => {
    setHovered(next);
    Animated.timing(hoverAnim, {
      toValue: next ? 1 : 0,
      duration: 320,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const lift = hoverAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -6],
  });
  const iconScale = hoverAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });
  const arrowSlide = hoverAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-4, 0],
  });

  if (!visible) return null;
  return (
    <Pressable
      onHoverIn={() => setHover(true)}
      onHoverOut={() => setHover(false)}
      onPressIn={() => setHover(true)}
      onPressOut={() => setHover(false)}
      style={{ width: '48%', marginBottom: 16 }}
    >
      <Animated.View
        style={{
          opacity: opacityAnim,
          transform: [{ translateY: Animated.add(translateAnim, lift) }],
          shadowColor: '#0284C7',
          shadowOpacity: hovered ? 0.16 : 0.06,
          shadowRadius: hovered ? 18 : 8,
          shadowOffset: { width: 0, height: hovered ? 10 : 4 },
          elevation: hovered ? 8 : 3,
        }}
      >
        <View className="bg-white rounded-2xl p-4 border border-slate-200 min-h-[150px] overflow-hidden">
          <Animated.View
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              opacity: hoverAnim,
            }}
          >
            <LinearGradient
              colors={['rgba(59,130,246,0.10)', 'rgba(16,185,129,0.03)']}
              style={{ flex: 1 }}
            />
          </Animated.View>
          <Animated.View style={{ transform: [{ scale: iconScale }] }}>
            <LinearGradient
              colors={['#3B82F6', '#06B6D4']}
              style={{
                width: 42,
                height: 42,
                borderRadius: 14,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <Icon size={18} color="#fff" />
            </LinearGradient>
          </Animated.View>
          <Text className="text-slate-800 font-bold text-base">
            {item.title}
          </Text>
          <Text className="text-slate-600 text-sm leading-5 mt-2">
            {item.text}
          </Text>
          <Animated.View
            style={{
              marginTop: 12,
              opacity: hoverAnim,
              transform: [{ translateX: arrowSlide }],
            }}
            className="flex-row items-center"
          >
            <Text className="text-blue-600 text-xs font-bold mr-1">
              Explore
            </Text>
            <ArrowRight size={13} color="#2563EB" />
          </Animated.View>
        </View>
      </Animated.View>
    </Pressable>
  );
};

// ======================= TIMELINE CARD =======================
const TimelineCard = ({ item, index, visible, lineProgress }: any) => {
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(-20)).current;
  const hoverAnim = useRef(new Animated.Value(0)).current;
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          delay: index * 180,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(translateAnim, {
          toValue: 0,
          delay: index * 180,
          duration: 700,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [index, opacityAnim, translateAnim, visible]);

  const setHover = (next: boolean) => {
    setHovered(next);
    Animated.timing(hoverAnim, {
      toValue: next ? 1 : 0,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const lift = hoverAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -5],
  });
  const cardScale = hoverAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.015],
  });
  const segmentProgress = lineProgress.interpolate({
    inputRange: [
      index / (timeline.length - 1),
      (index + 1) / (timeline.length - 1),
    ],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  if (!visible) return null;
  return (
    <Animated.View
      style={{
        flexDirection: 'row',
        marginBottom: 32,
        opacity: opacityAnim,
        transform: [{ translateX: translateAnim }],
      }}
    >
      <View className="items-center mr-4">
        <View className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow" />
        {index < timeline.length - 1 && (
          <View
            style={{
              width: 2,
              flex: 1,
              backgroundColor: 'rgba(250,204,21,0.22)',
              marginTop: 4,
              overflow: 'hidden',
            }}
          >
            <Animated.View
              style={{
                width: 2,
                flex: 1,
                backgroundColor: '#FACC15',
                transform: [{ scaleY: segmentProgress }],
                transformOrigin: 'top' as any,
              }}
            />
          </View>
        )}
      </View>
      <Pressable
        onHoverIn={() => setHover(true)}
        onHoverOut={() => setHover(false)}
        onPressIn={() => setHover(true)}
        onPressOut={() => setHover(false)}
        style={{ flex: 1 }}
      >
        <Animated.View
          className="flex-1 bg-white/95 rounded-2xl p-4 border border-slate-200 shadow-lg"
          style={{
            transform: [{ translateY: lift }, { scale: cardScale }],
            borderColor: hovered ? '#BAE6FD' : '#E2E8F0',
            shadowColor: '#0284C7',
            shadowOpacity: hovered ? 0.18 : 0.08,
            shadowRadius: hovered ? 18 : 8,
            shadowOffset: { width: 0, height: hovered ? 10 : 4 },
            elevation: hovered ? 8 : 3,
          }}
        >
          <LinearGradient
            colors={['#3B82F6', '#06B6D4']}
            style={{
              alignSelf: 'flex-start',
              borderRadius: 999,
              paddingHorizontal: 12,
              paddingVertical: 6,
              marginBottom: 10,
            }}
          >
            <Text className="text-white text-xs font-bold">{item.year}</Text>
          </LinearGradient>
          <Text className="text-slate-800 text-lg font-extrabold">
            {item.title}
          </Text>
          <Text className="text-slate-600 text-sm leading-6 mt-2">
            {item.description}
          </Text>
          <View className="mt-3 bg-emerald-50 rounded-xl px-3 py-2 self-start border border-emerald-100">
            <Text className="text-emerald-700 text-xs font-semibold">
              {item.badge}
            </Text>
          </View>
          <View className="pt-3 mt-3 border-t border-slate-100">
            <Text className="text-slate-700 text-xs font-bold mb-2">
              Key Services:
            </Text>
            <View className="flex-row flex-wrap">
              {item.points.map((point: string) => (
                <View
                  key={point}
                  className="flex-row items-center mb-2 pr-2"
                  style={{ width: '50%' }}
                >
                  <LinearGradient
                    colors={['#3B82F6', '#06B6D4']}
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 999,
                      marginRight: 6,
                    }}
                  />
                  <Text className="text-slate-600 text-[10px] flex-1">
                    {point}
                  </Text>
                </View>
              ))}
            </View>
          </View>
          <Animated.View
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: 3,
              opacity: hoverAnim,
            }}
          >
            <LinearGradient
              colors={['#3B82F6', '#06B6D4']}
              style={{
                flex: 1,
                borderBottomLeftRadius: 16,
                borderBottomRightRadius: 16,
              }}
            />
          </Animated.View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

// ======================= MAIN COMPONENT =======================
export default function LandingPage() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [showAakar, setShowAakar] = useState(true);
  const [showMain, setShowMain] = useState(false);
  const [developmentDivision, setDevelopmentDivision] = useState<any>(null);
  const [impactLayout, setImpactLayout] = useState({ y: 0, height: 1 });
  const [impactActive, setImpactActive] = useState(false);
  const [timelineLayout, setTimelineLayout] = useState({ y: 0, height: 1 });
  const scrollRef = useRef<ScrollView>(null);
  const progressWidthAnim = useRef(new Animated.Value(0)).current;
  const timelineProgressAnim = useRef(new Animated.Value(0)).current;

  const scrollToDivisions = () =>
    scrollRef.current?.scrollTo({ y: 720, animated: true });
  const scrollToTop = () =>
    scrollRef.current?.scrollTo({ y: 0, animated: true });

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const contentHeight = event.nativeEvent.contentSize.height;
    const scrollViewHeight = event.nativeEvent.layoutMeasurement.height;
    const scrollPercentage = offsetY / (contentHeight - scrollViewHeight);
    progressWidthAnim.setValue(
      Math.min(1, Math.max(0, scrollPercentage)) * 100,
    );

    if (!impactActive && impactLayout.height > 1) {
      const triggerPoint = offsetY + scrollViewHeight * 0.78;
      if (triggerPoint >= impactLayout.y) {
        setImpactActive(true);
      }
    }

    if (timelineLayout.height > 1) {
      const revealPoint = offsetY + scrollViewHeight * 0.7;
      const nextProgress =
        (revealPoint - timelineLayout.y) /
        Math.max(1, timelineLayout.height - 80);
      timelineProgressAnim.setValue(Math.min(1, Math.max(0, nextProgress)));
    }
  };

  const logoOpacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(logoOpacity, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
    const timer = setTimeout(() => setShowMain(true), 3800);
    return () => clearTimeout(timer);
  }, [logoOpacity]);

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" />
      <View className="absolute top-0 left-0 right-0 h-1 bg-slate-200 z-50">
        <AnimatedLinearGradient
          colors={['#3B82F6', '#06B6D4', '#10B981']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            width: progressWidthAnim.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }),
            height: 4,
          }}
        />
      </View>

      <Animated.View
        style={{
          position: 'absolute',
          top: 72,
          left: 16,
          zIndex: 40,
          opacity: logoOpacity,
        }}
      >
        <Image
          source={{ uri: 'https://hously.in/assets/hously-logo-CrQCrCBN.png' }}
          style={{ width: 120, height: 40, resizeMode: 'contain' }}
        />
      </Animated.View>

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        scrollEventThrottle={16}
        onScroll={handleScroll}
      >
        <LinearGradient
          colors={['#F8FAFC', '#EFF6FF', '#F1F5F9']}
          style={{ flex: 1 }}
        >
          <FloatingDots />
          {showAakar && <AakarHeritage onHide={() => setShowAakar(false)} />}
          {showMain && (
            <>
              <HouslyHero onScrollDown={scrollToDivisions} visible={showMain} />
              <View className="px-5 mt-2">
                <SectionTitle
                  title="Explore Our Divisions"
                  subtitle="Click on any division to access specialized services"
                />
                <View className="flex-row flex-wrap justify-between">
                  {divisions.map((item, index) => (
                    <DivisionCard
                      key={index}
                      item={item}
                      index={index}
                      visible={showMain}
                      onPress={() =>
                        item.title === 'Real Estate'
                          ? navigation.navigate('RealEstate')
                          : setDevelopmentDivision(item)
                      }
                    />
                  ))}
                </View>
              </View>

              <View
                className="px-5 mt-8"
                onLayout={event => {
                  const nextLayout = event.nativeEvent.layout;
                  setImpactLayout(current =>
                    current.y === nextLayout.y &&
                    current.height === nextLayout.height
                      ? current
                      : { y: nextLayout.y, height: nextLayout.height },
                  );
                }}
              >
                <SectionTitle
                  title="Our Impact in Numbers"
                  subtitle="Excellence measured through achievements"
                />
                <View className="flex-row flex-wrap justify-between">
                  {stats.map((item, index) => (
                    <StatCard
                      key={index}
                      item={item}
                      index={index}
                      visible={showMain}
                      countActive={impactActive}
                    />
                  ))}
                </View>
              </View>

              <View className="px-5 mt-8">
                <SectionTitle
                  title="Why Choose Us"
                  subtitle="What sets us apart from the rest"
                />
                <View className="flex-row flex-wrap justify-between">
                  {features.map((item, index) => (
                    <FeatureCard
                      key={index}
                      item={item}
                      index={index}
                      visible={showMain}
                    />
                  ))}
                </View>
              </View>

              <View
                className="px-5 mt-8"
                onLayout={event => {
                  const nextLayout = event.nativeEvent.layout;
                  setTimelineLayout(current =>
                    current.y === nextLayout.y &&
                    current.height === nextLayout.height
                      ? current
                      : { y: nextLayout.y, height: nextLayout.height },
                  );
                }}
              >
                <SectionTitle
                  title="Our Transformation Journey"
                  subtitle="From vision to Realty"
                />
                <View className="mt-2">
                  {timeline.map((item, index) => (
                    <TimelineCard
                      key={index}
                      item={item}
                      index={index}
                      visible={showMain}
                      lineProgress={timelineProgressAnim}
                    />
                  ))}
                </View>
              </View>

              <JourneySection />

              <View className="bg-slate-900 px-5 py-6">
                <Text className="text-slate-400 text-center text-sm">
                  © 2026 Hously Finntech Realty. All rights reserved.
                </Text>
              </View>
            </>
          )}
        </LinearGradient>
      </ScrollView>

      <TouchableOpacity
        onPress={scrollToTop}
        activeOpacity={0.9}
        className="absolute right-5 bottom-6"
      >
        <LinearGradient
          colors={['#3B82F6', '#06B6D4']}
          style={{
            width: 56,
            height: 56,
            borderRadius: 999,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#0EA5E9',
            shadowOpacity: 0.3,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: 8 },
            elevation: 10,
          }}
        >
          <ChevronUp size={24} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
      <UnderDevelopmentModal
        division={developmentDivision}
        onClose={() => setDevelopmentDivision(null)}
      />
    </SafeAreaView>
  );
}
