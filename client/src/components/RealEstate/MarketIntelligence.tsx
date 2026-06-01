import React, { useRef, useState } from 'react';
import {
  Animated,
  ActivityIndicator,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  Modal,
  ScrollView,
  Alert,
  Linking,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  TrendingUp,
  Target,
  BarChart3,
  Sparkles,
  X,
  Star,
  Crown,
  Zap,
  Check,
  Shield,
  Users,
  Phone,
  MessageCircle,
} from 'lucide-react-native';
import { useCmsContent } from '../../hooks/useCmsContent';
import { paymentService } from '../../services/api';

// ─── Types ───────────────────────────────────────────────────────────────────

interface PlanData {
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  subtitle: string;
  features: string[];
  limitations: string[];
  buttonText: string;
  popular: boolean;
}

interface PlansConfig {
  basic: PlanData;
  pro: PlanData;
  enterprise: PlanData;
}

interface MarketStat {
  label: string;
  value: string;
  color: string;
}

interface WhyItem {
  title: string;
  description: string;
}

interface MarketIntelligenceCms {
  stats: MarketStat[];
  plans: PlansConfig;
  whyItems: WhyItem[];
}

// ─── Static icon/color maps ───────────────────────────────────────────────────

type PlanKey = keyof PlansConfig;

const PLAN_ICONS: Record<
  PlanKey,
  React.ComponentType<{ size: number; color: string }>
> = {
  basic: Star,
  pro: Crown,
  enterprise: Zap,
};

const PLAN_COLORS: Record<PlanKey, string> = {
  basic: '#3B82F6',
  pro: '#8B5CF6',
  enterprise: '#F97316',
};

const STAT_ICONS = [TrendingUp, Target, BarChart3, Sparkles];
const STAT_BG = ['#ECFDF5', '#EFF6FF', '#F5F3FF', '#FFF7ED'];
const STAT_ICON_COLORS = ['#059669', '#2563EB', '#9333EA', '#E6761D'];

const WHY_ICONS = [Shield, TrendingUp, Users];
const WHY_ICON_COLORS = ['#2563EB', '#059669', '#9333EA'];

// ─── CMS fallback ─────────────────────────────────────────────────────────────

const fallback: MarketIntelligenceCms = {
  stats: [
    { label: 'Price Trends', value: 'PCMC +9.8%', color: '#059669' },
    { label: 'Best ROI', value: 'Wakad 14.6%', color: '#2563EB' },
    { label: 'Market Heat', value: 'Rahatani · Active', color: '#EF4444' },
    { label: 'AI Score', value: 'Verified avg 88/100', color: '#E6761D' },
  ],
  plans: {
    basic: {
      name: 'Basic',
      subtitle: 'Perfect for casual property seekers',
      monthlyPrice: 9999 / 12,
      yearlyPrice: 9999,
      features: [
        'Browse unlimited properties',
        'Contact up to 5 owners per month',
        'Basic property alerts',
        'Standard customer support',
        'Mobile app access',
      ],
      limitations: [
        'Limited to 5 property contacts per month',
        'No priority support',
        'Basic search filters only',
      ],
      buttonText: 'Choose Plan',
      popular: false,
    },
    pro: {
      name: 'Pro',
      subtitle: 'Most popular for serious buyers/sellers',
      monthlyPrice: 19999 / 12,
      yearlyPrice: 19999,
      features: [
        'Everything in Basic',
        'Unlimited property contacts',
        'Advanced AI property matching',
        'Priority customer support',
        'Detailed market analytics',
        'Property price predictions',
        'Virtual property tours',
        'Dedicated relationship manager',
        'Priority listing placement',
      ],
      limitations: [],
      buttonText: 'Get Started',
      popular: true,
    },
    enterprise: {
      name: 'Enterprise',
      subtitle: 'For real estate professionals & agencies',
      monthlyPrice: 49999 / 12,
      yearlyPrice: 49999,
      features: [
        'Everything in Pro',
        'Multiple user accounts',
        'White-label solutions',
        'API access',
        'Custom integrations',
        'Advanced analytics dashboard',
        'Bulk property uploads',
        'Premium listing features',
        'Dedicated account manager',
        'Custom branding options',
      ],
      limitations: [],
      buttonText: 'Contact Sales',
      popular: false,
    },
  },
  whyItems: [
    {
      title: 'Verified Properties',
      description: 'Access to 100% verified properties with legal clearance',
    },
    {
      title: 'Market Insights',
      description: 'AI-powered market trends and price predictions',
    },
    {
      title: 'Expert Support',
      description: 'Dedicated support from real estate experts',
    },
  ],
};

// ─── Helper ───────────────────────────────────────────────────────────────────

const getSavingsText = (yearlyPrice: number, monthlyPrice: number): string => {
  const monthlyTotal = monthlyPrice * 12;
  const savings = monthlyTotal - yearlyPrice;
  const percent = Math.round((savings / monthlyTotal) * 100);
  return `Save ${percent}% annually`;
};

const HoverPressCard = ({
  children,
  style,
  onPress,
}: {
  children: React.ReactNode;
  style: any;
  onPress?: () => void;
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
        toValue: active ? -7 : 0,
        friction: 8,
        tension: 90,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <Pressable
      onPress={onPress}
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

// ─── Component ────────────────────────────────────────────────────────────────

const MarketIntelligence = () => {
  const { width: screenWidth } = useWindowDimensions();
  const isTablet = screenWidth >= 768;
  const isLargeScreen = screenWidth >= 1024;

  const cms = useCmsContent<MarketIntelligenceCms>(
    'market-intelligence',
    fallback,
  );

  const [modalVisible, setModalVisible] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>(
    'yearly',
  );
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>('pro');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [contactSalesVisible, setContactSalesVisible] = useState(false);

  const plans = cms.plans ?? fallback.plans;
  const stats = cms.stats ?? fallback.stats;
  const whyItems = cms.whyItems ?? fallback.whyItems;

  // Responsive widths
  const statCardWidth = isTablet
    ? (screenWidth - 64) / 4
    : (screenWidth - 40) / 2;

  const planCardWidth = isLargeScreen
    ? (screenWidth - 96) / 3
    : isTablet
    ? (screenWidth - 72) / 2
    : screenWidth - 48;

  const openPaymentUrl = (url: string) => {
    if (Platform.OS === 'web' && (globalThis as any)?.window?.open) {
      const opened = (globalThis as any).window.open(
        url,
        '_blank',
        'noopener,noreferrer',
      );
      if (opened) return;
    }

    Linking.openURL(url).catch(() =>
      Alert.alert('Payment unavailable', 'Could not open Razorpay payment.'),
    );
  };

  const loadRazorpayScript = () =>
    new Promise<boolean>(resolve => {
      const webDocument = (globalThis as any)?.document;
      if (!webDocument) {
        resolve(false);
        return;
      }
      if ((globalThis as any)?.Razorpay) {
        resolve(true);
        return;
      }

      const script = webDocument.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      webDocument.body.appendChild(script);
    });

  const createPaymentLink = async (
    planKey: PlanKey,
    amount: number,
    label: string,
  ) => {
    const payload = {
      plan: planKey,
      amount,
      label,
      billingCycle,
      propertyCode: 'market-intelligence',
    };

    try {
      return await paymentService.createRazorpayPaymentLink(payload);
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return paymentService.createRazorpayPaymentLinkFallback(payload);
      }
      throw error;
    }
  };

  const handleSubscribe = async (planOverride?: PlanKey) => {
    if (paymentLoading) return;

    const planKey = planOverride || selectedPlan;
    if (planKey === 'enterprise') {
      setContactSalesVisible(true);
      return;
    }

    const plan = plans[planKey];
    const amount =
      billingCycle === 'yearly'
        ? plan.yearlyPrice
        : Math.round(plan.monthlyPrice);
    const label = `${plan.name} Plan (${billingCycle})`;

    setPaymentLoading(true);
    try {
      const linkResponse = await createPaymentLink(planKey, amount, label);
      const url = linkResponse.data?.data?.url;
      if (!url) throw new Error('Payment link missing');
      openPaymentUrl(url);
    } catch (error: any) {
      Alert.alert(
        'Payment unavailable',
        error?.response?.data?.message || 'Could not start Razorpay payment.',
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  const renderPlanCard = (planKey: PlanKey) => {
    const plan = plans[planKey];
    const IconComponent = PLAN_ICONS[planKey];
    const accentColor = PLAN_COLORS[planKey];
    const isSelected = selectedPlan === planKey;

    const priceDisplay =
      billingCycle === 'yearly'
        ? `₹${plan.yearlyPrice.toLocaleString()}`
        : `₹${Math.round(plan.monthlyPrice).toLocaleString()}`;
    const periodText = billingCycle === 'yearly' ? 'per year' : 'per month';
    const savingsText =
      billingCycle === 'yearly'
        ? getSavingsText(plan.yearlyPrice, plan.monthlyPrice)
        : null;

    return (
      <HoverPressCard
        key={planKey}
        onPress={() => setSelectedPlan(planKey)}
        style={{
          width: planCardWidth,
          marginBottom: 16,
          borderRadius: 16,
          borderWidth: 2,
          borderColor: isSelected ? '#8B5CF6' : '#E5E7EB',
          backgroundColor: isSelected ? '#FAF5FF' : '#FFFFFF',
          padding: 20,
          position: 'relative',
          shadowColor: accentColor,
          shadowOffset: { width: 0, height: isSelected ? 10 : 5 },
          shadowOpacity: isSelected ? 0.18 : 0.08,
          shadowRadius: isSelected ? 18 : 10,
          elevation: isSelected ? 8 : 3,
        }}
      >
        {plan.popular && (
          <View
            style={{
              position: 'absolute',
              top: -12,
              alignSelf: 'center',
              zIndex: 10,
            }}
          >
            <View
              style={{
                backgroundColor: '#7C3AED',
                paddingHorizontal: 16,
                paddingVertical: 4,
                borderRadius: 999,
              }}
            >
              <Text
                style={{ color: 'white', fontSize: 11, fontWeight: 'bold' }}
              >
                Most Popular
              </Text>
            </View>
          </View>
        )}

        {/* Plan header */}
        <View style={{ alignItems: 'center', marginBottom: 16 }}>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              backgroundColor: accentColor,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 10,
            }}
          >
            <IconComponent size={22} color="white" />
          </View>
          <Text
            style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: '#111827',
              marginBottom: 4,
            }}
          >
            {plan.name}
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: '#6B7280',
              textAlign: 'center',
              marginBottom: 12,
            }}
          >
            {plan.subtitle}
          </Text>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#111827' }}>
            {priceDisplay}
          </Text>
          <Text style={{ fontSize: 12, color: '#9CA3AF' }}>{periodText}</Text>
          {savingsText && (
            <Text
              style={{
                fontSize: 12,
                color: '#10B981',
                fontWeight: '600',
                marginTop: 2,
              }}
            >
              {savingsText}
            </Text>
          )}
        </View>

        {/* Features */}
        <ScrollView
          style={{ maxHeight: 220, marginBottom: 14 }}
          showsVerticalScrollIndicator={false}
        >
          <Text
            style={{
              fontWeight: '600',
              color: '#111827',
              marginBottom: 8,
              fontSize: 13,
            }}
          >
            Included:
          </Text>
          {plan.features.map((feature, idx) => (
            <View
              key={idx}
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                marginBottom: 7,
              }}
            >
              <Check
                size={14}
                color="#10B981"
                style={{ marginTop: 3, marginRight: 8 }}
              />
              <Text
                style={{
                  flex: 1,
                  fontSize: 13,
                  color: '#374151',
                  lineHeight: 18,
                }}
              >
                {feature}
              </Text>
            </View>
          ))}
          {plan.limitations.length > 0 && (
            <>
              <Text
                style={{
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: 8,
                  marginTop: 8,
                  fontSize: 13,
                }}
              >
                Limitations:
              </Text>
              {plan.limitations.map((limitation, idx) => (
                <View
                  key={idx}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    marginBottom: 7,
                  }}
                >
                  <X
                    size={14}
                    color="#EF4444"
                    style={{ marginTop: 3, marginRight: 8 }}
                  />
                  <Text
                    style={{
                      flex: 1,
                      fontSize: 13,
                      color: '#6B7280',
                      lineHeight: 18,
                    }}
                  >
                    {limitation}
                  </Text>
                </View>
              ))}
            </>
          )}
        </ScrollView>

        {/* CTA Button */}
        <TouchableOpacity
          onPress={() => {
            setSelectedPlan(planKey);
            if (planKey === 'enterprise') {
              setContactSalesVisible(true);
            } else {
              handleSubscribe(planKey);
            }
          }}
          disabled={paymentLoading}
          style={{
            width: '100%',
            paddingVertical: 12,
            borderRadius: 10,
            backgroundColor:
              isSelected || planKey === 'pro' ? '#7C3AED' : 'transparent',
            borderWidth: isSelected || planKey === 'pro' ? 0 : 1.5,
            borderColor: '#7C3AED',
            alignItems: 'center',
          }}
        >
          {paymentLoading && isSelected ? (
            <ActivityIndicator
              color={isSelected || planKey === 'pro' ? 'white' : '#7C3AED'}
              size="small"
            />
          ) : (
            <Text
              style={{
                fontWeight: '600',
                fontSize: 14,
                color: isSelected || planKey === 'pro' ? 'white' : '#7C3AED',
              }}
            >
              {plan.buttonText}
            </Text>
          )}
        </TouchableOpacity>
      </HoverPressCard>
    );
  };

  const openSalesUrl = (url: string, fallbackMessage: string) => {
    if ((globalThis as any)?.location && /^(tel|sms):/i.test(url)) {
      (globalThis as any).location.href = url;
      return;
    }

    Linking.openURL(url).catch(() => Alert.alert('Unable to open', fallbackMessage));
  };

  const contactPhone = '+919637009639';
  const contactWhatsapp = '919637009639';
  const contactMessage = encodeURIComponent(
    'Hi team, I want to talk to sales about the Enterprise plan.',
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* ── Header ── */}
        <View style={{ paddingVertical: 32, paddingHorizontal: 16 }}>
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 28,
                fontWeight: '900',
                textAlign: 'center',
                color: '#0b3856',
                letterSpacing: -0.5,
              }}
            >
              AI Market Intelligence
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: '#6B7280',
                textAlign: 'center',
                marginTop: 8,
                lineHeight: 20,
                paddingHorizontal: 24,
              }}
            >
              Real-time market analysis powered by advanced AI algorithms
            </Text>
          </View>

          {/* ── Stat Cards ── */}
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
            }}
          >
            {stats.map((stat, idx) => {
              const IconComp = STAT_ICONS[idx] ?? TrendingUp;
              const iconBg = STAT_BG[idx] ?? '#ECFDF5';
              const iconColor = STAT_ICON_COLORS[idx] ?? '#059669';
              return (
                <HoverPressCard
                  key={idx}
                  onPress={() => setModalVisible(true)}
                  style={{
                    width: statCardWidth,
                    backgroundColor: 'white',
                    borderWidth: 1.5,
                    borderColor: iconColor,
                    borderRadius: 20,
                    padding: 16,
                    marginBottom: 12,
                    shadowColor: iconColor,
                    shadowOffset: { width: 0, height: 5 },
                    shadowOpacity: 0.12,
                    shadowRadius: 12,
                    elevation: 4,
                  }}
                >
                  <View
                    style={{
                      backgroundColor: iconBg,
                      padding: 10,
                      borderRadius: 12,
                      alignSelf: 'flex-start',
                      marginBottom: 12,
                    }}
                  >
                    <IconComp size={22} color={iconColor} />
                  </View>
                  <Text
                    style={{
                      fontWeight: '800',
                      color: '#0b3856',
                      fontSize: 14,
                      marginBottom: 3,
                    }}
                  >
                    {stat.label}
                  </Text>
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: '700',
                      color: '#6B7280',
                      letterSpacing: 0.4,
                    }}
                  >
                    {stat.value}
                  </Text>
                </HoverPressCard>
              );
            })}
          </View>

          {/* ── CTA Button ── */}
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={{
              backgroundColor: '#E6761D',
              paddingVertical: 16,
              borderRadius: 16,
              alignItems: 'center',
              marginTop: 16,
              shadowColor: '#E6761D',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            <Text
              style={{
                color: 'white',
                fontWeight: '900',
                fontSize: 13,
                letterSpacing: 1.2,
              }}
            >
              GET FULL AI REPORT
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Pricing Modal ── */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View
            style={{
              flex: 1,
              justifyContent: 'flex-end',
              backgroundColor: 'rgba(0,0,0,0.55)',
            }}
          >
            <View
              style={{
                backgroundColor: 'white',
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                maxHeight: '92%',
                overflow: 'hidden',
                flex: 1,
              }}
            >
              {/* Modal Header */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 20,
                  borderBottomWidth: 1,
                  borderBottomColor: '#F3F4F6',
                }}
              >
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: 'bold',
                      color: '#111827',
                    }}
                  >
                    Choose Your Plan
                  </Text>
                  <Text
                    style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}
                  >
                    Unlock premium features for your property journey
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={{
                    padding: 8,
                    backgroundColor: '#F3F4F6',
                    borderRadius: 20,
                  }}
                >
                  <X size={18} color="#374151" />
                </TouchableOpacity>
              </View>

              {/* Billing Toggle */}
              <View
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 14,
                  backgroundColor: '#F9FAFB',
                  alignItems: 'center',
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    backgroundColor: 'white',
                    borderRadius: 10,
                    padding: 3,
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                  }}
                >
                  <TouchableOpacity
                    onPress={() => setBillingCycle('monthly')}
                    style={{
                      paddingHorizontal: 28,
                      paddingVertical: 8,
                      borderRadius: 8,
                      backgroundColor:
                        billingCycle === 'monthly' ? '#2563EB' : 'transparent',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: '600',
                        color: billingCycle === 'monthly' ? 'white' : '#6B7280',
                      }}
                    >
                      Monthly
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setBillingCycle('yearly')}
                    style={{
                      paddingHorizontal: 28,
                      paddingVertical: 8,
                      borderRadius: 8,
                      position: 'relative',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: '600',
                        color:
                          billingCycle === 'yearly' ? '#2563EB' : '#6B7280',
                      }}
                    >
                      Yearly
                    </Text>
                    {billingCycle === 'yearly' && (
                      <View
                        style={{
                          position: 'absolute',
                          top: -8,
                          right: -8,
                          backgroundColor: '#10B981',
                          borderRadius: 999,
                          paddingHorizontal: 6,
                          paddingVertical: 2,
                        }}
                      >
                        <Text
                          style={{
                            color: 'white',
                            fontSize: 9,
                            fontWeight: 'bold',
                          }}
                        >
                          SAVE 17%
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Scrollable: Plan cards + Why Subscribe */}
              <ScrollView
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={false}
              >
                {/* Plan Cards */}
                <View
                  style={{
                    padding: 16,
                    flexDirection: isTablet ? 'row' : 'column',
                    flexWrap: 'wrap',
                    justifyContent: isTablet ? 'space-between' : 'flex-start',
                    alignItems: isTablet ? 'flex-start' : 'center',
                  }}
                >
                  {(Object.keys(plans) as PlanKey[]).map(key =>
                    renderPlanCard(key),
                  )}
                </View>

                {/* Why Subscribe */}
                <View
                  style={{
                    borderTopWidth: 1,
                    borderTopColor: '#F3F4F6',
                    backgroundColor: '#F9FAFB',
                    padding: 20,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '700',
                      color: '#111827',
                      marginBottom: 14,
                    }}
                  >
                    Why Subscribe?
                  </Text>
                  {whyItems.map((item, idx) => {
                    const IconComp = WHY_ICONS[idx] ?? Shield;
                    const iconColor = WHY_ICON_COLORS[idx] ?? '#2563EB';
                    return (
                      <View
                        key={idx}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'flex-start',
                          marginBottom: 14,
                        }}
                      >
                        <View
                          style={{
                            backgroundColor: 'white',
                            borderRadius: 10,
                            padding: 8,
                            marginRight: 12,
                            borderWidth: 1,
                            borderColor: '#E5E7EB',
                          }}
                        >
                          <IconComp size={18} color={iconColor} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text
                            style={{
                              fontWeight: '700',
                              color: '#111827',
                              fontSize: 14,
                            }}
                          >
                            {item.title}
                          </Text>
                          <Text
                            style={{
                              fontSize: 13,
                              color: '#6B7280',
                              marginTop: 2,
                              lineHeight: 18,
                            }}
                          >
                            {item.description}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </ScrollView>

              {/* Footer */}
              <View
                style={{
                  padding: 16,
                  borderTopWidth: 1,
                  borderTopColor: '#F3F4F6',
                  backgroundColor: 'white',
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    color: '#9CA3AF',
                    textAlign: 'center',
                    marginBottom: 12,
                  }}
                >
                  Cancel anytime • 30-day money back guarantee • No hidden fees
                </Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    style={{
                      flex: 1,
                      paddingVertical: 13,
                      borderRadius: 12,
                      borderWidth: 1.5,
                      borderColor: '#E5E7EB',
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      style={{
                        color: '#374151',
                        fontWeight: '600',
                        fontSize: 14,
                      }}
                    >
                      Maybe Later
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleSubscribe()}
                    disabled={paymentLoading}
                    style={{
                      flex: 2,
                      paddingVertical: 13,
                      borderRadius: 12,
                      backgroundColor: '#E6761D',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                    }}
                  >
                    {paymentLoading ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <Crown size={16} color="white" />
                    )}
                    <Text
                      style={{
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: 14,
                      }}
                    >
                      {paymentLoading ? 'Opening Payment...' : 'Subscribe Now'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          visible={contactSalesVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setContactSalesVisible(false)}
        >
          <Pressable
            onPress={() => setContactSalesVisible(false)}
            style={{
              flex: 1,
              justifyContent: 'flex-end',
              backgroundColor: 'rgba(7, 15, 25, 0.62)',
            }}
          >
            <Pressable
              onPress={event => event.stopPropagation()}
              style={{
                backgroundColor: 'white',
                borderTopLeftRadius: 26,
                borderTopRightRadius: 26,
                padding: 20,
                paddingBottom: 26,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 16,
                }}
              >
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: '900',
                      color: '#0B3856',
                    }}
                  >
                    Talk to Sales
                  </Text>
                  <Text style={{ marginTop: 3, fontSize: 12, color: '#E6761D', fontWeight: '700' }}>
                    Enterprise Plan
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setContactSalesVisible(false)}
                  style={{
                    padding: 8,
                    borderRadius: 999,
                    backgroundColor: '#F3F4F6',
                  }}
                >
                  <X size={18} color="#1F2937" />
                </TouchableOpacity>
              </View>

              <View
                style={{
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: '#FED7AA',
                  backgroundColor: '#FFF7ED',
                  padding: 14,
                  marginBottom: 16,
                }}
              >
                <Text style={{ color: '#475569', fontSize: 12, lineHeight: 18 }}>
                  Hi team, I want to talk to sales about the Enterprise plan.
                </Text>
              </View>

              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() =>
                    openSalesUrl(
                      `https://wa.me/${contactWhatsapp}?text=${contactMessage}`,
                      'Could not open WhatsApp.',
                    )
                  }
                  style={{ flex: 1 }}
                >
                  <View
                    style={{
                      borderRadius: 12,
                      paddingVertical: 12,
                      alignItems: 'center',
                      backgroundColor: '#16A34A',
                    }}
                  >
                    <MessageCircle size={19} color="white" />
                    <Text style={{ marginTop: 4, color: 'white', fontSize: 12, fontWeight: '800' }}>
                      WhatsApp
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() =>
                    openSalesUrl(`tel:${contactPhone}`, 'Could not open phone dialer.')
                  }
                  style={{ flex: 1 }}
                >
                  <View
                    style={{
                      borderRadius: 12,
                      paddingVertical: 12,
                      alignItems: 'center',
                      backgroundColor: '#2563EB',
                    }}
                  >
                    <Phone size={19} color="white" />
                    <Text style={{ marginTop: 4, color: 'white', fontSize: 12, fontWeight: '800' }}>
                      Call Now
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={() =>
                  openSalesUrl(`tel:${contactPhone}`, 'Could not open phone dialer.')
                }
                style={{ alignItems: 'center', paddingVertical: 6 }}
              >
                <Text style={{ fontSize: 20, fontWeight: '900', color: '#0B3856' }}>
                  +91 9637 00 9639
                </Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MarketIntelligence;
