import React, { useEffect, useState } from 'react';
import { Image, Linking, Text, TouchableOpacity, View } from 'react-native';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Shield,
  Award,
  CircleCheckBig,
} from 'lucide-react-native';
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from './BrandIcons';
import { useCmsContent } from '../../hooks/useCmsContent';

const footerFallback = {
  logoUrl:
    'https://resaleexpert.in/uploads/system/footer_logo-1759471021661-685054072-Resale_Expert_White.png',
  trustBadges: [
    '100% Verified Properties',
    'Award Winning Service',
    '10,000+ Happy Customers',
  ],
  quickLinks: [
    'Home',
    'Properties',
    'About Us',
    'Contact Us',
    'Privacy Policy',
    'Terms & Conditions',
  ],
  services: [
    'Property Selling',
    'Property Buying',
    'Property Rental',
    'Legal Services',
    'Loan Assistance',
    'Property Management',
  ],
  contact: {
    address:
      'Shubhchandra, Nakhate Chowk, Rahatani, Pimpri-Chinchwad, Pune, Maharashtra 411017, India',
    phones: ['+91 9637 00 9639'],
    email: 'info@resaleexpert.in',
    hours: ['Mon - Fri: 9:00 AM - 8:00 PM', 'Sat - Sun: 9:00 AM - 9:00 PM'],
  },
  popularLocations: [
    'Hinjewadi',
    'Kalewadi',
    'Kiwale',
    'Mamurdi',
    'Moshi',
    'Pimple Gurav',
    'Pimple Nilakh',
    'Pimple Saudagar',
    'Pimpri',
    'Punawale',
    'Rahatani',
    'Ravet',
    'Tathawade',
    'Wakad',
  ],
  social: {},
  copyright:
    '© 2026 ResaleExpert. All rights reserved. | Developed by Hously Finntech Realty | Real Estate Experience.',
};

const RESALE_EXPERT_FOOTER_LOGO =
  'https://resaleexpert.in/uploads/system/footer_logo-1759471021661-685054072-Resale_Expert_White.png';

const resolveFooterLogo = (logoUrl?: string) => {
  const logo = logoUrl?.trim();
  if (!logo || logo.includes('/hously/brand/footer-logo.png')) {
    return RESALE_EXPERT_FOOTER_LOGO;
  }
  return logo;
};

const formatService = (service: string) => {
  const lower = service.toLowerCase();
  if (lower.startsWith('property ')) return service;
  if (lower.includes('legal')) return 'Legal Services';
  if (lower.includes('loan')) return 'Loan Assistance';
  if (lower.includes('management')) return 'Property Management';
  return `Property ${service}`;
};

const Footer = ({ onTabChange }: { onTabChange?: (tab: string) => void }) => {
  const cms = useCmsContent('footer', footerFallback);
  const [logoUri, setLogoUri] = useState(() =>
    resolveFooterLogo(footerFallback.logoUrl),
  );
  const handlePress = (label: string) => {
    if (!onTabChange) return;

    const mapping: { [key: string]: string } = {
      Home: 'Home',
      Properties: 'Properties',
      'About Us': 'About',
      'Contact Us': 'Contact',
      'Privacy Policy': 'PrivacyPolicy',
      'Terms & Conditions': 'Terms',
      Selling: 'Services',
      Buying: 'Services',
      Rental: 'Services',
      Legal: 'Services',
      'Legal Services': 'Services',
      'Loan Assistance': 'Services',
      Management: 'Services',
      'Property Selling': 'Services',
      'Property Buying': 'Services',
      'Property Rental': 'Services',
      'Property Management': 'Services',
      'Our Services': 'Services',
    };

    const tab = mapping[label] || mapping[formatService(label)] || label;
    onTabChange(tab);
  };

  const phones = cms.contact?.phones?.length
    ? cms.contact.phones
    : footerFallback.contact.phones;
  const hours = cms.contact?.hours?.length
    ? cms.contact.hours
    : footerFallback.contact.hours;

  useEffect(() => {
    setLogoUri(resolveFooterLogo(cms.logoUrl || footerFallback.logoUrl));
  }, [cms.logoUrl]);

  return (
    <View className="bg-gray-900 pt-8 pb-6 px-4">
      <View className="flex-row flex-wrap">
        <View className="w-1/2 mb-6 pr-3">
          <View style={{ minHeight: 68, marginBottom: 16, justifyContent: 'center' }}>
            <Image
              source={{ uri: logoUri }}
              style={{ width: 188, height: 58, maxWidth: '100%' }}
              resizeMode="contain"
              onError={() => setLogoUri(RESALE_EXPERT_FOOTER_LOGO)}
            />
            {!logoUri && (
              <Text className="text-white text-lg font-black">ResaleExpert</Text>
            )}
          </View>
          <View className="gap-3">
            {(cms.trustBadges || []).map((badge: string, index: number) => {
              const icons = [Shield, Award, CircleCheckBig];
              const colors = ['#4ade80', '#fbbf24', '#60a5fa'];
              const Icon = icons[index] || CircleCheckBig;
              return (
                <View key={badge} className="flex-row items-start gap-2">
                  <Icon
                    size={15}
                    color={colors[index] || '#60a5fa'}
                    style={{ marginTop: 2 }}
                  />
                  <Text className="flex-1 text-gray-300 text-xs leading-5">
                    {badge}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        <View className="w-1/2 mb-6 pl-3">
          <Text className="text-white text-base font-bold mb-4">
            Quick Links
          </Text>
          {(cms.quickLinks || []).map((link: string) => (
            <TouchableOpacity
              key={link}
              onPress={() => handlePress(link)}
              className="py-1.5 flex-row items-start gap-2"
            >
              <View className="w-1 h-1 bg-blue-500 rounded-full mt-2" />
              <Text className="flex-1 text-gray-300 text-xs leading-5">
                {link}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="w-1/2 mb-6 pr-3">
          <Text className="text-white text-base font-bold mb-4">
            Our Services
          </Text>
          {(cms.services || []).map((service: string) => (
            <TouchableOpacity
              key={service}
              onPress={() => handlePress(service)}
              className="py-1.5 flex-row items-start gap-2"
            >
              <View className="w-1 h-1 bg-orange-500 rounded-full mt-2" />
              <Text className="flex-1 text-gray-300 text-xs leading-5">
                {formatService(service)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="w-1/2 mb-6 pl-3">
          <Text className="text-white text-base font-bold mb-4">
            Contact Info
          </Text>
          <View className="gap-4">
            <View className="flex-row items-start gap-2">
              <MapPin size={16} color="#60a5fa" style={{ marginTop: 2 }} />
              <Text className="flex-1 text-gray-300 text-xs leading-5">
                {cms.contact?.address || footerFallback.contact.address}
              </Text>
            </View>
            <View className="flex-row items-start gap-2">
              <Phone size={16} color="#4ade80" style={{ marginTop: 1 }} />
              <View className="flex-1">
                {phones.map((phone: string) => (
                  <Text key={phone} className="text-gray-300 text-xs leading-5">
                    {phone}
                  </Text>
                ))}
                <Text className="text-gray-400 text-[11px] leading-4">
                  24/7 Support Available
                </Text>
              </View>
            </View>
            <View className="flex-row items-start gap-2">
              <Mail size={16} color="#c084fc" style={{ marginTop: 1 }} />
              <View className="flex-1">
                <Text className="text-gray-300 text-xs leading-5">
                  {cms.contact?.email || footerFallback.contact.email}
                </Text>
                <Text className="text-gray-400 text-[11px] leading-4">
                  Quick Response Guaranteed
                </Text>
              </View>
            </View>
            <View className="flex-row items-start gap-2">
              <Clock size={16} color="#f97316" style={{ marginTop: 1 }} />
              <View className="flex-1">
                {hours.map((line: string, index: number) => (
                  <Text
                    key={line}
                    className={
                      index === 0
                        ? 'text-gray-300 text-xs leading-5'
                        : 'text-gray-400 text-[11px] leading-4'
                    }
                  >
                    {line}
                  </Text>
                ))}
              </View>
            </View>
          </View>
        </View>
      </View>

      <View className="mt-2 pt-6 border-t border-gray-800">
        <Text className="text-white text-base font-bold mb-4">
          Popular Locations
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {(cms.popularLocations || []).map((loc: string) => (
            <TouchableOpacity
              key={loc}
              onPress={() => handlePress('Properties')}
              className="bg-gray-800 px-3 py-1.5 rounded-lg"
            >
              <Text className="text-gray-300 text-xs leading-4">{loc}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View className="mt-8 flex-row items-center flex-wrap gap-3">
        <Text className="text-gray-400 text-xs mr-1">Follow us:</Text>
        <TouchableOpacity className="bg-gray-800 p-2 rounded-lg">
          <Facebook size={15} color="#3b82f6" />
        </TouchableOpacity>
        <TouchableOpacity className="bg-gray-800 p-2 rounded-lg">
          <Twitter size={15} color="#60a5fa" />
        </TouchableOpacity>
        <TouchableOpacity className="bg-gray-800 p-2 rounded-lg">
          <Instagram size={15} color="#ec4899" />
        </TouchableOpacity>
        <TouchableOpacity className="bg-gray-800 p-2 rounded-lg">
          <Linkedin size={15} color="#3b82f6" />
        </TouchableOpacity>
        <TouchableOpacity className="bg-gray-800 p-2 rounded-lg">
          <Youtube size={15} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <View className="mt-6 pt-6 border-t border-gray-800">
        <Text className="text-gray-400 text-xs text-center leading-5">
          © 2026 ResaleExpert. All rights reserved.
          <Text className="text-gray-500"> | </Text>
          <Text className="text-gray-400">Developed by </Text>
          <Text
            className="text-white font-bold underline"
            onPress={() => Linking.openURL('https://hously.in')}
          >
            Hously Finntech Realty
          </Text>
          <Text className="text-gray-500"> | </Text>
          <Text className="text-gray-400">Real Estate Experience.</Text>
        </Text>
      </View>
    </View>
  );
};

export default Footer;
