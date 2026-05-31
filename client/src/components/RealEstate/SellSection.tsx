import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  CircleCheck,
  Home,
  IndianRupee,
  X,
} from 'lucide-react-native';
import { contactService } from '../../services/api';

const FALLBACK_SELL_IMAGE =
  'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=600';

const resolveSellImage = (image?: string) => {
  const trimmed = image?.trim();
  if (!trimmed || trimmed.includes('/hously/home/sell-property.jpg')) {
    return FALLBACK_SELL_IMAGE;
  }
  return trimmed;
};

const PROPERTY_TYPES = ['Agriculture Land', 'Commercial', 'Residential'];
const UNIT_TYPES = [
  '1BHK',
  '2.5BHK',
  '2BHK',
  '3.5BHK',
  '3BHK',
  '4BHK',
  '5BHK',
  '6BHK',
];

const WHY_POINTS = [
  {
    title: 'AI-Based Valuation:',
    text: 'Get an accurate resale price instantly.',
    muted: false,
  },
  {
    title: 'Verified Buyers Only:',
    text: 'Serious buyers, no time-wasters.',
    muted: false,
  },
  {
    title: 'Zero Listing Fees:',
    text: 'List your property free of cost.',
    muted: true,
  },
  {
    title: 'Full Support:',
    text: 'From paperwork to home loan assistance.',
    muted: false,
  },
  {
    title: 'Trusted Experts:',
    text: "Pune's leading resale property advisors.",
    muted: false,
  },
];

type ValuationForm = {
  name: string;
  phone: string;
  email: string;
  propertyType: string;
  unitType: string;
  society: string;
  location: string;
  carpetArea: string;
};

const emptyValuationForm: ValuationForm = {
  name: '',
  phone: '',
  email: '',
  propertyType: '',
  unitType: '',
  society: '',
  location: '',
  carpetArea: '',
};

const estimateRate = (propertyType: string, unitType: string) => {
  if (propertyType === 'Commercial') return 14500;
  if (propertyType === 'Agriculture Land') return 3200;
  if (unitType.includes('4') || unitType.includes('5') || unitType.includes('6')) {
    return 13200;
  }
  if (unitType.includes('3')) return 11800;
  if (unitType.includes('2')) return 10500;
  return 9500;
};

const formatEstimate = (value: number) => {
  if (!value) return 'On request';
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(2).replace(/\.00$/, '')}Cr`;
  }
  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(2).replace(/\.00$/, '')}L`;
  }
  return `₹${value.toLocaleString('en-IN')}`;
};

const ModalHeader = ({
  title,
  subtitle,
  iconSize = 18,
  onClose,
}: {
  title: string;
  subtitle: string;
  iconSize?: number;
  onClose: () => void;
}) => (
  <LinearGradient
    colors={['#1A2B3C', '#2D3F52']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={{
      paddingHorizontal: 20,
      paddingVertical: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    }}
  >
    <View
      style={{
        width: iconSize === 18 ? 38 : 36,
        height: iconSize === 18 ? 38 : 36,
        borderRadius: iconSize === 18 ? 10 : 9,
        backgroundColor: 'rgba(230,118,29,0.18)',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Home size={iconSize} color="#E6761D" />
    </View>
    <View style={{ flex: 1, minWidth: 0 }}>
      <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600' }}>
        {title}
      </Text>
      <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 2 }}>
        {subtitle}
      </Text>
    </View>
    <TouchableOpacity
      onPress={onClose}
      activeOpacity={0.85}
      style={{
        width: iconSize === 18 ? 30 : 28,
        height: iconSize === 18 ? 30 : 28,
        borderRadius: iconSize === 18 ? 8 : 7,
        backgroundColor: 'rgba(255,255,255,0.08)',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <X size={iconSize === 18 ? 15 : 13} color="#FFFFFF" />
    </TouchableOpacity>
  </LinearGradient>
);

const ValuationField = ({
  label,
  required,
  ...props
}: {
  label: string;
  required?: boolean;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  maxLength?: number;
}) => (
  <View style={{ width: '48%', marginBottom: 12 }}>
    <Text
      style={{
        color: '#6B7280',
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 5,
      }}
    >
      {label} {required && <Text style={{ color: '#EF4444' }}>*</Text>}
    </Text>
    <TextInput
      {...props}
      placeholderTextColor="#9CA3AF"
      style={{
        height: 38,
        borderWidth: 1,
        borderColor: '#E4E7EB',
        borderRadius: 8,
        paddingHorizontal: 12,
        color: '#1F2937',
        backgroundColor: '#FFFFFF',
        fontSize: 13,
      }}
    />
  </View>
);

const OptionGroup = ({
  label,
  value,
  options,
  onSelect,
}: {
  label: string;
  value: string;
  options: string[];
  onSelect: (value: string) => void;
}) => (
  <View style={{ width: '48%', marginBottom: 12 }}>
    <Text
      style={{
        color: '#6B7280',
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 5,
      }}
    >
      {label} <Text style={{ color: '#EF4444' }}>*</Text>
    </Text>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 6 }}
    >
      {options.map(option => {
        const active = value === option;
        return (
          <TouchableOpacity
            key={option}
            activeOpacity={0.85}
            onPress={() => onSelect(option)}
            style={{
              height: 38,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: active ? '#E6761D' : '#E4E7EB',
              backgroundColor: active ? '#FFF4EC' : '#FFFFFF',
              paddingHorizontal: 10,
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                color: active ? '#C95F0C' : '#1F2937',
                fontSize: 12,
                fontWeight: '700',
              }}
            >
              {option}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  </View>
);

const SellSection = ({
  onPostProperty,
  content,
}: {
  onPostProperty?: () => void;
  content?: {
    sellTitle?: string;
    sellSubtitle?: string;
    sellImage?: string;
    soldValue?: string;
    soldLabel?: string;
  };
}) => {
  const [whyVisible, setWhyVisible] = useState(false);
  const [valuationVisible, setValuationVisible] = useState(false);
  const [valuationStep, setValuationStep] = useState<1 | 2>(1);
  const [submitting, setSubmitting] = useState(false);
  const [valuationForm, setValuationForm] = useState(emptyValuationForm);
  const [sellImageUri, setSellImageUri] = useState(() =>
    resolveSellImage(content?.sellImage),
  );
  const carpetArea = Number(valuationForm.carpetArea || 0);
  const estimatedValue = useMemo(() => {
    const baseRate = estimateRate(valuationForm.propertyType, valuationForm.unitType);
    return carpetArea ? carpetArea * baseRate : 0;
  }, [carpetArea, valuationForm.propertyType, valuationForm.unitType]);
  const estimateLow = Math.round(estimatedValue * 0.94);
  const estimateHigh = Math.round(estimatedValue * 1.08);

  useEffect(() => {
    setSellImageUri(resolveSellImage(content?.sellImage));
  }, [content?.sellImage]);

  const openValuation = () => {
    setWhyVisible(false);
    setValuationStep(1);
    setValuationVisible(true);
  };

  const closeValuation = () => {
    setValuationVisible(false);
    setValuationStep(1);
  };

  const updateValuation = (key: keyof ValuationForm, value: string) => {
    setValuationForm(current => ({ ...current, [key]: value }));
  };

  const submitValuation = async () => {
    const missingRequired = [
      valuationForm.name,
      valuationForm.phone,
      valuationForm.email,
      valuationForm.propertyType,
      valuationForm.unitType,
      valuationForm.society,
      valuationForm.location,
      valuationForm.carpetArea,
    ].some(value => !value.trim());

    if (missingRequired) {
      Alert.alert('Required fields', 'Please fill all valuation fields.');
      return;
    }

    if (valuationForm.phone.replace(/\D/g, '').length < 10) {
      Alert.alert('Invalid phone', 'Please enter a valid 10 digit phone number.');
      return;
    }

    setSubmitting(true);
    try {
      await contactService.create({
        name: valuationForm.name.trim(),
        phone: valuationForm.phone.trim(),
        email: valuationForm.email.trim(),
        property_type: valuationForm.propertyType,
        budget: formatEstimate(estimatedValue),
        subject: 'Free Property Valuation Request',
        message: [
          'Free property valuation request',
          `Property Type: ${valuationForm.propertyType}`,
          `Unit Type: ${valuationForm.unitType}`,
          `Society: ${valuationForm.society}`,
          `Location: ${valuationForm.location}`,
          `Carpet Area: ${valuationForm.carpetArea} sqft`,
          `Estimated Range: ${formatEstimate(estimateLow)} - ${formatEstimate(estimateHigh)}`,
        ].join('\n'),
      });
      setValuationStep(2);
    } catch (error: any) {
      Alert.alert(
        'Could not save lead',
        error?.response?.data?.message || 'Please try again in a moment.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <LinearGradient colors={['#0b3856', '#0c3854']} className="py-16 px-6">
        <View className="mb-10">
          <Text className="text-white text-3xl font-black mb-4 leading-tight">
            {content?.sellTitle || 'Sell Your Resale Property Faster & Smarter in Pune'}
          </Text>
          <Text className="text-blue-100/80 mb-8 leading-6 font-medium">
            {content?.sellSubtitle || 'Get instant AI-based property valuation, connect with verified buyers, and close deals faster with ResaleExpert.'}
          </Text>

          <View className="gap-4">
            <TouchableOpacity
              className="bg-[#E6761D] py-4 rounded-2xl items-center shadow-xl shadow-orange-900"
              onPress={onPostProperty}
            >
              <Text className="text-white font-black uppercase tracking-widest text-sm">List My Property</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="border-2 border-white/30 py-4 rounded-2xl items-center"
              onPress={openValuation}
              activeOpacity={0.85}
            >
              <Text className="text-white font-black uppercase tracking-widest text-sm">Free Valuation</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="border-2 border-white/30 py-4 rounded-2xl items-center"
              onPress={() => setWhyVisible(true)}
              activeOpacity={0.85}
            >
              <Text className="text-white font-black uppercase tracking-widest text-sm">Why Sell With Us?</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="relative">
          <Image
            source={{ uri: sellImageUri }}
            className="w-full h-64 rounded-[40px] shadow-2xl"
            resizeMode="cover"
            onError={() => setSellImageUri(FALLBACK_SELL_IMAGE)}
          />
          <View className="absolute -bottom-6 left-4 bg-white px-6 py-4 rounded-[24px] shadow-2xl flex-row items-center gap-3 border border-gray-100">
            <View className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center">
              <IndianRupee size={24} color="#0b3856" />
            </View>
            <View>
              <Text className="text-gray-900 font-black text-base">{content?.soldValue || '₹500Cr+'}</Text>
              <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">{content?.soldLabel || 'Properties Sold'}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <Modal transparent visible={whyVisible} animationType="fade" onRequestClose={() => setWhyVisible(false)}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(15,27,40,0.65)',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 12,
          }}
        >
          <View
            style={{
              width: '100%',
              maxWidth: 560,
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: '#E4E7EB',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 16 },
              shadowOpacity: 0.18,
              shadowRadius: 60,
              elevation: 12,
            }}
          >
            <ModalHeader
              title="Why Sell with Resale Expert?"
              subtitle="Pune's leading resale property advisors"
              iconSize={17}
              onClose={() => setWhyVisible(false)}
            />
            <View
              style={{
                backgroundColor: '#FFF4EC',
                borderBottomWidth: 1,
                borderBottomColor: '#FFE0C8',
                paddingHorizontal: 20,
                paddingVertical: 16,
              }}
            >
              <Text style={{ color: '#111827', fontSize: 15, fontWeight: '800' }}>
                Sell Faster. Sell Smarter.
              </Text>
              <Text style={{ color: '#6B7280', fontSize: 13, lineHeight: 19, marginTop: 5 }}>
                We combine data-driven pricing, verified demand, and full support to maximize your resale value.
              </Text>
            </View>
            <View style={{ paddingHorizontal: 20, paddingVertical: 16, gap: 8 }}>
              {WHY_POINTS.map(point => (
                <View
                  key={point.title}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    gap: 12,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: point.muted ? '#D1D5DB' : '#E4E7EB',
                    backgroundColor: point.muted ? '#FAFAFA' : '#FFFFFF',
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                  }}
                >
                  <CircleCheck size={17} color="#E6761D" style={{ marginTop: 2 }} />
                  <Text style={{ flex: 1, color: '#1F2937', fontSize: 13, lineHeight: 19 }}>
                    <Text style={{ fontWeight: '800' }}>{point.title} </Text>
                    {point.text}
                  </Text>
                </View>
              ))}
            </View>
            <View
              style={{
                borderTopWidth: 1,
                borderTopColor: '#E4E7EB',
                backgroundColor: '#F8F9FA',
                paddingHorizontal: 20,
                paddingVertical: 12,
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              <TouchableOpacity
                onPress={openValuation}
                activeOpacity={0.85}
                style={{ backgroundColor: '#E6761D', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 9 }}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '700' }}>Get Free Valuation</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setWhyVisible(false)}
                activeOpacity={0.85}
                style={{
                  borderWidth: 1.5,
                  borderColor: '#E4E7EB',
                  borderRadius: 8,
                  paddingHorizontal: 16,
                  paddingVertical: 9,
                }}
              >
                <Text style={{ color: '#374151', fontSize: 13, fontWeight: '700' }}>Maybe Later</Text>
              </TouchableOpacity>
            </View>
            <Text style={{ color: '#9CA3AF', fontSize: 11, paddingHorizontal: 20, paddingBottom: 12 }}>
              *No spam. No hidden charges. Just expert guidance tailored to you.
            </Text>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={valuationVisible} animationType="fade" onRequestClose={closeValuation}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(15,27,40,0.65)',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 12,
          }}
        >
          <View
            style={{
              width: '100%',
              maxWidth: 820,
              maxHeight: '95%',
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: '#E4E7EB',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 16 },
              shadowOpacity: 0.18,
              shadowRadius: 60,
              elevation: 12,
            }}
          >
            <ModalHeader
              title="Free Instant Property Valuation"
              subtitle="AI-powered estimate in under 30 seconds"
              onClose={closeValuation}
            />
            <View
              style={{
                borderBottomWidth: 1,
                borderBottomColor: '#E4E7EB',
                backgroundColor: '#FFFFFF',
                paddingHorizontal: 20,
                paddingVertical: 10,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              {[
                { step: 1, label: 'Property Details' },
                { step: 2, label: 'Estimate' },
              ].map((item, idx) => {
                const active = valuationStep >= item.step;
                return (
                  <React.Fragment key={item.step}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <View
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: 13,
                          borderWidth: 2,
                          borderColor: active ? '#E6761D' : '#E4E7EB',
                          backgroundColor: active ? '#E6761D' : 'transparent',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Text style={{ color: active ? '#FFFFFF' : '#6B7280', fontSize: 11, fontWeight: '800' }}>
                          {item.step}
                        </Text>
                      </View>
                      <Text style={{ color: active ? '#1A1F2E' : '#6B7280', fontSize: 11, fontWeight: '700' }}>
                        {item.label}
                      </Text>
                    </View>
                    {idx === 0 && <View style={{ flex: 1, height: 1, backgroundColor: '#E4E7EB', marginHorizontal: 12 }} />}
                  </React.Fragment>
                );
              })}
            </View>

            {valuationStep === 1 ? (
              <ScrollView style={{ maxHeight: 430 }} contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 16 }}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                  <ValuationField
                    label="Full Name"
                    required
                    value={valuationForm.name}
                    onChangeText={value => updateValuation('name', value)}
                    placeholder="e.g. Kamlesh Shah"
                  />
                  <ValuationField
                    label="Phone"
                    required
                    value={valuationForm.phone}
                    onChangeText={value => updateValuation('phone', value.replace(/[^\d]/g, ''))}
                    placeholder="e.g. 98XXXXXXXX"
                    keyboardType="phone-pad"
                    maxLength={10}
                  />
                  <ValuationField
                    label="Email"
                    required
                    value={valuationForm.email}
                    onChangeText={value => updateValuation('email', value)}
                    placeholder="e.g. you@domain.com"
                    keyboardType="email-address"
                  />
                  <OptionGroup
                    label="Property Type"
                    value={valuationForm.propertyType}
                    options={PROPERTY_TYPES}
                    onSelect={value => updateValuation('propertyType', value)}
                  />
                  <OptionGroup
                    label="Unit Type"
                    value={valuationForm.unitType}
                    options={UNIT_TYPES}
                    onSelect={value => updateValuation('unitType', value)}
                  />
                  <ValuationField
                    label="Society"
                    required
                    value={valuationForm.society}
                    onChangeText={value => updateValuation('society', value)}
                    placeholder="e.g. Kumar Primavera"
                  />
                  <ValuationField
                    label="Location"
                    required
                    value={valuationForm.location}
                    onChangeText={value => updateValuation('location', value)}
                    placeholder="e.g. Viman Nagar, Pune"
                  />
                  <ValuationField
                    label="Carpet Area (sqft)"
                    required
                    value={valuationForm.carpetArea}
                    onChangeText={value => updateValuation('carpetArea', value.replace(/[^\d]/g, ''))}
                    placeholder="e.g. 925"
                    keyboardType="numeric"
                  />
                </View>
              </ScrollView>
            ) : (
              <View style={{ padding: 20 }}>
                <View
                  style={{
                    backgroundColor: '#FFF4EC',
                    borderWidth: 1,
                    borderColor: '#FFE0C8',
                    borderRadius: 14,
                    padding: 16,
                  }}
                >
                  <Text style={{ color: '#6B7280', fontSize: 11, fontWeight: '800', textTransform: 'uppercase' }}>
                    Estimated resale range
                  </Text>
                  <Text style={{ color: '#111827', fontSize: 28, fontWeight: '900', marginTop: 8 }}>
                    {formatEstimate(estimateLow)} - {formatEstimate(estimateHigh)}
                  </Text>
                  <Text style={{ color: '#6B7280', fontSize: 13, lineHeight: 19, marginTop: 8 }}>
                    Based on {valuationForm.carpetArea} sqft carpet area, {valuationForm.unitType}, {valuationForm.location}. Your request is saved in Admin Leads.
                  </Text>
                </View>
                <View style={{ marginTop: 14, gap: 8 }}>
                  {[
                    `Society: ${valuationForm.society}`,
                    `Property Type: ${valuationForm.propertyType}`,
                    `AI rate used: approx ${formatEstimate(estimateRate(valuationForm.propertyType, valuationForm.unitType))}/sqft`,
                  ].map(item => (
                    <View key={item} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <CircleCheck size={15} color="#E6761D" />
                      <Text style={{ color: '#374151', fontSize: 13, fontWeight: '600' }}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <View
              style={{
                borderTopWidth: 1,
                borderTopColor: '#E4E7EB',
                backgroundColor: '#F8F9FA',
                paddingHorizontal: 20,
                paddingVertical: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 8,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#16A34A' }} />
                <Text style={{ color: '#9CA3AF', fontSize: 11 }}>AI-powered</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  onPress={closeValuation}
                  activeOpacity={0.85}
                  style={{
                    borderWidth: 1,
                    borderColor: '#E4E7EB',
                    borderRadius: 8,
                    paddingHorizontal: 16,
                    paddingVertical: 9,
                  }}
                >
                  <Text style={{ color: '#1A1F2E', fontSize: 12, fontWeight: '700' }}>
                    {valuationStep === 1 ? 'Cancel' : 'Close'}
                  </Text>
                </TouchableOpacity>
                {valuationStep === 1 ? (
                  <TouchableOpacity
                    onPress={submitValuation}
                    disabled={submitting}
                    activeOpacity={0.85}
                    style={{
                      backgroundColor: '#E6761D',
                      borderRadius: 8,
                      paddingHorizontal: 16,
                      paddingVertical: 9,
                      minWidth: 104,
                      alignItems: 'center',
                    }}
                  >
                    {submitting ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700' }}>Continue →</Text>
                    )}
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={() => {
                      setValuationVisible(false);
                      onPostProperty?.();
                    }}
                    activeOpacity={0.85}
                    style={{
                      backgroundColor: '#E6761D',
                      borderRadius: 8,
                      paddingHorizontal: 16,
                      paddingVertical: 9,
                    }}
                  >
                    <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700' }}>List Property</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default SellSection;
