import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  StyleSheet,
  ImageStyle,
} from 'react-native';
import {
  CircleCheckBig,
  TrendingUp,
  Home,
  Users,
  Award,
  Building,
  Shield,
  Target,
  Star,
  Heart,
  Crown,
  Rocket,
} from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import Footer from '../components/RealEstate/Footer';
import { useCmsContent } from '../hooks/useCmsContent';

const aboutFallback = {
  heroTitle: 'About ResaleExpert',
  heroSubtitle:
    'A trusted real estate platform for verified resale properties, expert guidance, and transparent property transactions.',
  heroStats: [
    { value: '12+', label: 'Years Experience' },
    { value: '10K+', label: 'Properties Sold' },
    { value: '25K+', label: 'Happy Customers' },
  ],
  missionTitle: 'Our Mission',
  missionText:
    'To make real estate transactions transparent, efficient, and accessible for everyone.',
  missionPoints: [
    '100% Verified Properties',
    'Expert Legal Guidance',
    'End-to-End Support',
    'AI-Powered Matching',
  ],
  missionImage:
    'https://res.cloudinary.com/dblem9twa/image/upload/v1780234219/hously/about/rk5nrzszvtqxmnockece.jpg',
  impactStats: [],
  values: [],
  team: [
    {
      name: 'Laxman Vhadade',
      role: 'Founder & CEO',
      exp: '15+ years experience',
      special: 'Specializes in luxury and resale properties',
      image:
        'https://res.cloudinary.com/dblem9twa/image/upload/v1780234220/hously/about/af1ebpnrwiuwxt2sde87.jpg',
    },
  ],
};

const parseStatValue = (value: string | number) => {
  const raw = String(value ?? '0').trim();
  const match = raw.match(/^([\d,.]+)\s*([KkMm])?(\+)?(.*)$/);

  if (!match) {
    return { target: 0, compactSuffix: '', trailing: raw, decimals: 0 };
  }

  const numericText = match[1].replace(/,/g, '');
  const baseNumber = Number(numericText) || 0;
  const compactSuffix = (match[2] || '').toUpperCase();
  const decimals = numericText.includes('.')
    ? numericText.split('.')[1].length
    : 0;

  return {
    target: baseNumber,
    compactSuffix,
    trailing: `${match[3] || ''}${match[4] || ''}`,
    decimals,
  };
};

const CountUpValue = ({ value }: { value: string | number }) => {
  const { target, compactSuffix, trailing, decimals } = useMemo(
    () => parseStatValue(value),
    [value],
  );
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const duration = 1300;
    const frameMs = 16;
    const startedAt = Date.now();

    setCurrent(0);
    const timer = setInterval(() => {
      const progress = Math.min((Date.now() - startedAt) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setCurrent(target * easedProgress);

      if (progress >= 1) {
        clearInterval(timer);
        setCurrent(target);
      }
    }, frameMs);

    return () => clearInterval(timer);
  }, [target]);

  const formattedValue =
    decimals > 0 ? current.toFixed(decimals) : Math.round(current).toString();

  return (
    <Text style={styles.impactValue}>
      {formattedValue}
      {compactSuffix}
      {trailing}
    </Text>
  );
};

const HoverLift = ({
  children,
  style,
  containerStyle,
}: {
  children: React.ReactNode;
  style: any;
  containerStyle?: any;
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const liftAnim = useRef(new Animated.Value(0)).current;

  const setActive = (active: boolean) => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: active ? 1.035 : 1,
        friction: 8,
        tension: 90,
        useNativeDriver: true,
      }),
      Animated.spring(liftAnim, {
        toValue: active ? -8 : 0,
        friction: 8,
        tension: 90,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <Pressable
      style={containerStyle}
      onPressIn={() => setActive(true)}
      onPressOut={() => setActive(false)}
      onHoverIn={() => setActive(true)}
      onHoverOut={() => setActive(false)}
    >
      <Animated.View
        style={[
          style,
          {
            transform: [{ translateY: liftAnim }, { scale: scaleAnim }],
          },
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
};

const TeamMemberCard = ({ member }: { member: any }) => {
  const fallbackImage = aboutFallback.team[0].image;
  const [imageUri, setImageUri] = useState(member.image || fallbackImage);

  useEffect(() => {
    setImageUri(member.image || fallbackImage);
  }, [fallbackImage, member.image]);

  return (
    <HoverLift containerStyle={styles.teamCardWrap} style={styles.teamCard}>
      <Image
        source={{ uri: imageUri || fallbackImage }}
        style={styles.teamImage as ImageStyle}
        onError={() => setImageUri(fallbackImage)}
      />
      <View style={styles.teamInfo}>
        <Text style={styles.teamName}>{member.name}</Text>
        <Text style={styles.teamRole}>{member.role}</Text>
        <Text style={styles.teamExp}>{member.exp}</Text>
        <Text style={styles.teamSpecial}>{member.special}</Text>
      </View>
    </HoverLift>
  );
};

const AboutScreen = ({
  onScroll,
  onTabChange,
}: {
  onScroll?: (event: any) => void;
  onTabChange?: (tab: string) => void;
}) => {
  const cms = useCmsContent('about', aboutFallback);
  const teamMembers = cms.team?.length ? cms.team : aboutFallback.team;
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ flexGrow: 1 }}
      onScroll={onScroll}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
    >
      {/* HERO SECTION */}
      <LinearGradient
        colors={['#0B3856', '#0C3854']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.hero}
      >
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>{cms.heroTitle}</Text>
          <Text style={styles.heroSubtitle}>{cms.heroSubtitle}</Text>

          <View style={styles.heroStats}>
            {(cms.heroStats || []).map((stat: any) => (
              <View
                key={`${stat.value}-${stat.label}`}
                style={styles.heroStatItem}
              >
                <Text style={styles.heroStatValue}>{stat.value}</Text>
                <Text style={styles.heroStatLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </LinearGradient>

      {/* MISSION SECTION */}
      <View style={styles.section}>
        <View style={styles.missionGrid}>
          <View style={styles.missionLeft}>
            <Text style={styles.sectionTitle}>{cms.missionTitle}</Text>
            <Text style={styles.missionText}>{cms.missionText}</Text>
            <View style={styles.missionList}>
              {(cms.missionPoints || []).map((item: string, i: number) => (
                <View key={i} style={styles.missionListItem}>
                  <CircleCheckBig size={20} color="#16A34A" />
                  <Text style={styles.missionListText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.missionRight}>
            <HoverLift style={styles.missionImageWrap}>
              <Image
                source={{
                  uri: cms.missionImage || aboutFallback.missionImage,
                }}
                style={styles.missionImage as ImageStyle}
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.5)']}
                style={styles.missionImageOverlay}
              />
            </HoverLift>
            <View style={styles.missionBadge}>
              <TrendingUp size={20} color="#2563EB" />
              <Text style={styles.missionBadgeText}>
                98% Customer Satisfaction
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* IMPACT SECTION */}
      <View style={[styles.section, styles.bgGray]}>
        <View style={styles.centeredHeader}>
          <Text style={styles.sectionTitle}>Our Impact in Numbers</Text>
          <Text style={styles.sectionSubtitle}>
            Trusted by thousands of customers across India
          </Text>
        </View>

        <View style={styles.impactGrid}>
          {(cms.impactStats?.length
            ? cms.impactStats
            : aboutFallback.heroStats
          ).map((stat: any, i: number) => {
            const icons = [Home, Users, Award, Building];
            const Icon = icons[i] || Home;
            return (
              <HoverLift
                key={i}
                containerStyle={styles.impactItemWrap}
                style={styles.impactItem}
              >
                <View style={styles.impactIconBox}>
                  <Icon size={20} color="white" />
                </View>
                <CountUpValue value={stat.value} />
                <Text style={styles.impactLabel}>{stat.label}</Text>
              </HoverLift>
            );
          })}
        </View>
      </View>

      {/* CORE VALUES */}
      <View style={styles.section}>
        <View style={styles.centeredHeader}>
          <Text style={styles.sectionTitle}>Our Core Values</Text>
          <Text style={styles.sectionSubtitle}>
            The principles that guide everything we do
          </Text>
        </View>

        <View style={styles.valuesGrid}>
          {(cms.values || []).map((value: any, i: number) => {
            const icons = [Shield, Target, Star, Heart];
            const Icon = icons[i] || Shield;
            return (
              <HoverLift key={i} style={styles.valueCard}>
                <View style={styles.valueHeader}>
                  <View style={styles.valueIconBox}>
                    <Icon size={20} color="white" />
                  </View>
                  <View style={styles.valueContent}>
                    <Text style={styles.valueTitle}>{value.title}</Text>
                    <Text style={styles.valueDesc}>{value.desc}</Text>
                  </View>
                </View>
              </HoverLift>
            );
          })}
        </View>
      </View>

      {/* TEAM SECTION */}
      <View style={[styles.section, styles.bgGray]}>
        <View style={styles.centeredHeader}>
          <Text style={styles.sectionTitle}>Meet Our Expert Team</Text>
          <Text style={styles.sectionSubtitle}>
            Experienced professionals dedicated to your success
          </Text>
        </View>

        <View style={styles.teamGrid}>
          {teamMembers.map((member: any) => (
            <TeamMemberCard key={member.name} member={member} />
          ))}
        </View>
      </View>

      {/* JOURNEY SECTION */}
      <View style={styles.section}>
        <View style={styles.centeredHeader}>
          <Text style={styles.sectionTitle}>Our Journey</Text>
          <Text style={styles.sectionSubtitle}>
            Milestones that shaped our success story
          </Text>
        </View>

        <View style={styles.timelineContainer}>
          <View style={styles.timelineLine} />

          {[
            {
              year: '2013',
              title: 'Company Founded',
              desc: 'Started with a vision to revolutionize real estate in Pune',
            },
            {
              year: '2015',
              title: 'Digital Transformation',
              desc: 'Launched online platform and mobile app for seamless property search',
            },
            {
              year: '2018',
              title: 'Pan-India Expansion',
              desc: 'Expanded operations to 25+ cities across India',
            },
            {
              year: '2020',
              title: 'AI Integration',
              desc: 'Introduced AI-powered property matching and market analysis',
            },
            {
              year: '2023',
              title: 'Industry Recognition',
              desc: 'Awarded "Best Real Estate Platform" by Property Awards India',
            },
          ].map((item, i) => (
            <View
              key={i}
              style={[
                styles.timelineItem,
                i % 2 !== 0 && styles.timelineItemReverse,
              ]}
            >
              <View style={styles.timelineContent}>
                <View style={styles.timelineCard}>
                  <Text style={styles.timelineYear}>{item.year}</Text>
                  <Text style={styles.timelineTitle}>{item.title}</Text>
                  <Text style={styles.timelineDesc}>{item.desc}</Text>
                </View>
              </View>
              <View style={styles.timelineIconWrapper}>
                <View style={styles.timelineIcon}>
                  <Star size={20} color="white" />
                </View>
              </View>
              <View style={styles.timelineEmpty} />
            </View>
          ))}
        </View>
      </View>

      {/* AWARDS SECTION */}
      <View style={[styles.section, styles.awardsBg]}>
        <View style={styles.centeredHeader}>
          <Text style={styles.sectionTitle}>Awards & Recognition</Text>
          <Text style={styles.sectionSubtitle}>
            Industry recognition for our excellence
          </Text>
        </View>

        <View style={styles.awardsGrid}>
          {[
            {
              title: 'Best Real Estate Platform 2023',
              org: 'Property Awards India',
              icon: Crown,
              colors: ['#FACC15', '#F97316'],
            },
            {
              title: 'Customer Choice Award 2022',
              org: 'Real Estate Excellence Awards',
              icon: Award,
              colors: ['#4ADE80', '#10B981'],
            },
            {
              title: 'Innovation in PropTech 2021',
              org: 'Technology Innovation Awards',
              icon: Rocket,
              colors: ['#60A5FA', '#6366F1'],
            },
          ].map((award, i) => (
            <HoverLift key={i} style={styles.awardCard}>
              <LinearGradient
                colors={award.colors}
                style={styles.awardIconCircle}
              >
                <award.icon size={20} color="white" />
              </LinearGradient>
              <Text style={styles.awardTitle}>{award.title}</Text>
              <Text style={styles.awardOrg}>{award.org}</Text>
            </HoverLift>
          ))}
        </View>
      </View>

      <Footer onTabChange={onTabChange} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  hero: {
    paddingTop: 120,
    paddingBottom: 60,
    paddingHorizontal: 20,
  },
  heroContent: {
    alignItems: 'center',
    maxWidth: 600,
    alignSelf: 'center',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#DBEAFE',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  heroStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
  },
  heroStatItem: {
    alignItems: 'center',
  },
  heroStatValue: {
    fontSize: 20,
    fontWeight: '800',
    color: 'white',
  },
  heroStatLabel: {
    fontSize: 12,
    color: '#BFDBFE',
    marginTop: 4,
  },
  section: {
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  bgGray: {
    backgroundColor: '#F9FAFB',
  },
  missionGrid: {
    flexDirection: 'column',
    gap: 40,
  },
  missionLeft: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 16,
  },
  missionText: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
    marginBottom: 24,
  },
  missionList: {
    gap: 16,
  },
  missionListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  missionListText: {
    fontSize: 16,
    color: '#374151',
  },
  missionRight: {
    position: 'relative',
  },
  missionImageWrap: {
    width: '100%',
    height: 300,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FB923C',
    elevation: 6,
    shadowColor: '#E6761D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
  },
  missionImage: {
    width: '100%',
    height: '100%',
  },
  missionImageOverlay: {
    ...StyleSheet.absoluteFill,
  },
  missionBadge: {
    position: 'absolute',
    bottom: -16,
    left: 16,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#E6761D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#FB923C',
  },
  missionBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  centeredHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  impactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 20,
  },
  impactItemWrap: {
    width: '46%',
  },
  impactItem: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#E6761D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: '#FB923C',
  },
  impactIconBox: {
    width: 44,
    height: 44,
    backgroundColor: '#E6761D',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  impactValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  impactLabel: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  valuesGrid: {
    gap: 20,
  },
  valueCard: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#E6761D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: '#FB923C',
  },
  valueHeader: {
    flexDirection: 'row',
    gap: 16,
  },
  valueIconBox: {
    width: 48,
    height: 48,
    backgroundColor: '#E6761D',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  valueContent: {
    flex: 1,
  },
  valueTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  valueDesc: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  teamGrid: {
    alignItems: 'center',
  },
  teamCardWrap: {
    width: '100%',
    maxWidth: 300,
  },
  teamCard: {
    width: '100%',
    maxWidth: 300,
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#E6761D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    borderWidth: 1,
    borderColor: '#FB923C',
  },
  teamImage: {
    width: '100%',
    height: 300,
  },
  teamInfo: {
    padding: 20,
  },
  teamName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  teamRole: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
    marginBottom: 8,
  },
  teamExp: {
    fontSize: 13,
    color: '#4B5563',
    marginBottom: 4,
  },
  teamSpecial: {
    fontSize: 12,
    color: '#6B7280',
  },
  timelineContainer: {
    position: 'relative',
    paddingVertical: 20,
  },
  timelineLine: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#0C3854',
    marginLeft: -1,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 40,
  },
  timelineItemReverse: {
    flexDirection: 'row-reverse',
  },
  timelineContent: {
    flex: 1,
  },
  timelineCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    elevation: 5,
    shadowColor: '#E6761D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: '#FB923C',
  },
  timelineYear: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  timelineTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  timelineDesc: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  timelineIconWrapper: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  timelineIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#E6761D',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'white',
  },
  timelineEmpty: {
    flex: 1,
  },
  awardsBg: {
    backgroundColor: '#F0F9FF',
  },
  awardsGrid: {
    gap: 20,
  },
  awardCard: {
    backgroundColor: 'white',
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#E6761D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    borderWidth: 1,
    borderColor: '#FB923C',
  },
  awardIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  awardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  awardOrg: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default AboutScreen;
