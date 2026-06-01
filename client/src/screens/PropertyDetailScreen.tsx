import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  Alert,
  Platform,
  useWindowDimensions,
  Share,
  Modal as RNModal,
  TextInput,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Slider } from '@miblanchard/react-native-slider';
import {
  ArrowLeft,
  Bed,
  Bath,
  Car,
  Building2,
  Camera,
  ChevronLeft,
  ChevronRight,
  Heart,
  Share as ShareIcon,
  MapPin,
  IndianRupee,
  Phone,
  MessageCircle,
  Calendar,
  Eye,
  Star,
  Lock,
  Crown,
  TrendingUp,
  Bot,
  Calculator,
  Ruler,
  Home,
  ShieldCheck,
  Users,
  X,
  Check,
  CreditCard,
  Zap,
  Info,
} from 'lucide-react-native';

import { contactService, paymentService } from '../services/api';
import Footer from '../components/RealEstate/Footer';

// ---------- Helper Functions ----------
const formatPrice = (price?: number | string) => {
  const numeric = Number(price || 0);
  if (!numeric) return 'On Request';
  if (numeric >= 10000000)
    return `${(numeric / 10000000).toFixed(2).replace(/\.00$/, '')} Cr`;
  if (numeric >= 100000)
    return `${(numeric / 100000).toFixed(2).replace(/\.00$/, '')} L`;
  return numeric.toLocaleString('en-IN');
};

const numberValue = (value: any, fallback = 0) => Number(value || fallback);
const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);
const listValue = (value: any): string[] => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.filter(Boolean);
    } catch {
      return value
        .split(',')
        .map(item => item.trim())
        .filter(Boolean);
    }
  }
  return [];
};

const normalizePhoneDigits = (value: any, fallback = '919637009639') => {
  const digits = String(value || '').replace(/[^\d]/g, '');
  if (!digits) return fallback;
  return digits.length === 10 ? `91${digits}` : digits;
};

const planDetails = {
  '5views': { label: '5 Property Views', amount: 299 },
  '12views': { label: '12 Property Views', amount: 599 },
  unlimited: { label: 'Unlimited Views', amount: 1999 },
};

// ---------- Main Component ----------
const PropertyDetailScreen = ({
  property,
  similar = [],
  onBack,
  onOpenProperty,
  onTabChange,
}: any) => {
  const scrollRef = useRef<ScrollView>(null);
  const { width: screenWidth } = useWindowDimensions();
  const isMobile = screenWidth < 768;
  const isTablet = screenWidth >= 768 && screenWidth < 1024;
  const galleryHeight = isMobile ? 288 : isTablet ? 420 : 520;

  // States
  const [imageIndex, setImageIndex] = useState(0);
  const [emiLoanPercent, setEmiLoanPercent] = useState(80);
  const [emiInterestRate, setEmiInterestRate] = useState(8.5);
  const [emiTenure, setEmiTenure] = useState(30);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showPhotosModal, setShowPhotosModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<
    '5views' | '12views' | 'unlimited'
  >('5views');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [expandedDesc, setExpandedDesc] = useState(false);
  const [openingPropertyId, setOpeningPropertyId] = useState<string | null>(
    null,
  );

  // Message modal state
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [msgName, setMsgName] = useState('');
  const [msgPhone, setMsgPhone] = useState('');
  const [msgEmail, setMsgEmail] = useState('');
  const [msgContent, setMsgContent] = useState('');
  const [msgLoading, setMsgLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!msgName || !msgPhone || !msgEmail || !msgContent) {
      Alert.alert('Missing Info', 'Please fill in all fields marked with *');
      return;
    }
    setMsgLoading(true);
    try {
      await contactService.create({
        name: msgName,
        email: msgEmail,
        phone: msgPhone,
        property_type: property?.property_type || 'Residential',
        subject: `Property Inquiry - ${code}`,
        message: msgContent,
      });
      Alert.alert(
        'Message Sent',
        `Thank you! ${executiveName} will get back to you shortly.`,
      );
      setMsgName('');
      setMsgPhone('');
      setMsgEmail('');
      setMsgContent('');
      setShowMessageModal(false);
    } catch {
      Alert.alert('Error', 'Could not send the message. Please try again.');
    } finally {
      setMsgLoading(false);
    }
  };

  // Extract data
  const images = useMemo(() => {
    const gallery = listValue(property?.images);
    const main = property?.image_url || property?.image;
    return [main, ...gallery]
      .filter(Boolean)
      .filter((item, index, arr) => arr.indexOf(item) === index);
  }, [property]);

  const activeImage =
    images[imageIndex] ||
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80';
  const galleryImages = images.length ? images : [activeImage];
  const price = numberValue(property?.price);
  const area = numberValue(property?.carpet_area || property?.area);
  const perSqFt =
    numberValue(property?.per_sq_ft) ||
    (price && area ? Math.round(price / area) : 0);
  const viewCount = numberValue(property?.views);
  const formattedViews =
    viewCount >= 100000
      ? `${(viewCount / 100000).toFixed(1).replace(/\.0$/, '')}L`
      : viewCount >= 1000
      ? `${(viewCount / 1000).toFixed(1).replace(/\.0$/, '')}K`
      : String(viewCount);
  const totalTaxes = Math.round(price * 0.074);
  const totalCost = price + totalTaxes;
  const amenities = listValue(property?.amenities);
  const furnishingItems = listValue(property?.furnishing_items);
  const aiMetrics = useMemo(() => {
    const locality = String(
      property?.location || property?.city || 'Pune',
    ).toLowerCase();
    const premiumLocality = [
      'wakad',
      'pimple saudagar',
      'baner',
      'hinjewadi',
      'tathawade',
      'rahatani',
    ].some(item => locality.includes(item));
    const rateScore = perSqFt
      ? clamp(Math.round((12000 - perSqFt) / 120), 0, 24)
      : 12;
    const areaScore = area ? clamp(Math.round(area / 80), 8, 18) : 12;
    const locationScore = premiumLocality ? 22 : 16;
    const amenitiesScore = clamp(amenities.length * 2, 4, 14);
    const score = clamp(
      42 + rateScore + areaScore + locationScore + amenitiesScore,
      72,
      98,
    );
    const growth = clamp(
      (premiumLocality ? 9.5 : 7.2) +
        (perSqFt && perSqFt < 9500 ? 2.1 : 0) +
        Math.min(amenities.length * 0.2, 1.8),
      6.5,
      14.8,
    );
    const roi = clamp(
      growth + (perSqFt && perSqFt < 9000 ? 4.2 : 2.6),
      9.5,
      19.5,
    );
    const grade =
      score >= 92 ? 'A+' : score >= 86 ? 'A' : score >= 80 ? 'B+' : 'B';

    return {
      score,
      growth: `+${growth.toFixed(1)}%`,
      roi: `${roi.toFixed(1)}%`,
      grade,
      marketRank: score >= 90 ? 'Top 10%' : score >= 84 ? 'Top 20%' : 'Top 35%',
      timing: score >= 86 ? 'Buy window' : 'Compare options',
      recommendation:
        score >= 90 ? 'Strong Buy' : score >= 84 ? 'Good Buy' : 'Fair Value',
      risk: perSqFt && perSqFt > 12000 ? 'Medium' : 'Low-Medium',
    };
  }, [amenities.length, area, perSqFt, property?.city, property?.location]);

  // EMI calculations
  const emiLoanAmount = Math.round(price * (emiLoanPercent / 100));
  const emi =
    Math.round(
      (((emiLoanAmount * (emiInterestRate / 100)) / 12) *
        Math.pow(1 + emiInterestRate / 100 / 12, emiTenure * 12)) /
        (Math.pow(1 + emiInterestRate / 100 / 12, emiTenure * 12) - 1),
    ) || 0;
  const emiTotalPayment = emi * emiTenure * 12;
  const emiTotalInterest = emiTotalPayment - emiLoanAmount;

  const code =
    property?.property_code ||
    property?.code ||
    `REX${String(property?.id || '').padStart(4, '0')}`;
  const executiveName =
    property?.agent_name ||
    property?.executive_name ||
    property?.contact_person ||
    'Property Executive';
  const executivePhone = String(
    property?.executive_phone ||
      property?.agent_phone ||
      property?.contact_phone ||
      property?.phone ||
      '+919637009639',
  ).trim();
  const executivePhoneDigits = normalizePhoneDigits(executivePhone);
  const whatsappDigits = normalizePhoneDigits(
    property?.executive_whatsapp ||
      property?.agent_whatsapp ||
      property?.whatsapp ||
      executivePhoneDigits,
    '919146009176',
  );
  const propertyMapQuery = [
    property?.full_address,
    property?.address,
    property?.society,
    property?.location,
    property?.city || 'Pune',
    'Maharashtra',
  ]
    .filter(Boolean)
    .join(', ');

  const openExternalUrl = (url: string, errorMessage: string) => {
    if (Platform.OS === 'web') {
      const webWindow = (globalThis as any)?.window;
      const isAppScheme = /^(tel|sms|mailto):/i.test(url);
      if (isAppScheme && (globalThis as any)?.location) {
        (globalThis as any).location.href = url;
        return;
      }

      if (webWindow?.open) {
        const opened = webWindow.open(url, '_blank', 'noopener,noreferrer');
        if (opened) return;
      }
      if ((globalThis as any)?.location) {
        (globalThis as any).location.href = url;
        return;
      }
    }

    Linking.openURL(url).catch(() =>
      Alert.alert('Unable to open', errorMessage),
    );
  };

  const callExecutive = () => {
    openExternalUrl(
      `tel:+${executivePhoneDigits}`,
      'Could not open phone dialer.',
    );
  };

  const messageExecutive = () => {
    openExternalUrl(`sms:+${executivePhoneDigits}`, 'Could not open SMS app.');
  };

  const openWhatsApp = () => {
    const text = encodeURIComponent(
      `Hi, I'm interested in property ${code}. Please share details and site visit availability.`,
    );
    const whatsappUrl =
      Platform.OS === 'web'
        ? `https://web.whatsapp.com/send?phone=${whatsappDigits}&text=${text}`
        : `whatsapp://send?phone=${whatsappDigits}&text=${text}`;
    const fallbackUrl = `https://api.whatsapp.com/send?phone=${whatsappDigits}&text=${text}`;

    if (Platform.OS !== 'web') {
      Linking.canOpenURL(whatsappUrl)
        .then(canOpen =>
          openExternalUrl(canOpen ? whatsappUrl : fallbackUrl, 'Could not open WhatsApp.'),
        )
        .catch(() => openExternalUrl(fallbackUrl, 'Could not open WhatsApp.'));
      return;
    }

    openExternalUrl(
      whatsappUrl,
      'Could not open WhatsApp.',
    );
  };

  const getRazorpayPaymentLink = () => {
    const byPlan =
      selectedPlan === '5views'
        ? property?.razorpay_5views_link || property?.razorpayFiveViewsLink
        : selectedPlan === '12views'
        ? property?.razorpay_12views_link || property?.razorpayTwelveViewsLink
        : property?.razorpay_unlimited_link || property?.razorpayUnlimitedLink;

    return (
      byPlan ||
      property?.razorpay_payment_link ||
      property?.razorpayPaymentLink ||
      (globalThis as any)?.RAZORPAY_PAYMENT_LINK ||
      ''
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

  const createPaymentLink = async () => {
    const payload = {
      plan: selectedPlan,
      propertyCode: code,
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

  const handleRazorpayPayment = async () => {
    if (paymentLoading) return;

    const paymentLink = getRazorpayPaymentLink();
    if (paymentLink) {
      openExternalUrl(paymentLink, 'Could not open Razorpay payment.');
      return;
    }

    setPaymentLoading(true);
    try {
      const linkResponse = await createPaymentLink();
      const url = linkResponse.data?.data?.url;
      if (!url) throw new Error('Payment link missing');
      openExternalUrl(url, 'Could not open Razorpay payment.');
    } catch (error: any) {
      Alert.alert(
        'Payment unavailable',
        error?.response?.data?.message || 'Could not start Razorpay payment.',
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  const openNearbyLocation = () => {
    const hasCoordinates = property?.latitude && property?.longitude;
    const destination = encodeURIComponent(
      hasCoordinates
        ? `${property.latitude},${property.longitude}`
        : propertyMapQuery || property?.location || 'Pune, Maharashtra',
    );
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=current+location&destination=${destination}&travelmode=driving`;
    const mapUrl =
      Platform.OS === 'ios'
        ? `https://maps.apple.com/?daddr=${destination}&dirflg=d`
        : Platform.OS === 'android'
        ? `google.navigation:q=${destination}&mode=d`
        : directionsUrl;

    openExternalUrl(mapUrl, 'Could not open route directions.');
  };

  const showPrevImage = () => {
    setImageIndex(prev =>
      images.length > 1 ? (prev > 0 ? prev - 1 : images.length - 1) : 0,
    );
  };

  const showNextImage = () => {
    setImageIndex(prev =>
      images.length > 1 ? (prev < images.length - 1 ? prev + 1 : 0) : 0,
    );
  };

  const openVirtualTour = () => {
    const tourUrl =
      property?.virtual_tour_url || property?.tour_url || property?.video_url;
    if (tourUrl) {
      Linking.openURL(tourUrl).catch(() => setShowPhotosModal(true));
      return;
    }
    setShowPhotosModal(true);
  };
  const currentPropertyIds = useMemo(
    () =>
      [property?.id, property?.property_code, property?.code]
        .filter(Boolean)
        .map(String),
    [property?.code, property?.id, property?.property_code],
  );
  const visibleSimilar = useMemo(
    () =>
      similar
        .filter((item: any) => {
          const itemIds = [item?.id, item?.property_code, item?.code]
            .filter(Boolean)
            .map(String);
          return !itemIds.some(itemId => currentPropertyIds.includes(itemId));
        })
        .slice(0, 6),
    [currentPropertyIds, similar],
  );

  useEffect(() => {
    setImageIndex(0);
    setExpandedDesc(false);
    setOpeningPropertyId(null);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, [code]);

  const details = [
    {
      label: 'Property Type',
      value: property?.property_type || 'Residential',
      icon: Building2,
    },
    {
      label: 'Unit Type',
      value: property?.unit_type || property?.config || '2BHK',
      icon: Home,
    },
    {
      label: 'Subtype',
      value: property?.subtype || 'Apartment',
      icon: Building2,
    },
    {
      label: 'Parking Type',
      value: property?.parking_type || 'Covered',
      icon: Car,
    },
    {
      label: 'Floor',
      value: `${property?.floor || '1'} / ${property?.total_floors || '7'}`,
      icon: Building2,
    },
    {
      label: 'Carpet Area',
      value: area ? `${area} sq ft` : 'N/A',
      icon: Ruler,
    },
    {
      label: 'Status',
      value: property?.status || 'Available',
      icon: ShieldCheck,
    },
    {
      label: 'Price',
      value: `₹${formatPrice(price)}${
        property?.negotiable ? ' (Negotiable)' : ''
      }`,
      icon: IndianRupee,
    },
    {
      label: 'Furnishing',
      value: property?.furnishing || 'Un-Furnished',
      icon: Home,
    },
    {
      label: 'Built Year',
      value: property?.built_year || '2025',
      icon: Calendar,
    },
  ];

  // Share handler
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this property: ${code} - ${
          property?.title || ''
        } on ResaleExpert`,
        url: property?.share_url || 'https://resaleexpert.in',
      });
    } catch {
      Alert.alert('Error', 'Unable to share at this moment.');
    }
  };

  // Pricing Modal
  const PricingModal = () => (
    <RNModal
      visible={showPricingModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowPricingModal(false)}
    >
      <View className="flex-1 justify-center items-center bg-black/60 p-4">
        <View className="bg-white rounded-2xl w-full max-w-4xl max-h-[90%] overflow-hidden">
          <LinearGradient
            colors={['#0B3856', '#0C3854']}
            className="p-6 rounded-t-2xl relative"
          >
            <TouchableOpacity
              onPress={() => setShowPricingModal(false)}
              className="absolute top-4 right-4 p-2"
            >
              <X size={20} color="white" />
            </TouchableOpacity>
            <View className="items-center">
              <View className="w-16 h-16 bg-white/20 rounded-2xl items-center justify-center mb-4">
                <Lock size={28} color="white" />
              </View>
              <Text className="text-white text-2xl font-bold mb-2">
                Unlock AI Investment Analysis
              </Text>
              <Text className="text-blue-100 text-center">
                Get detailed AI-powered insights for smarter property decisions
              </Text>
            </View>
          </LinearGradient>

          <ScrollView className="p-6">
            <Text className="text-xl font-bold text-gray-900 text-center mb-2">
              Choose Your Plan
            </Text>
            <Text className="text-gray-600 text-center mb-6">
              Pay only for what you need - no hidden charges
            </Text>

            <View className="flex-row flex-wrap justify-between gap-4 mb-8">
              {/* 5 Views Plan */}
              <TouchableOpacity
                onPress={() => setSelectedPlan('5views')}
                className={`flex-1 min-w-[180px] rounded-2xl border-2 p-5 ${
                  selectedPlan === '5views'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-100'
                }`}
              >
                <View className="items-center mb-4">
                  <View className="w-16 h-16 rounded-2xl bg-blue-100 items-center justify-center mb-3">
                    <Eye size={24} color="#2563EB" />
                  </View>
                  <Text className="text-lg font-bold text-gray-900">
                    5 Property Views
                  </Text>
                  <Text className="text-3xl font-bold text-gray-900 mt-2">
                    ₹299
                  </Text>
                  <Text className="text-sm text-gray-500">
                    5 views • 1 Month
                  </Text>
                </View>
                <View className="space-y-2">
                  <View className="flex-row items-center gap-2">
                    <Check size={16} color="#10B981" />
                    <Text className="text-sm text-gray-700">
                      AI Investment Analysis
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <Check size={16} color="#10B981" />
                    <Text className="text-sm text-gray-700">
                      AI Recommendations
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <Check size={16} color="#10B981" />
                    <Text className="text-sm text-gray-700">
                      Price Predictions
                    </Text>
                  </View>
                </View>
                {selectedPlan === '5views' && (
                  <Text className="text-center text-blue-600 font-medium mt-4">
                    ✓ Selected
                  </Text>
                )}
              </TouchableOpacity>

              {/* 12 Views Plan (Popular) */}
              <TouchableOpacity
                onPress={() => setSelectedPlan('12views')}
                className={`flex-1 min-w-[180px] rounded-2xl border-2 p-5 relative ${
                  selectedPlan === '12views'
                    ? 'ring-2 ring-purple-500 border-purple-500'
                    : 'border-slate-100'
                }`}
              >
                <View className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 px-4 py-1 rounded-full">
                  <Text className="text-white text-xs font-bold">
                    Most Popular
                  </Text>
                </View>
                <View className="items-center mb-4">
                  <View className="w-16 h-16 rounded-2xl bg-purple-100 items-center justify-center mb-3">
                    <Crown size={24} color="#7C3AED" />
                  </View>
                  <Text className="text-lg font-bold text-gray-900">
                    12 Property Views
                  </Text>
                  <Text className="text-3xl font-bold text-gray-900 mt-2">
                    ₹599
                  </Text>
                  <Text className="text-sm text-gray-500">
                    12 views • 1 Month
                  </Text>
                </View>
                <View className="space-y-2">
                  <View className="flex-row items-center gap-2">
                    <Check size={16} color="#10B981" />
                    <Text className="text-sm text-gray-700">
                      Everything in 5 Views
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <Check size={16} color="#10B981" />
                    <Text className="text-sm text-gray-700">
                      Advanced Market Analytics
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <Check size={16} color="#10B981" />
                    <Text className="text-sm text-gray-700">
                      Detailed Investment Reports
                    </Text>
                  </View>
                </View>
                {selectedPlan === '12views' ? (
                  <Text className="text-center text-purple-600 font-medium mt-4">
                    ✓ Selected
                  </Text>
                ) : (
                  <Text className="text-center text-gray-500 mt-4">
                    Select Plan
                  </Text>
                )}
              </TouchableOpacity>

              {/* Unlimited Views Plan */}
              <TouchableOpacity
                onPress={() => setSelectedPlan('unlimited')}
                className={`flex-1 min-w-[180px] rounded-2xl border-2 p-5 ${
                  selectedPlan === 'unlimited'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-slate-100'
                }`}
              >
                <View className="items-center mb-4">
                  <View className="w-16 h-16 rounded-2xl bg-orange-100 items-center justify-center mb-3">
                    <Zap size={24} color="#EA580C" />
                  </View>
                  <Text className="text-lg font-bold text-gray-900">
                    Unlimited Views
                  </Text>
                  <Text className="text-3xl font-bold text-gray-900 mt-2">
                    ₹1,999
                  </Text>
                  <Text className="text-sm text-gray-500">
                    Unlimited • 1 Month
                  </Text>
                </View>
                <View className="space-y-2">
                  <View className="flex-row items-center gap-2">
                    <Check size={16} color="#10B981" />
                    <Text className="text-sm text-gray-700">
                      Everything in 12 Views
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <Check size={16} color="#10B981" />
                    <Text className="text-sm text-gray-700">
                      Unlimited AI Analysis
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <Check size={16} color="#10B981" />
                    <Text className="text-sm text-gray-700">
                      Premium Support
                    </Text>
                  </View>
                </View>
                {selectedPlan === 'unlimited' ? (
                  <Text className="text-center text-orange-600 font-medium mt-4">
                    ✓ Selected
                  </Text>
                ) : (
                  <Text className="text-center text-gray-500 mt-4">
                    Select Plan
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            <View className="bg-gray-50 rounded-xl p-5">
              <View className="flex-row justify-between items-center mb-4">
                <View>
                  <Text className="font-bold text-gray-900 text-lg">
                    {selectedPlan === '5views' && '5 Property Views'}
                    {selectedPlan === '12views' && '12 Property Views'}
                    {selectedPlan === 'unlimited' && 'Unlimited Views'}
                  </Text>
                  <Text className="text-gray-500 text-sm">
                    Valid for 1 Month
                  </Text>
                </View>
                <Text className="text-2xl font-bold text-gray-900">
                  ₹
                  {selectedPlan === '5views'
                    ? '299'
                    : selectedPlan === '12views'
                    ? '599'
                    : '1,999'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleRazorpayPayment}
                disabled={paymentLoading}
                activeOpacity={0.86}
                className="bg-[#E6761D] py-4 rounded-xl flex-row items-center justify-center gap-2"
              >
                {paymentLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <CreditCard size={20} color="white" />
                )}
                <Text className="text-white font-semibold text-lg">
                  {paymentLoading ? 'Opening Razorpay...' : 'Pay with Razorpay'}
                </Text>
              </TouchableOpacity>
              <View className="flex-row justify-center gap-4 mt-4">
                <View className="flex-row items-center gap-1">
                  <Check size={14} color="#10B981" />
                  <Text className="text-xs text-gray-600">Secure Payment</Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <Check size={14} color="#10B981" />
                  <Text className="text-xs text-gray-600">Instant Access</Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <Check size={14} color="#10B981" />
                  <Text className="text-xs text-gray-600">No Auto-renewal</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </RNModal>
  );

  // Message Modal
  const MessageModal = () => (
    <RNModal
      visible={showMessageModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowMessageModal(false)}
    >
      <View className="flex-1 justify-center items-center bg-black/60 p-4">
        <View className="bg-white rounded-2xl w-full max-w-lg overflow-hidden">
          <LinearGradient
            colors={['#0B3856', '#0C3854']}
            className="p-5 rounded-t-2xl relative"
          >
            <TouchableOpacity
              onPress={() => setShowMessageModal(false)}
              className="absolute top-4 right-4 p-2"
            >
              <X size={20} color="white" />
            </TouchableOpacity>
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center">
                <Users size={20} color="#2563EB" />
              </View>
              <View>
                <Text className="text-white text-lg font-bold">
                  Contact Property Executive
                </Text>
                <Text className="text-blue-100 text-xs">
                  Send a message to {executiveName}
                </Text>
              </View>
            </View>
          </LinearGradient>

          <ScrollView className="p-5" contentContainerStyle={{ gap: 16 }}>
            <View>
              <Text className="text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
                Full Name *
              </Text>
              <TextInput
                value={msgName}
                onChangeText={setMsgName}
                placeholder="Enter your name"
                placeholderTextColor="#9ca3af"
                className="rounded-xl px-4 py-3 text-sm text-gray-900 bg-white transition-all hover:bg-orange-50/30"
              />
            </View>

            <View>
              <Text className="text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
                Phone Number *
              </Text>
              <TextInput
                value={msgPhone}
                onChangeText={setMsgPhone}
                placeholder="Enter your phone number"
                placeholderTextColor="#9ca3af"
                keyboardType="phone-pad"
                className="rounded-xl px-4 py-3 text-sm text-gray-900 bg-white transition-all hover:bg-orange-50/30"
              />
            </View>

            <View>
              <Text className="text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
                Email Address *
              </Text>
              <TextInput
                value={msgEmail}
                onChangeText={setMsgEmail}
                placeholder="Enter your email"
                placeholderTextColor="#9ca3af"
                keyboardType="email-address"
                autoCapitalize="none"
                className="rounded-xl px-4 py-3 text-sm text-gray-900 bg-white transition-all hover:bg-orange-50/30"
              />
            </View>

            <View>
              <Text className="text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
                Your Message *
              </Text>
              <TextInput
                value={msgContent}
                onChangeText={setMsgContent}
                placeholder="Enter your message or questions about this property..."
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                className="rounded-xl px-4 py-3 text-sm text-gray-900 bg-white transition-all hover:bg-orange-50/30 min-h-[100px]"
              />
            </View>

            <TouchableOpacity
              onPress={handleSendMessage}
              disabled={msgLoading}
              className="bg-[#E6761D] py-3.5 rounded-xl items-center justify-center mt-2 flex-row gap-2"
            >
              {msgLoading ? (
                <Text className="text-white font-bold text-base">
                  Sending...
                </Text>
              ) : (
                <>
                  <MessageCircle size={18} color="white" />
                  <Text className="text-white font-bold text-base">
                    Send Message
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </RNModal>
  );

  const PhotosModal = () => {
    const modalImage = galleryImages[imageIndex] || galleryImages[0];

    return (
      <RNModal
        visible={showPhotosModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPhotosModal(false)}
      >
        <View className="flex-1 bg-black/95">
          <View className="pt-10 px-4 pb-3 flex-row items-center justify-between border-b border-white/10">
            <View>
              <Text className="text-white text-lg font-black">
                Property Photos
              </Text>
              <Text className="text-white/60 text-xs mt-0.5">
                {code} • {imageIndex + 1} of {galleryImages.length}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowPhotosModal(false)}
              className="w-10 h-10 rounded-full bg-white/10 items-center justify-center"
            >
              <X size={20} color="white" />
            </TouchableOpacity>
          </View>

          <View className="flex-1 items-center justify-center px-3">
            <Image
              source={{ uri: modalImage }}
              className={`w-full rounded-2xl bg-black ${
                isMobile ? 'h-[380px]' : 'h-[600px]'
              }`}
              resizeMode="contain"
            />
            {galleryImages.length > 1 && (
              <>
                <TouchableOpacity
                  onPress={showPrevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/15 p-3 rounded-full"
                >
                  <ChevronLeft size={26} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={showNextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/15 p-3 rounded-full"
                >
                  <ChevronRight size={26} color="white" />
                </TouchableOpacity>
              </>
            )}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="max-h-24 px-4 pb-5"
          >
            <View className="flex-row gap-3">
              {galleryImages.map((uri, idx) => (
                <TouchableOpacity
                  key={`${uri}-${idx}`}
                  onPress={() => setImageIndex(idx)}
                  className={`w-20 h-16 rounded-xl overflow-hidden border-2 ${
                    idx === imageIndex ? 'border-[#E6761D]' : 'border-white/20'
                  }`}
                >
                  <Image
                    source={{ uri }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </RNModal>
    );
  };

  // Contact Cards
  const MobileContactBar = () => (
    <View
      pointerEvents="box-none"
      className="absolute bottom-0 left-0 right-0 z-50 p-3"
    >
      <View
        pointerEvents="auto"
        className="bg-white rounded-2xl shadow-lg p-3 mx-auto w-[95%] border border-orange-300 transition-all hover:shadow-xl"
      >
        <View className="flex-row items-center gap-2 mb-2">
          <View className="w-8 h-8 rounded-full bg-blue-50 items-center justify-center">
            <Users size={16} color="#2563EB" />
          </View>
          <View>
            <Text className="font-semibold text-gray-900 text-sm">
              {executiveName}
            </Text>
            <Text className="text-xs text-gray-500">Property Executive</Text>
          </View>
        </View>
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={callExecutive}
            activeOpacity={0.82}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            className="flex-1 flex-row items-center justify-center gap-1 bg-blue-50 py-2 rounded-lg"
          >
            <Phone size={14} color="#2563EB" />
            <Text className="text-xs text-blue-600 font-medium">Call</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={openWhatsApp}
            activeOpacity={0.82}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            className="flex-1 flex-row items-center justify-center gap-1 bg-green-50 py-2 rounded-lg"
          >
            <MessageCircle size={14} color="#16a34a" />
            <Text className="text-xs text-green-600 font-medium">WhatsApp</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowMessageModal(true)}
            activeOpacity={0.82}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            className="flex-1 flex-row items-center justify-center gap-1 bg-purple-50 py-2 rounded-lg"
          >
            <MessageCircle size={14} color="#9333ea" />
            <Text className="text-xs text-purple-600 font-medium">Message</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const DesktopContactCard = () => (
    <View className="bg-white rounded-xl border border-orange-300 p-4 sticky top-24 transition-all hover:shadow-xl">
      <View className="flex-row items-center gap-3 mb-3">
        <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center">
          <Users size={20} color="#2563EB" />
        </View>
        <View>
          <Text className="font-semibold text-gray-900">{executiveName}</Text>
          <Text className="text-xs text-gray-500">Property Executive</Text>
        </View>
      </View>
      <View className="grid grid-cols-2 gap-2">
        <TouchableOpacity
          onPress={callExecutive}
          activeOpacity={0.82}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          className="flex-row items-center justify-center gap-2 bg-blue-50 py-2 rounded-lg"
        >
          <Phone size={14} color="#2563EB" />
          <Text className="text-xs font-medium text-blue-600">Call</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={openWhatsApp}
          activeOpacity={0.82}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          className="flex-row items-center justify-center gap-2 bg-green-50 py-2 rounded-lg"
        >
          <MessageCircle size={14} color="#16a34a" />
          <Text className="text-xs font-medium text-green-600">WhatsApp</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setShowMessageModal(true)}
          activeOpacity={0.82}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          className="flex-row items-center justify-center gap-2 bg-purple-50 py-2 rounded-lg"
        >
          <MessageCircle size={14} color="#9333ea" />
          <Text className="text-xs font-medium text-purple-600">Message</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={messageExecutive}
          activeOpacity={0.82}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          className="flex-row items-center justify-center gap-2 bg-gray-50 py-2 rounded-lg"
        >
          <MessageCircle size={14} color="#6B7280" />
          <Text className="text-xs font-medium text-gray-600">SMS</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const SimilarPropertyCard = ({ item }: any) => {
    const itemId = String(item?.id || item?.property_code || item?.code || '');
    const isOpening = openingPropertyId === itemId;
    const displayPrice = String(item?.price || 'On Request');
    const imageUrl =
      item?.image ||
      item?.image_url ||
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80';
    const displayArea = item?.area || item?.carpet_area || item?.built_up_area;
    const displayConfig = item?.config || item?.unit_type || 'Property';
    const displayPerSqFt = item?.perSqFt || item?.per_sq_ft;

    const openSimilarProperty = () => {
      if (!itemId || isOpening) return;
      setOpeningPropertyId(itemId);
      onOpenProperty?.(itemId);
      setTimeout(() => {
        setOpeningPropertyId(currentId =>
          currentId === itemId ? null : currentId,
        );
      }, 4500);
    };

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={openSimilarProperty}
        className={`group bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${
          isOpening
            ? 'border-[#E6761D] ring-2 ring-[#E6761D]/20'
            : 'border-orange-200'
        }`}
      >
        <View className="relative h-44 bg-gray-100 overflow-hidden">
          <Image
            source={{ uri: imageUrl }}
            className="w-full h-full group-hover:scale-105 transition-transform duration-500"
            resizeMode="cover"
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.68)']}
            className="absolute inset-0"
          />
          <View className="absolute top-3 left-3 bg-white/95 px-2.5 py-1 rounded-full flex-row items-center shadow-sm">
            <Zap size={11} color="#E6761D" fill="#E6761D" />
            <Text className="text-[10px] font-black text-[#0b3856] ml-1 uppercase">
              Similar
            </Text>
          </View>
          <View className="absolute top-3 right-3 bg-[#E6761D] px-3 py-1.5 rounded-full shadow-md">
            <Text className="text-white text-xs font-black">
              {displayPrice.startsWith('₹') || displayPrice === 'On Request'
                ? displayPrice
                : `₹${displayPrice}`}
            </Text>
          </View>
          <View className="absolute bottom-3 left-3 right-3">
            <Text
              className="text-white font-black text-base leading-tight"
              numberOfLines={1}
            >
              {item?.title || 'Residential Property'}
            </Text>
            <View className="flex-row items-center mt-1">
              <MapPin size={13} color="white" />
              <Text
                className="text-white/90 text-xs ml-1 flex-1"
                numberOfLines={1}
              >
                {item?.location || 'Pune'}
              </Text>
            </View>
          </View>
          {isOpening && (
            <View className="absolute inset-0 bg-[#0b3856]/75 items-center justify-center">
              <ActivityIndicator size="small" color="#ffffff" />
              <Text className="text-white text-xs font-bold mt-2">
                Opening details...
              </Text>
            </View>
          )}
        </View>

        <View className="p-3.5">
          <View className="flex-row gap-2 mb-3">
            <View className="flex-1 bg-slate-50 rounded-xl px-2 py-2">
              <Text className="text-[10px] text-gray-500">Config</Text>
              <Text
                className="text-xs font-bold text-gray-900 mt-0.5"
                numberOfLines={1}
              >
                {displayConfig}
              </Text>
            </View>
            <View className="flex-1 bg-slate-50 rounded-xl px-2 py-2">
              <Text className="text-[10px] text-gray-500">Area</Text>
              <Text
                className="text-xs font-bold text-gray-900 mt-0.5"
                numberOfLines={1}
              >
                {displayArea ? `${displayArea} sq ft` : 'N/A'}
              </Text>
            </View>
            <View className="flex-1 bg-slate-50 rounded-xl px-2 py-2">
              <Text className="text-[10px] text-gray-500">Rate</Text>
              <Text
                className="text-xs font-bold text-gray-900 mt-0.5"
                numberOfLines={1}
              >
                {displayPerSqFt ? `₹${displayPerSqFt}` : 'N/A'}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-semibold text-gray-500">
              Tap to view full property
            </Text>
            <View
              className={`px-3 py-1.5 rounded-full ${
                isOpening
                  ? 'bg-[#0b3856]'
                  : 'bg-[#0b3856]/10 group-hover:bg-[#0b3856]'
              }`}
            >
              <Text
                className={`text-xs font-black ${
                  isOpening
                    ? 'text-white'
                    : 'text-[#0b3856] group-hover:text-white'
                }`}
              >
                {isOpening ? 'Opening' : 'View Details'}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const fullDescription =
    property?.description ||
    `Looking for a comfortable home in a well-connected location? This Budget-Friendly 2 BHK in ${
      property?.location || 'Pune'
    } offers a great combination of space, location, and value. Perfect for families or individuals looking to settle in a peaceful yet prime area.`;
  const shortDescription = fullDescription.slice(0, 150) + '...';
  const displayDescription = expandedDesc ? fullDescription : shortDescription;

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        ref={scrollRef}
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={['#0B3856', '#0C3854']}
          className="py-3 px-4 border-b border-white/10"
        >
          <TouchableOpacity
            onPress={onBack}
            className="flex-row items-center self-start py-2 pr-4"
          >
            <ArrowLeft size={18} color="white" />
            <Text className="text-white text-sm font-medium ml-1">
              Back to Properties
            </Text>
          </TouchableOpacity>
        </LinearGradient>

        <LinearGradient
          colors={['#ffffff', '#f8fafc', '#ffffff']}
          className="px-4 pt-0 pb-24"
        >
          {/* Image Gallery Section */}
          <View
            className="relative rounded-2xl overflow-hidden bg-gray-900 shadow-xl mt-6"
            style={{ height: galleryHeight }}
          >
            <Image
              source={{ uri: activeImage }}
              className="w-full h-full"
              resizeMode="cover"
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              className="absolute inset-0"
            />
            <View className="absolute inset-0 items-center justify-center opacity-20">
              <Text
                className={`${
                  isMobile ? 'text-2xl' : 'text-5xl'
                } text-white font-black`}
              >
                ResaleExpert.in
              </Text>
            </View>
            <View className="absolute top-4 left-4 right-4 flex-row justify-between">
              <View className="flex-1 pr-3">
                <Text
                  className={`${
                    isMobile ? 'text-base' : 'text-xl'
                  } text-white font-black`}
                  numberOfLines={1}
                >
                  {[
                    property?.property_type || 'Residential',
                    property?.unit_type,
                    property?.subtype,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                </Text>
                <View className="flex-row items-center mt-1">
                  <MapPin size={14} color="white" />
                  <Text className="text-white ml-1" numberOfLines={1}>
                    {property?.location || property?.city || 'Pune'}
                  </Text>
                </View>
              </View>
              <Text className="text-white font-bold">{code}</Text>
            </View>
            <View className="absolute top-4 right-4 gap-2">
              <TouchableOpacity
                onPress={handleShare}
                className="w-10 h-10 rounded-full bg-white/80 items-center justify-center"
              >
                <ShareIcon size={18} color="#374151" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  Alert.alert('Save', 'Property saved to wishlist')
                }
                className="w-10 h-10 rounded-full bg-white/80 items-center justify-center"
              >
                <Heart size={18} color="#374151" />
              </TouchableOpacity>
            </View>
            <View className="absolute bottom-16 left-4 right-4 flex-row justify-between items-end">
              <View>
                <Text
                  className={`${
                    isMobile ? 'text-2xl' : 'text-3xl'
                  } text-white font-black`}
                >
                  ₹{formatPrice(price)}
                </Text>
                <Text className="text-white/85 mt-1">
                  ₹{perSqFt.toLocaleString('en-IN')}/sq ft
                </Text>
              </View>
              <View className="items-end gap-2">
                <View className="bg-black/55 px-3 py-1.5 rounded-full flex-row items-center border border-white/20">
                  <Eye size={13} color="white" />
                  <Text className="text-white text-xs font-black ml-1">
                    {formattedViews} views
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-white/80">Carpet Area</Text>
                  <Text className="text-white font-bold">
                    {area || '-'} sq ft
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              onPress={showPrevImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/30 p-2 rounded-full"
            >
              <ChevronLeft size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={showNextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/30 p-2 rounded-full"
            >
              <ChevronRight size={20} color="white" />
            </TouchableOpacity>
            <View className="absolute bottom-4 left-4 right-4 flex-row justify-between items-center">
              <View className="flex-row gap-2">
                {galleryImages.slice(0, 6).map((_, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => setImageIndex(idx)}
                    className={`h-2 rounded-full ${
                      idx === imageIndex ? 'w-8 bg-white' : 'w-2 bg-white/50'
                    }`}
                  />
                ))}
              </View>
              <TouchableOpacity
                onPress={() => setShowPhotosModal(true)}
                className="bg-black/50 px-3 py-1 rounded-full flex-row items-center"
              >
                <Camera size={12} color="white" />
                <Text className="text-white text-xs ml-1">
                  {imageIndex + 1} / {galleryImages.length}
                </Text>
              </TouchableOpacity>
            </View>
            <View className="absolute bottom-16 right-4 flex-row gap-2">
              <TouchableOpacity
                onPress={() => setShowPhotosModal(true)}
                className="bg-white/70 px-3 py-1.5 rounded-lg flex-row items-center gap-1"
              >
                <Camera size={12} color="#374151" />
                <Text className="text-xs font-semibold">Photos</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={openVirtualTour}
                className="bg-white/70 px-3 py-1.5 rounded-lg flex-row items-center gap-1"
              >
                <Camera size={12} color="#374151" />
                <Text className="text-xs font-semibold">Tour</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View
            className={`flex-row gap-6 ${!isMobile ? 'flex-row' : 'flex-col'}`}
          >
            <View className={`${!isMobile ? 'flex-1' : 'w-full'}`}>
              {/* Property Description with Read more */}
              <View className="bg-white rounded-xl border border-orange-300 p-4 mt-4 shadow-sm transition-all hover:shadow-lg">
                <Text className="font-bold text-gray-900 text-lg mb-2">
                  Property Description
                </Text>
                <Text className="text-gray-700 text-sm leading-5">
                  {displayDescription}
                </Text>
                {fullDescription.length > 150 && (
                  <TouchableOpacity
                    onPress={() => setExpandedDesc(!expandedDesc)}
                    className="mt-2"
                  >
                    <Text className="text-indigo-600 text-xs font-medium">
                      {expandedDesc ? 'Read less' : 'Read more'}
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={callExecutive}
                  className="flex-row items-center mt-3 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 self-start"
                >
                  <Phone size={14} color="#2563EB" />
                  <Text className="text-blue-700 font-semibold ml-2 text-sm">
                    Call now to schedule a site visit.
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Property Details Grid */}
              <View className="bg-white rounded-xl border border-orange-300 mt-2 overflow-hidden transition-all hover:shadow-lg">
                <View className="px-4 pt-3">
                  <Text className="font-bold text-gray-900 text-lg">
                    Property Details
                  </Text>
                </View>
                <View className="flex-row flex-wrap">
                  {details.map((detail, idx) => (
                    <View
                      key={idx}
                      className="w-1/2 p-3"
                    >
                      <View className="flex-row items-center gap-2">
                        <View className="w-8 h-8 rounded-lg bg-gray-50 items-center justify-center">
                          <detail.icon size={16} color="#9ca3af" />
                        </View>
                        <View className="flex-1">
                          <Text className="text-[11px] text-gray-500">
                            {detail.label}
                          </Text>
                          <Text
                            className="text-xs font-bold text-gray-900"
                            numberOfLines={2}
                          >
                            {detail.value}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              {/* Amenities & Furnishing */}
              <View className="flex-row gap-3 mt-2">
                <View className="flex-1 bg-white rounded-xl border border-orange-300 p-3 transition-all hover:shadow-lg">
                  <Text className="font-bold text-gray-900 mb-2 text-sm">
                    Amenities
                  </Text>
                  <View className="flex-row flex-wrap gap-1.5">
                    {(amenities.length
                      ? amenities
                      : [
                          'Elevator',
                          'Water Treatment',
                          'CCTV',
                          'Fire Safety',
                          'Power Backup',
                          'Parking',
                        ]
                    )
                      .slice(0, 8)
                      .map(item => (
                        <View
                          key={item}
                          className="bg-emerald-50 px-2 py-1 rounded-md"
                        >
                          <Text className="text-[10px] text-emerald-700">
                            {item}
                          </Text>
                        </View>
                      ))}
                  </View>
                </View>
                <View className="flex-1 bg-white rounded-xl border border-orange-300 p-3 transition-all hover:shadow-lg">
                  <Text className="font-bold text-gray-900 mb-2 text-sm">
                    Furnishing Items
                  </Text>
                  <View className="flex-row flex-wrap gap-1.5">
                    {(furnishingItems.length
                      ? furnishingItems
                      : [
                          'Ceiling Fan',
                          'Tube Light',
                          'Curtains',
                          'Modular Kitchen',
                        ]
                    )
                      .slice(0, 8)
                      .map(item => (
                        <View
                          key={item}
                          className="bg-blue-50 px-2 py-1 rounded-md"
                        >
                          <Text className="text-[10px] text-blue-700">
                            {item}
                          </Text>
                        </View>
                      ))}
                  </View>
                </View>
              </View>

              {/* AI Property Analysis */}
              <View className="bg-white rounded-xl border border-orange-300 p-4 mt-2 transition-all hover:shadow-lg">
                <View className="flex-row items-center gap-2 mb-3">
                  <Bot size={18} color="#7c3aed" />
                  <Text className="font-bold text-gray-900 text-base">
                    AI Property Analysis
                  </Text>
                </View>
                <View className="flex-row flex-wrap gap-2">
                  <View className="flex-1 min-w-[45%] bg-gray-50 rounded-xl px-3 py-2">
                    <Text className="text-[11px] text-gray-500">AI Score</Text>
                    <Text className="font-bold text-purple-600">
                      {property?.ai_score || aiMetrics.score}/100
                    </Text>
                  </View>
                  <View className="flex-1 min-w-[45%] bg-gray-50 rounded-xl px-3 py-2">
                    <Text className="text-[11px] text-gray-500">Growth</Text>
                    <Text className="font-bold text-green-600">
                      {property?.growth || aiMetrics.growth}
                    </Text>
                  </View>
                  <View className="flex-1 min-w-[45%] bg-gray-50 rounded-xl px-3 py-2">
                    <Text className="text-[11px] text-gray-500">
                      Investment
                    </Text>
                    <Text className="font-bold text-blue-600">
                      {property?.investment_grade || aiMetrics.grade}
                    </Text>
                  </View>
                  <View className="flex-1 min-w-[45%] bg-gray-50 rounded-xl px-3 py-2">
                    <Text className="text-[11px] text-gray-500">
                      ROI Potential
                    </Text>
                    <Text className="font-bold text-orange-600">
                      {property?.roi_potential || aiMetrics.roi}
                    </Text>
                  </View>
                </View>
              </View>

              {/* AI Recommendations with Blur/Unlock */}
              <View className="bg-white rounded-xl border border-orange-300 p-4 mt-2 relative transition-all hover:shadow-lg">
                <View className="flex-row items-center gap-2 mb-3">
                  <TrendingUp size={18} color="#2563EB" />
                  <Text className="font-bold text-gray-900 text-base">
                    AI Recommendations
                  </Text>
                </View>
                <View className="blur-md">
                  <View className="flex-row flex-wrap gap-3">
                    <View className="flex-1 bg-green-50 rounded-lg p-3">
                      <Text className="text-xs text-gray-500">
                        Price Appreciation
                      </Text>
                      <Text className="text-xl font-bold text-green-600">
                        {aiMetrics.growth}
                      </Text>
                      <Text className="text-[10px] text-gray-500 mt-1">
                        Next 12 months
                      </Text>
                    </View>
                    <View className="flex-1 bg-blue-50 rounded-lg p-3">
                      <Text className="text-xs text-gray-500">
                        Market Position
                      </Text>
                      <Text className="text-xl font-bold text-blue-600">
                        {aiMetrics.marketRank}
                      </Text>
                      <Text className="text-[10px] text-gray-500 mt-1">
                        In this locality
                      </Text>
                    </View>
                    <View className="w-full bg-orange-50 rounded-lg p-3 mt-2">
                      <Text className="text-xs text-gray-500">
                        Investment Timing
                      </Text>
                      <Text className="text-xl font-bold text-orange-600">
                        {aiMetrics.recommendation}
                      </Text>
                      <Text className="text-[10px] text-gray-500 mt-1">
                        Based on price and location
                      </Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => setShowPricingModal(true)}
                  className="absolute inset-0 bg-white/80 items-center justify-center rounded-xl"
                >
                  <View className="bg-white p-4 rounded-xl shadow-lg border w-64 items-center">
                    <Lock size={24} color="#E6761D" />
                    <Text className="font-bold text-gray-900 mt-2">
                      Premium AI Insights
                    </Text>
                    <Text className="text-xs text-gray-500 text-center mt-1">
                      Detailed recommendations & market analysis
                    </Text>
                    <Text className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg mt-3 text-xs font-bold">
                      Unlock for ₹299
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Property Highlights */}
              <View className="bg-white rounded-xl border border-orange-300 p-4 mt-2 transition-all hover:shadow-lg">
                <Text className="font-bold text-gray-900 text-base mb-3">
                  Property Highlights
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  <View className="w-[48%] h-12 rounded-xl px-3 flex-row transition-all hover:bg-orange-50/30 items-center justify-between">
                    <View className="flex-row items-center gap-2">
                      <Bed size={16} color="#E6761D" />
                      <Text className="text-xs text-gray-600">Bedrooms</Text>
                    </View>
                    <Text className="text-xs font-bold text-gray-900">
                      {property?.bedrooms || 2}
                    </Text>
                  </View>
                  <View className="w-[48%] h-12 rounded-xl px-3 flex-row transition-all hover:bg-orange-50/30 items-center justify-between">
                    <View className="flex-row items-center gap-2">
                      <Bath size={16} color="#E6761D" />
                      <Text className="text-xs text-gray-600">Bathrooms</Text>
                    </View>
                    <Text className="text-xs font-bold text-gray-900">
                      {property?.bathrooms || 2}
                    </Text>
                  </View>
                  <View className="w-[48%] h-12 rounded-xl px-3 flex-row transition-all hover:bg-orange-50/30 items-center justify-between">
                    <View className="flex-row items-center gap-2">
                      <Car size={16} color="#E6761D" />
                      <Text className="text-xs text-gray-600">Parking</Text>
                    </View>
                    <Text className="text-xs font-bold text-gray-900">
                      {property?.parking || 1}
                    </Text>
                  </View>
                  <View className="w-[48%] h-12 rounded-xl px-3 flex-row transition-all hover:bg-orange-50/30 items-center justify-between">
                    <View className="flex-row items-center gap-2">
                      <Building2 size={16} color="#E6761D" />
                      <Text className="text-xs text-gray-600">Balcony</Text>
                    </View>
                    <Text className="text-xs font-bold text-gray-900">
                      {property?.balcony || 2}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Smart EMI Calculator - exactly as HTML (with slider) */}
              <View className="mt-2 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-orange-300">
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center">
                    <Calculator size={18} color="#1e3a8a" />
                    <Text className="font-semibold text-blue-900 ml-2">
                      Smart EMI Calculator
                    </Text>
                  </View>
                  <View className="bg-blue-100 px-2 py-1 rounded">
                    <Text className="text-xs text-blue-800">
                      Resale Property
                    </Text>
                  </View>
                </View>

                <View className="space-y-3">
                  {/* Loan Percentage */}
                  <View>
                    <View className="flex-row justify-between text-sm mb-1">
                      <Text className="text-gray-600">Loan Percentage</Text>
                      <Text className="font-semibold">{emiLoanPercent}%</Text>
                    </View>
                    <View className="flex-row space-x-2 mb-3">
                      {[70, 75, 80, 85, 90].map(p => (
                        <TouchableOpacity
                          key={p}
                          onPress={() => setEmiLoanPercent(p)}
                          className={`flex-1 py-1.5 rounded text-xs ${
                            emiLoanPercent === p
                              ? 'bg-[#E6761D]'
                              : 'bg-gray-100'
                          }`}
                        >
                          <Text
                            className={`text-center text-xs ${
                              emiLoanPercent === p
                                ? 'text-white'
                                : 'text-gray-700'
                            }`}
                          >
                            {p}%
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Loan Amount & Self Payment */}
                  <View className="flex-row gap-3 text-sm">
                    <View className="flex-1 bg-white p-2 rounded">
                      <Text className="text-gray-600 text-xs">Loan Amount</Text>
                      <Text className="font-bold text-blue-700">
                        ₹{formatPrice(emiLoanAmount)}
                      </Text>
                      <Text className="text-xs text-gray-500">
                        ({emiLoanPercent}% of property value)
                      </Text>
                    </View>
                    <View className="flex-1 bg-white p-2 rounded">
                      <Text className="text-gray-600 text-xs">
                        Self Payment
                      </Text>
                      <Text className="font-bold text-green-700">
                        ₹{formatPrice(totalCost - emiLoanAmount)}
                      </Text>
                      <Text className="text-xs text-gray-500">
                        ({100 - emiLoanPercent}% required)
                      </Text>
                    </View>
                  </View>

                  {/* Interest Rate Slider */}
                  <View>
                    <View className="flex-row justify-between text-sm mb-1">
                      <Text className="text-gray-600">Interest Rate</Text>
                      <Text className="font-semibold">
                        {emiInterestRate.toFixed(1)}%
                      </Text>
                    </View>
                    <Slider
                      containerStyle={{ width: '100%', height: 40 }}
                      minimumValue={7}
                      maximumValue={12}
                      step={0.1}
                      value={emiInterestRate}
                      onValueChange={value =>
                        setEmiInterestRate(
                          Array.isArray(value) ? value[0] : value,
                        )
                      }
                      minimumTrackTintColor="#E6761D"
                      maximumTrackTintColor="#E5E7EB"
                      thumbTintColor="#E6761D"
                    />
                    <View className="flex-row justify-between text-xs text-gray-500 mt-1">
                      <Text>7%</Text>
                      <Text>9.5%</Text>
                      <Text>12%</Text>
                    </View>
                  </View>

                  {/* Loan Tenure */}
                  <View>
                    <View className="flex-row justify-between text-sm mb-1">
                      <Text className="text-gray-600">Loan Tenure</Text>
                      <Text className="font-semibold">{emiTenure} years</Text>
                    </View>
                    <View className="flex-row space-x-2">
                      {[15, 20, 25, 30].map(t => (
                        <TouchableOpacity
                          key={t}
                          onPress={() => setEmiTenure(t)}
                          className={`flex-1 py-1.5 rounded text-xs ${
                            emiTenure === t ? 'bg-[#E6761D]' : 'bg-gray-100'
                          }`}
                        >
                          <Text
                            className={`text-center text-xs ${
                              emiTenure === t ? 'text-white' : 'text-gray-700'
                            }`}
                          >
                            {t} years
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* EMI Card with breakdown */}
                  <View className="bg-white p-3 rounded-lg border border-orange-300 transition-all hover:shadow-lg">
                    <View className="flex-row items-center justify-between mb-1">
                      <Text className="text-gray-700">Monthly EMI</Text>
                      <Text className="text-2xl font-bold text-[#E6761D]">
                        ₹{emi.toLocaleString('en-IN')}
                      </Text>
                    </View>
                    <Text className="text-xs text-gray-500">
                      For ₹{formatPrice(emiLoanAmount)} loan at{' '}
                      {emiInterestRate.toFixed(1)}% for {emiTenure} years
                    </Text>
                    <View className="flex-row gap-2 mt-2 text-xs">
                      <View className="flex-1 text-center p-2 bg-blue-50 rounded">
                        <Text className="text-gray-600">Principal</Text>
                        <Text className="font-semibold">
                          ₹{formatPrice(emiLoanAmount)}
                        </Text>
                      </View>
                      <View className="flex-1 text-center p-2 bg-red-50 rounded">
                        <Text className="text-gray-600">Interest</Text>
                        <Text className="font-semibold">
                          ₹{formatPrice(emiTotalInterest)}
                        </Text>
                      </View>
                      <View className="flex-1 text-center p-2 bg-green-50 rounded">
                        <Text className="text-gray-600">Total</Text>
                        <Text className="font-semibold">
                          ₹{formatPrice(emiTotalPayment)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Alternative Bank Offers */}
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      onPress={() => {
                        setEmiTenure(15);
                        setEmiInterestRate(8.4);
                      }}
                      className="flex-1 text-xs p-2 bg-white rounded items-center"
                    >
                      <Text className="font-medium">15 Years</Text>
                      <Text className="text-gray-600 text-[11px]">8.4%</Text>
                      <Text className="text-[#E6761D] font-semibold text-[11px]">
                        ₹58,733
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setEmiTenure(20);
                        setEmiInterestRate(8.5);
                      }}
                      className="flex-1 text-xs p-2 bg-white rounded items-center"
                    >
                      <Text className="font-medium">20 Years</Text>
                      <Text className="text-gray-600 text-[11px]">8.5%</Text>
                      <Text className="text-[#E6761D] font-semibold text-[11px]">
                        ₹52,069
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setEmiTenure(25);
                        setEmiInterestRate(8.6);
                      }}
                      className="flex-1 text-xs p-2 bg-white rounded items-center"
                    >
                      <Text className="font-medium">25 Years</Text>
                      <Text className="text-gray-600 text-[11px]">8.6%</Text>
                      <Text className="text-[#E6761D] font-semibold text-[11px]">
                        ₹48,719
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Info Note */}
                  <View className="flex-row items-start mt-2">
                    <Info
                      size={12}
                      color="#6B7280"
                      style={{ marginRight: 4, marginTop: 2 }}
                    />
                    <Text className="text-xs text-gray-500 flex-1">
                      EMI calculated for illustrative purposes. Actual rates may
                      vary based on credit score, bank policies, and market
                      conditions.
                    </Text>
                  </View>
                </View>
              </View>

              {/* Price Breakdown */}
              <View className="bg-white rounded-xl border border-orange-300 p-4 mt-2 transition-all hover:shadow-lg">
                <Text className="font-bold text-gray-900 text-base mb-3">
                  Price Breakdown
                </Text>
                <View className="space-y-2">
                  <View className="flex-row justify-between py-2">
                    <Text className="text-gray-600">Base Price</Text>
                    <Text className="font-bold text-gray-900">
                      ₹{formatPrice(price)}
                    </Text>
                  </View>
                  <View className="space-y-1">
                    <Text className="text-sm font-semibold text-gray-700">
                      Total Taxes & Charges
                    </Text>
                    <View className="flex-row justify-between text-sm">
                      <Text className="text-gray-600">
                        Stamp Duty{' '}
                        <Text className="text-xs text-green-600">7%</Text>
                      </Text>
                      <Text className="font-medium">
                        ₹{formatPrice(Math.round(price * 0.07))}
                      </Text>
                    </View>
                    <View className="flex-row justify-between text-sm">
                      <Text className="text-gray-600">
                        Registration{' '}
                        <Text className="text-xs text-green-600">1%</Text>
                      </Text>
                      <Text className="font-medium">
                        ₹{formatPrice(Math.round(price * 0.01))}
                      </Text>
                    </View>
                    <View className="flex-row justify-between text-sm">
                      <Text className="text-gray-600">
                        Legal & Documentation
                      </Text>
                      <Text className="font-medium">₹{formatPrice(10000)}</Text>
                    </View>
                  </View>
                  <View className="bg-orange-50 p-3 rounded-lg flex-row justify-between items-center mt-2">
                    <View>
                      <Text className="font-bold text-gray-900">
                        Total Cost
                      </Text>
                      <Text className="text-xs text-gray-500">
                        All inclusive
                      </Text>
                    </View>
                    <Text className="text-[#E6761D] font-bold text-lg">
                      ₹{formatPrice(totalCost)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* AI Investment Analysis with Unlock */}
              <View className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-orange-300 p-4 mt-2 relative overflow-hidden">
                <View className="flex-row items-center gap-2 mb-3">
                  <Crown size={18} color="#7c3aed" />
                  <Text className="font-bold text-gray-900 text-base">
                    AI Investment Analysis
                  </Text>
                </View>
                <View className="blur-md">
                  <View className="space-y-2">
                    <View className="bg-white rounded-lg p-3 flex-row justify-between">
                      <Text className="text-gray-600">
                        Purchase Recommendation
                      </Text>
                      <Text className="font-bold text-green-600">
                        {aiMetrics.recommendation}
                      </Text>
                    </View>
                    <View className="bg-white rounded-lg p-3 flex-row justify-between">
                      <Text className="text-gray-600">
                        Expected ROI (5 years)
                      </Text>
                      <Text className="font-bold text-blue-600">
                        {aiMetrics.roi}
                      </Text>
                    </View>
                    <View className="bg-white rounded-lg p-3 flex-row justify-between">
                      <Text className="text-gray-600">Risk Level</Text>
                      <Text className="font-bold text-yellow-600">
                        {aiMetrics.risk}
                      </Text>
                    </View>
                    <View className="bg-white rounded-lg p-3 flex-row justify-between">
                      <Text className="text-gray-600">Market Timing</Text>
                      <Text className="font-bold text-purple-600">
                        {aiMetrics.timing}
                      </Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => setShowPricingModal(true)}
                  className="absolute inset-0 bg-white/80 items-center justify-center rounded-xl"
                >
                  <View className="bg-white p-4 rounded-xl shadow-lg border w-64 items-center">
                    <Crown size={24} color="#E6761D" />
                    <Text className="font-bold text-gray-900 mt-2">
                      Investment Analysis
                    </Text>
                    <Text className="text-xs text-gray-500 text-center mt-1">
                      Get AI-powered investment insights
                    </Text>
                    <Text className="bg-purple-600 text-white px-4 py-2 rounded-lg mt-3 text-xs font-bold">
                      Unlock ₹299
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Location & Connectivity */}
              <View className="bg-white rounded-xl border border-orange-300 shadow-sm p-4 mt-2 transition-all hover:shadow-lg">
                <View className="flex-row items-center gap-2 mb-3">
                  <MapPin size={18} color="#E6761D" />
                  <Text className="font-bold text-[#0b3856] text-base">
                    Location & Connectivity
                  </Text>
                </View>
                <View className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <View className="rounded-lg p-3 bg-[#0b3856]/5">
                    <Text className="font-semibold text-[#0b3856] mb-2 text-sm">
                      🚆 Transportation
                    </Text>
                    <View className="space-y-1">
                      <View className="flex-row items-center gap-2">
                        <View className="w-1.5 h-1.5 rounded-full bg-[#E6761D]" />
                        <Text className="text-xs text-gray-700">
                          Pune Station – 0.5 km
                        </Text>
                      </View>
                      <View className="flex-row items-center gap-2">
                        <View className="w-1.5 h-1.5 rounded-full bg-[#E6761D]" />
                        <Text className="text-xs text-gray-700">
                          Airport – 8 km
                        </Text>
                      </View>
                      <View className="flex-row items-center gap-2">
                        <View className="w-1.5 h-1.5 rounded-full bg-[#E6761D]" />
                        <Text className="text-xs text-gray-700">
                          Highway Access – 1 km
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View className="rounded-lg p-3 bg-[#E6761D]/10">
                    <Text className="font-semibold text-[#E6761D] mb-2 text-sm">
                      🏥 Essential Services
                    </Text>
                    <Text className="text-xs text-gray-700">Not Available</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={openNearbyLocation}
                  className="mt-4 bg-[#E6761D] py-2.5 rounded-lg items-center"
                >
                  <Text className="text-white font-semibold text-sm">
                    View Nearby Location
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Similar Properties - vertical list on mobile, grid on tablet/desktop */}
              <View className="mt-5 bg-white rounded-2xl border border-orange-300 p-4 transition-all hover:shadow-lg shadow-sm">
                <View className="flex-row items-center justify-between mb-3">
                  <View>
                    <Text className="font-black text-[#0b3856] text-lg">
                      Similar Properties
                    </Text>
                    <Text className="text-xs text-gray-500 mt-0.5">
                      Choose another property to open its full details
                    </Text>
                  </View>
                  <View className="bg-orange-50 px-2.5 py-1 rounded-full">
                    <Text className="text-[#E6761D] text-xs font-black">
                      {visibleSimilar.length}
                    </Text>
                  </View>
                </View>
                {visibleSimilar.length === 0 ? (
                  <View className="bg-white rounded-xl p-4 items-center transition-all hover:bg-orange-50/30">
                    <Text className="text-gray-500 text-sm font-medium">
                      No similar properties available right now.
                    </Text>
                  </View>
                ) : isMobile ? (
                  <View className="space-y-4">
                    {visibleSimilar.map((item: any) => (
                      <SimilarPropertyCard
                        key={item.id || item.property_code || item.code}
                        item={item}
                      />
                    ))}
                  </View>
                ) : (
                  <View className="grid grid-cols-2 gap-4">
                    {visibleSimilar.map((item: any) => (
                      <SimilarPropertyCard
                        key={item.id || item.property_code || item.code}
                        item={item}
                      />
                    ))}
                  </View>
                )}
              </View>
            </View>

            {/* Right Sidebar - only on tablet/desktop */}
            {!isMobile && (
              <View className="w-80 space-y-4">
                <DesktopContactCard />
                <View className="bg-white rounded-xl border border-orange-300 p-4 transition-all hover:shadow-lg">
                  <Text className="font-bold text-gray-900 mb-3">
                    Property Activity
                  </Text>
                  <View className="space-y-2">
                    <View className="flex-row justify-between bg-green-50 p-2 rounded-lg">
                      <View className="flex-row items-center gap-2">
                        <Eye size={14} color="#059669" />
                        <Text className="text-xs text-gray-700">
                          Total Views
                        </Text>
                      </View>
                      <Text className="text-xs font-bold text-green-600">
                        414
                      </Text>
                    </View>
                    <View className="flex-row justify-between bg-blue-50 p-2 rounded-lg">
                      <View className="flex-row items-center gap-2">
                        <Heart size={14} color="#2563EB" />
                        <Text className="text-xs text-gray-700">
                          Shortlisted By
                        </Text>
                      </View>
                      <Text className="text-xs font-bold text-blue-600">
                        23 People
                      </Text>
                    </View>
                    <View className="flex-row justify-between bg-orange-50 p-2 rounded-lg">
                      <View className="flex-row items-center gap-2">
                        <Phone size={14} color="#EA580C" />
                        <Text className="text-xs text-gray-700">
                          Contact Requests
                        </Text>
                      </View>
                      <Text className="text-xs font-bold text-orange-600">
                        12 This Week
                      </Text>
                    </View>
                  </View>
                </View>
                <View className="bg-white rounded-xl border border-orange-300 p-4 transition-all hover:shadow-lg">
                  <Text className="font-bold text-gray-900 mb-3">
                    Property Highlights
                  </Text>
                  <View className="space-y-2">
                    <View className="flex-row justify-between">
                      <Text className="text-xs text-gray-600">Bedrooms</Text>
                      <Text className="text-xs font-bold">2</Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-xs text-gray-600">Bathrooms</Text>
                      <Text className="text-xs font-bold">2</Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-xs text-gray-600">Parking</Text>
                      <Text className="text-xs font-bold">1</Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-xs text-gray-600">Balcony</Text>
                      <Text className="text-xs font-bold">2</Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-xs text-gray-600">
                        Property Type
                      </Text>
                      <Text className="text-xs font-bold">Residential</Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-xs text-gray-600">Built Year</Text>
                      <Text className="text-xs font-bold">2025</Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-xs text-gray-600">Furnishing</Text>
                      <Text className="text-xs font-bold">Un-Furnished</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Customer Reviews - only on mobile */}
          {isMobile && (
            <View className="bg-white rounded-xl border border-orange-300 shadow-sm p-4 mt-4">
              <Text className="font-bold text-gray-900 text-base mb-3">
                Customer Reviews
              </Text>
              <View className="flex-row items-center mb-3">
                <View className="flex-row gap-0.5 mr-2">
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <Star key={i} size={14} color="#FBBF24" fill="#FBBF24" />
                    ))}
                </View>
                <Text className="font-semibold text-gray-900">4.8</Text>
                <Text className="text-gray-500 text-xs ml-2">(24 reviews)</Text>
              </View>
              <View className="space-y-3">
                <View className="rounded-lg p-3 transition-all hover:bg-orange-50/30">
                  <View className="flex-row justify-between mb-1">
                    <View className="flex-row items-center gap-1">
                      <View className="w-6 h-6 rounded-full bg-blue-100 items-center justify-center">
                        <Users size={12} color="#2563EB" />
                      </View>
                      <Text className="font-medium text-gray-900 text-xs">
                        Rajesh Kumar
                      </Text>
                    </View>
                    <View className="flex-row gap-0.5">
                      <Star size={10} color="#FBBF24" fill="#FBBF24" />
                      <Star size={10} color="#FBBF24" fill="#FBBF24" />
                      <Star size={10} color="#FBBF24" fill="#FBBF24" />
                      <Star size={10} color="#FBBF24" fill="#FBBF24" />
                      <Star size={10} color="#FBBF24" fill="#FBBF24" />
                    </View>
                  </View>
                  <Text className="text-gray-700 text-xs">
                    Excellent property with great amenities. Highly recommended!
                  </Text>
                </View>
                <View className="rounded-lg p-3 transition-all hover:bg-orange-50/30">
                  <View className="flex-row justify-between mb-1">
                    <View className="flex-row items-center gap-1">
                      <View className="w-6 h-6 rounded-full bg-blue-100 items-center justify-center">
                        <Users size={12} color="#2563EB" />
                      </View>
                      <Text className="font-medium text-gray-900 text-xs">
                        Priya Sharma
                      </Text>
                    </View>
                    <View className="flex-row gap-0.5">
                      <Star size={10} color="#FBBF24" fill="#FBBF24" />
                      <Star size={10} color="#FBBF24" fill="#FBBF24" />
                      <Star size={10} color="#FBBF24" fill="#FBBF24" />
                      <Star size={10} color="#FBBF24" fill="#FBBF24" />
                      <Star size={10} color="#D1D5DB" />
                    </View>
                  </View>
                  <Text className="text-gray-700 text-xs">
                    Beautiful location and well-maintained property.
                  </Text>
                </View>
                <View className="rounded-lg p-3 transition-all hover:bg-orange-50/30">
                  <View className="flex-row justify-between mb-1">
                    <View className="flex-row items-center gap-1">
                      <View className="w-6 h-6 rounded-full bg-blue-100 items-center justify-center">
                        <Users size={12} color="#2563EB" />
                      </View>
                      <Text className="font-medium text-gray-900 text-xs">
                        Amit Patel
                      </Text>
                    </View>
                    <View className="flex-row gap-0.5">
                      <Star size={10} color="#FBBF24" fill="#FBBF24" />
                      <Star size={10} color="#FBBF24" fill="#FBBF24" />
                      <Star size={10} color="#FBBF24" fill="#FBBF24" />
                      <Star size={10} color="#FBBF24" fill="#FBBF24" />
                      <Star size={10} color="#FBBF24" fill="#FBBF24" />
                    </View>
                  </View>
                  <Text className="text-gray-700 text-xs">
                    Perfect for families. Great connectivity and facilities.
                  </Text>
                </View>
              </View>
            </View>
          )}
        </LinearGradient>

        <Footer onTabChange={onTabChange} />
      </ScrollView>

      {isMobile && <MobileContactBar />}
      <PricingModal />
      <MessageModal />
      <PhotosModal />
    </View>
  );
};

export default PropertyDetailScreen;
