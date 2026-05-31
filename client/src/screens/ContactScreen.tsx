import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Linking,
  Alert,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  ChevronDown,
  Building,
  MessageCircle,
  Globe,
  X,
  Camera,
  Briefcase,
  Video,
} from 'lucide-react-native';
import { contactService } from '../services/api';
import Footer from '../components/RealEstate/Footer';
import { useCmsContent } from '../hooks/useCmsContent';

const contactFallback = {
  heroTitle: 'Get in Touch',
  heroSubtitle:
    'Ready to find your dream property or sell your current one? Our expert team is here to help.',
  stats: [
    { value: '2-4 Hours', label: 'Response Time' },
    { value: '24/7', label: 'Support Available' },
    { value: '98%', label: 'Satisfaction Rate' },
  ],
  formTitle: 'Send us a Message',
  formSubtitle: "Fill the form, we'll reply within 24h.",
  contactTitle: 'Contact Information',
  contactSubtitle: 'Multiple ways to reach us. Choose what works best.',
  phones: ['+91 9637 00 9639', '+91 9146 00 9176'],
  email: 'info@resaleexpert.in',
  urgentEmail: 'urgent@resaleexpert.in',
  whatsapp: '919146009176',
  addressLines: [
    'Shubhchandra, Nakhate Chowk',
    'Rahatani, Pimpri-Chinchwad',
    'Pune, Maharashtra 411017',
  ],
  mapQuery: 'Shubhchandra,Nakhate Chowk,Rahatani,Pune',
  hours: ['Mon - Fri: 10am - 8pm', 'Sat - Sun: 9am - 9pm'],
  officeLocations: [
    {
      city: 'Pune',
      address: 'Shubhchandra, Rahatani, Pune - 411017',
      phone: '+91 9637 00 9639',
      email: 'pune@resaleexpert.in',
    },
  ],
  faqs: [],
  socialTitle: 'Stay Connected',
  socialSubtitle:
    'Follow us on social media for the latest updates, property listings, and real estate tips',
};

const ContactScreen = ({
  onScroll,
  onTabChange,
}: {
  onScroll?: (event: any) => void;
  onTabChange?: (tab: string) => void;
}) => {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    propertyType: '',
    budget: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerType, setPickerType] = useState<'type' | 'budget'>('type');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const cms = useCmsContent('contact', contactFallback);

  const propertyTypes = [
    'Residential',
    'Commercial',
    'Industrial',
    'Agricultural',
    'Plot / Land',
  ];
  const budgetRanges = [
    'Below 25 Lacs',
    '25 Lacs - 50 Lacs',
    '50 Lacs - 75 Lacs',
    '75 Lacs - 1 Cr',
    '1 Cr - 1.5 Cr',
    '1.5 Cr - 2 Cr',
    'Above 2 Cr',
  ];

  const faqs = cms.faqs?.length ? cms.faqs : contactFallback.faqs;

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.email || !form.message) {
      Alert.alert(
        'Missing Info',
        'Please fill in all required fields marked with *',
      );
      return;
    }
    setLoading(true);
    try {
      await contactService.create({
        name: form.name,
        email: form.email,
        phone: form.phone,
        property_type: form.propertyType,
        budget: form.budget,
        subject: form.subject || 'New Contact Inquiry',
        message: form.message,
      });
      Alert.alert(
        'Message Sent',
        'Thank you! We will get back to you shortly.',
      );
      setForm({
        name: '',
        phone: '',
        email: '',
        propertyType: '',
        budget: '',
        subject: '',
        message: '',
      });
    } catch {
      Alert.alert(
        'Error',
        'Could not connect to the server. Please try again later.',
      );
    } finally {
      setLoading(false);
    }
  };

  const openMap = () => {
    Linking.openURL(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        cms.mapQuery || '',
      )}`,
    );
  };

  const makeCall = (number: string) => {
    Linking.openURL(`tel:${number.replace(/\s/g, '')}`);
  };

  const openWhatsApp = () => {
    Linking.openURL(`https://wa.me/${cms.whatsapp}`);
  };

  const openEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  const openSocial = (url: string) => {
    Linking.openURL(url);
  };

  const renderPickerModal = () => (
    <Modal visible={pickerVisible} transparent animationType="slide">
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white rounded-t-3xl p-6">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-bold text-gray-800">
              {pickerType === 'type'
                ? 'Select Property Type'
                : 'Select Budget Range'}
            </Text>
            <TouchableOpacity onPress={() => setPickerVisible(false)}>
              <Text className="text-[#E6761D] font-bold">Done</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={pickerType === 'type' ? propertyTypes : budgetRanges}
            keyExtractor={item => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="py-4 border-b border-orange-200"
                onPress={() => {
                  if (pickerType === 'type')
                    setForm({ ...form, propertyType: item });
                  else setForm({ ...form, budget: item });
                  setPickerVisible(false);
                }}
              >
                <Text className="text-gray-700 text-base">{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  const renderFaqItem = (item: { q: string; a: string }, index: number) => {
    const isOpen = activeFaq === index;
    return (
      <View
        key={index}
        className="bg-white rounded-xl border border-orange-200 mb-3"
      >
        <TouchableOpacity
          onPress={() => setActiveFaq(isOpen ? null : index)}
          className="flex-row justify-between items-center p-5"
        >
          <Text className="text-base font-semibold text-gray-900 flex-1">
            {item.q}
          </Text>
          <ChevronDown
            size={20}
            color="#6B7280"
            style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }}
          />
        </TouchableOpacity>
        {isOpen && (
          <View className="px-5 pb-5">
            <Text className="text-gray-600 leading-5">{item.a}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {/* ====== HERO SECTION – responsive ====== */}
        <LinearGradient
          colors={['#0B3856', '#0C3854']}
          className="py-12 pt-16 px-4 items-center"
        >
          <Text className="text-white text-2xl sm:text-3xl font-bold mb-2 text-center">
            {cms.heroTitle}
          </Text>
          <Text className="text-blue-100 text-sm sm:text-base text-center mb-5 max-w-md px-2">
            {cms.heroSubtitle}
          </Text>
          <View className="flex-row flex-wrap justify-center gap-6 sm:gap-8">
            {(cms.stats || []).map((stat: any) => (
              <View
                key={`${stat.value}-${stat.label}`}
                className="items-center min-w-[80px]"
              >
                <Text className="text-white text-lg sm:text-xl font-bold mb-1">
                  {stat.value}
                </Text>
                <Text className="text-blue-200 text-xs sm:text-sm">
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* ====== TWO-COLUMN LAYOUT ====== */}
        <View className="px-4 py-6 md:py-8">
          <View className="flex-col lg:flex-row gap-6 md:gap-8">
            {/* Left Column: Form (removed red error badge) */}
            <View className="bg-white rounded-2xl shadow-xl p-5 md:p-6 flex-1 border border-orange-300 transition-all hover:border-orange-500 hover:shadow-2xl">
              <View className="mb-4">
                <Text className="text-xl md:text-2xl font-bold text-gray-800">
                  {cms.formTitle}
                </Text>
                <Text className="text-gray-600 text-sm mt-1">
                  {cms.formSubtitle}
                </Text>
              </View>

              <View className="space-y-4">
                <View className="flex-col sm:flex-row gap-4">
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </Text>
                    <TextInput
                      className="border border-orange-300 rounded-xl px-4 py-3 bg-white transition-all hover:border-orange-500 hover:bg-orange-50/30"
                      placeholder="Enter your full name"
                      value={form.name}
                      onChangeText={val => setForm({ ...form, name: val })}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </Text>
                    <TextInput
                      className="border border-orange-300 rounded-xl px-4 py-3 bg-white transition-all hover:border-orange-500 hover:bg-orange-50/30"
                      placeholder="Enter your phone number"
                      keyboardType="phone-pad"
                      value={form.phone}
                      onChangeText={val => setForm({ ...form, phone: val })}
                    />
                  </View>
                </View>

                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </Text>
                  <TextInput
                    className="border border-orange-300 rounded-xl px-4 py-3 bg-white transition-all hover:border-orange-500 hover:bg-orange-50/30"
                    placeholder="Enter your email address"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={form.email}
                    onChangeText={val => setForm({ ...form, email: val })}
                  />
                </View>

                <View className="flex-col sm:flex-row gap-4">
                  <TouchableOpacity
                    className="flex-1"
                    onPress={() => {
                      setPickerType('type');
                      setPickerVisible(true);
                    }}
                  >
                    <Text className="text-sm font-medium text-gray-700 mb-2">
                      Property Type
                    </Text>
                    <View className="border border-orange-300 rounded-xl px-4 py-3 bg-white transition-all hover:border-orange-500 hover:bg-orange-50/30 flex-row justify-between items-center">
                      <Text
                        className={
                          form.propertyType ? 'text-gray-900' : 'text-gray-400'
                        }
                      >
                        {form.propertyType || 'Select property type'}
                      </Text>
                      <ChevronDown size={18} color="#64748B" />
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="flex-1"
                    onPress={() => {
                      setPickerType('budget');
                      setPickerVisible(true);
                    }}
                  >
                    <Text className="text-sm font-medium text-gray-700 mb-2">
                      Budget Range
                    </Text>
                    <View className="border border-orange-300 rounded-xl px-4 py-3 bg-white transition-all hover:border-orange-500 hover:bg-orange-50/30 flex-row justify-between items-center">
                      <Text
                        className={
                          form.budget ? 'text-gray-900' : 'text-gray-400'
                        }
                      >
                        {form.budget || 'Select budget range'}
                      </Text>
                      <ChevronDown size={18} color="#64748B" />
                    </View>
                  </TouchableOpacity>
                </View>

                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </Text>
                  <TextInput
                    className="border border-orange-300 rounded-xl px-4 py-3 bg-white transition-all hover:border-orange-500 hover:bg-orange-50/30"
                    placeholder="What can we help you with?"
                    value={form.subject}
                    onChangeText={val => setForm({ ...form, subject: val })}
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </Text>
                  <TextInput
                    className="border border-orange-300 rounded-xl px-4 py-3 bg-white transition-all hover:border-orange-500 hover:bg-orange-50/30 min-h-[100px] md:min-h-[120px]"
                    placeholder="Tell us more about your requirements..."
                    multiline
                    textAlignVertical="top"
                    value={form.message}
                    onChangeText={val => setForm({ ...form, message: val })}
                  />
                </View>

                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={loading}
                  className="bg-[#E6761D] py-3 md:py-4 rounded-lg items-center flex-row justify-center"
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <>
                      <Send size={18} color="white" />
                      <Text className="text-white font-semibold text-base md:text-lg ml-2">
                        Send Message
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Right Column: Contact Information */}
            <View className="flex-1 space-y-5 md:space-y-6">
              <View>
                <Text className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
                  {cms.contactTitle}
                </Text>
                <Text className="text-gray-600 text-sm">
                  {cms.contactSubtitle}
                </Text>
              </View>

              <View className="space-y-3 md:space-y-4">
                {/* Call Card */}
                <View className="bg-white rounded-xl p-4 md:p-5 shadow-sm border border-orange-300 transition-all hover:border-orange-500 hover:shadow-lg">
                  <View className="flex-row items-center space-x-3 md:space-x-4">
                    <View className="p-2 md:p-3 rounded-xl bg-[#E6761D]">
                      <Phone size={18} color="white" />
                    </View>
                    <View>
                      <Text className="text-lg md:text-xl font-bold text-gray-800">
                        Call Us
                      </Text>
                      {(cms.phones || []).map((phone: string) => (
                        <TouchableOpacity
                          key={phone}
                          onPress={() => makeCall(phone)}
                        >
                          <Text className="text-gray-700 text-sm md:text-base font-medium">
                            {phone}
                          </Text>
                        </TouchableOpacity>
                      ))}
                      <Text className="text-gray-500 text-xs md:text-sm mt-1">
                        24/7 Customer Support
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Email Card */}
                <View className="bg-white rounded-xl p-4 md:p-5 shadow-sm border border-orange-300 transition-all hover:border-orange-500 hover:shadow-lg">
                  <View className="flex-row items-center space-x-3 md:space-x-4">
                    <View className="p-2 md:p-3 rounded-xl bg-[#E6761D]">
                      <Mail size={18} color="white" />
                    </View>
                    <View>
                      <Text className="text-lg md:text-xl font-bold text-gray-800">
                        Email Us
                      </Text>
                      <TouchableOpacity onPress={() => openEmail(cms.email)}>
                        <Text className="text-gray-700 text-sm md:text-base font-medium">
                          {cms.email}
                        </Text>
                      </TouchableOpacity>
                      <Text className="text-gray-500 text-xs md:text-sm mt-1">
                        Quick Response Guaranteed
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Visit Card */}
                <View className="bg-white rounded-xl p-4 md:p-5 shadow-sm border border-orange-300 transition-all hover:border-orange-500 hover:shadow-lg">
                  <View className="flex-row items-start space-x-3 md:space-x-4">
                    <View className="p-2 md:p-3 rounded-xl bg-[#E6761D]">
                      <MapPin size={18} color="white" />
                    </View>
                    <View>
                      <Text className="text-lg md:text-xl font-bold text-gray-800">
                        Visit Us
                      </Text>
                      <TouchableOpacity onPress={openMap}>
                        <Text className="text-gray-700 text-sm md:text-base font-medium underline">
                          {cms.addressLines?.[0]}
                        </Text>
                      </TouchableOpacity>
                      {(cms.addressLines || [])
                        .slice(1, -1)
                        .map((line: string) => (
                          <TouchableOpacity key={line} onPress={openMap}>
                            <Text className="text-gray-700 text-sm md:text-base font-medium underline">
                              {line}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      <Text className="text-gray-500 text-xs md:text-sm mt-1">
                        {cms.addressLines?.[cms.addressLines.length - 1]}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Hours Card */}
                <View className="bg-white rounded-xl p-4 md:p-5 shadow-sm border border-orange-300 transition-all hover:border-orange-500 hover:shadow-lg">
                  <View className="flex-row items-center space-x-3 md:space-x-4">
                    <View className="p-2 md:p-3 rounded-xl bg-[#E6761D]">
                      <Clock size={18} color="white" />
                    </View>
                    <View>
                      <Text className="text-lg md:text-xl font-bold text-gray-800">
                        Office Hours
                      </Text>
                      {(cms.hours || []).map((line: string) => (
                        <Text
                          key={line}
                          className="text-gray-700 text-sm md:text-base font-medium"
                        >
                          {line}
                        </Text>
                      ))}
                      <Text className="text-gray-500 text-xs md:text-sm mt-1">
                        Extended Hours Available
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Immediate Assistance Box – buttons aligned neatly */}
              <LinearGradient
                colors={['#0B3856', '#0C3854']}
                className="rounded-xl p-4 md:p-5"
              >
                <Text className="text-white text-lg md:text-xl font-bold mb-3">
                  Need Immediate Assistance?
                </Text>
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={() =>
                      makeCall(cms.phones?.[1] || cms.phones?.[0] || '')
                    }
                    className="flex-1 bg-[#E6761D] py-2.5 md:py-3 rounded-lg flex-row items-center justify-center gap-2"
                  >
                    <Phone size={14} color="white" />
                    <Text className="text-white font-semibold text-sm md:text-base">
                      Call Now
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={openWhatsApp}
                    className="flex-1 bg-[#25D366] py-2.5 md:py-3 rounded-lg flex-row items-center justify-center gap-2"
                  >
                    <MessageCircle size={14} color="white" />
                    <Text className="text-white font-semibold text-sm md:text-base">
                      WhatsApp
                    </Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>
          </View>
        </View>

        {/* ====== OFFICE LOCATIONS SECTION ====== */}
        <View className="bg-white py-8 md:py-12 px-4">
          <Text className="text-xl md:text-2xl font-bold text-gray-800 text-center mb-2">
            Our Office Locations
          </Text>
          <Text className="text-gray-600 text-sm md:text-base text-center mb-6 md:mb-8">
            Visit us at our offices
          </Text>
          {(cms.officeLocations || []).map((office: any) => (
            <View
              key={office.city}
              className="bg-white rounded-2xl p-4 md:p-5 mb-4 border border-orange-300 shadow-sm transition-all hover:border-orange-500 hover:shadow-lg"
            >
              <View className="flex-row items-center mb-4">
                <View className="p-2 bg-blue-100 rounded-lg mr-3">
                  <Building size={18} color="#2563EB" />
                </View>
                <Text className="text-lg md:text-xl font-bold text-gray-800">
                  {office.city}
                </Text>
              </View>
              <View className="space-y-2 md:space-y-3">
                <View className="flex-row">
                  <MapPin size={14} color="#6B7280" style={{ marginTop: 2 }} />
                  <Text className="text-gray-700 text-xs md:text-sm ml-2 flex-1">
                    {office.address}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => makeCall(office.phone)}
                  className="flex-row items-center"
                >
                  <Phone size={14} color="#6B7280" />
                  <Text className="text-gray-700 text-xs md:text-sm ml-2">
                    {office.phone}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => openEmail(office.email)}
                  className="flex-row items-center"
                >
                  <Mail size={14} color="#6B7280" />
                  <Text className="text-gray-700 text-xs md:text-sm ml-2">
                    {office.email}
                  </Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={openMap}
                className="mt-4 md:mt-5 bg-[#E6761D] py-2.5 md:py-3 rounded-lg items-center"
              >
                <Text className="text-white font-semibold text-sm md:text-base">
                  Get Directions
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* ====== FAQ SECTION ====== */}
        <View className="bg-gray-50 py-8 md:py-12 px-4">
          <Text className="text-xl md:text-2xl font-bold text-gray-800 text-center mb-2">
            Frequently Asked Questions
          </Text>
          <Text className="text-gray-600 text-sm md:text-base text-center mb-6 md:mb-8">
            Quick answers to common questions
          </Text>
          {faqs.map((faq, idx) => renderFaqItem(faq, idx))}
        </View>

        {/* ====== SOCIAL & EMERGENCY SECTION ====== */}
        <LinearGradient
          colors={['#0B3856', '#0C3854']}
          className="py-8 md:py-12 px-4 items-center"
        >
          <Text className="text-white text-xl md:text-2xl font-bold mb-4 md:mb-6">
            {cms.socialTitle}
          </Text>
          <Text className="text-blue-100 text-sm md:text-base text-center mb-6 md:mb-8 max-w-md px-2">
            {cms.socialSubtitle}
          </Text>
          <View className="flex-row flex-wrap justify-center gap-4 md:gap-6 mb-6 md:mb-8">
            <TouchableOpacity
              onPress={() =>
                openSocial('https://www.facebook.com/resaleexpert.i')
              }
              className="p-2 md:p-3 bg-white/10 rounded-xl"
            >
              <Globe size={18} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => openSocial('https://twitter.com/resaleexpertin')}
              className="p-2 md:p-3 bg-white/10 rounded-xl"
            >
              <X size={18} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                openSocial('https://www.instagram.com/resaleexpert.in')
              }
              className="p-2 md:p-3 bg-white/10 rounded-xl"
            >
              <Camera size={18} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                openSocial('https://www.linkedin.com/company/resaleexpertin')
              }
              className="p-2 md:p-3 bg-white/10 rounded-xl"
            >
              <Briefcase size={18} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                openSocial(
                  'https://www.youtube.com/channel/UCYuJPmp-d7HIdfPgSejWzvg',
                )
              }
              className="p-2 md:p-3 bg-white/10 rounded-xl"
            >
              <Video size={18} color="white" />
            </TouchableOpacity>
          </View>
          <View className="bg-white/10 rounded-2xl p-5 md:p-6 w-full max-w-md backdrop-blur-sm">
            <Text className="text-white text-lg md:text-xl font-bold text-center mb-2">
              Emergency Contact
            </Text>
            <Text className="text-blue-100 text-xs md:text-sm text-center mb-4">
              Need urgent assistance outside business hours?
            </Text>
            <TouchableOpacity
              onPress={() => makeCall(cms.phones?.[1] || cms.phones?.[0] || '')}
              className="bg-[#E6761D] py-2.5 md:py-3 rounded-xl mb-3 items-center"
            >
              <Text className="text-white font-semibold text-sm md:text-base">
                Emergency: {cms.phones?.[1] || cms.phones?.[0]}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => openEmail(cms.urgentEmail)}
              className="border border-white/30 py-2.5 md:py-3 rounded-xl items-center"
            >
              <Text className="text-white text-sm md:text-base">
                {cms.urgentEmail}
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <Footer onTabChange={onTabChange} />
      </ScrollView>
      {renderPickerModal()}
    </View>
  );
};

export default ContactScreen;
