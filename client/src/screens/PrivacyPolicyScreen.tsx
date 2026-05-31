import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Shield,
  Calendar,
  SquarePen,
  Info,
  Globe,
  Building,
  Database,
  Eye,
  Share2,
  Cookie,
  Lock,
  Clock,
  Users,
  Trash2,
  ExternalLink,
  Scale,
  Mail,
  CircleCheckBig,
  CircleAlert,
  Link,
  Baby,
} from 'lucide-react-native';
import Footer from '../components/RealEstate/Footer';

const sections = [
  { id: 'intro', title: '1. Introduction', icon: Info },
  { id: 'scope', title: '2. Scope and Applicability', icon: Globe },
  { id: 'nature', title: '3. Nature of Our Services', icon: Building },
  { id: 'collect', title: '4. Information We Collect', icon: Database },
  { id: 'why', title: '5. Why We Collect', icon: CircleAlert },
  { id: 'use', title: '6. How We Use', icon: Eye },
  { id: 'sharing', title: '7. Information Sharing', icon: Share2 },
  { id: 'thirdparty', title: '8. Third-Party Platforms', icon: Link },
  { id: 'cookies', title: '9. Cookies & Tracking', icon: Cookie },
  { id: 'security', title: '10. Data Security', icon: Lock },
  { id: 'retention', title: '11. Data Retention', icon: Clock },
  { id: 'rights', title: '12. Your Rights', icon: Users },
  { id: 'deletion', title: '13. Data Deletion', icon: Trash2 },
  { id: 'thirdpartylinks', title: '14. Third-Party Links', icon: ExternalLink },
  { id: 'children', title: '15. Children’s Privacy', icon: Baby },
  { id: 'legal', title: '16. Legal Compliance', icon: Scale },
  { id: 'changes', title: '17. Changes to Policy', icon: SquarePen },
  { id: 'contact', title: '18. Contact & Grievance', icon: Mail },
  { id: 'consent', title: '19. Consent', icon: CircleCheckBig },
];

const sectionContent: Record<string, any[]> = {
  intro: [
    'Welcome to Resale Expert (https://resaleexpert.in), a real estate services platform owned and operated by Hously Finntech Realty, a company engaged in providing real estate consultancy, resale property solutions, financial assistance, and related services.',
    'At Hously Finntech Realty, we understand that your privacy is important. This Privacy Policy is designed to provide complete transparency regarding how we collect, use, store, process, and share your information when you interact with our platform, services, and communication channels.',
    'By accessing or using Resale Expert, you agree to the terms of this Privacy Policy. If you do not agree, you are advised not to use our services.',
  ],
  scope: [
    'This Privacy Policy applies to all users who access or use:',
    { type: 'list', items: ['Our website (resaleexpert.in)', 'CRM systems and internal platforms', 'Lead generation systems', 'WhatsApp, Facebook, Instagram communication', 'Digital marketing campaigns and landing pages'] },
    'This policy applies regardless of how you access our services (mobile, desktop, or third-party platforms).',
  ],
  nature: [
    'Resale Expert is a real estate service platform that connects:',
    { type: 'list', items: ['Property buyers', 'Property sellers', 'Tenants and landlords', 'Financial institutions (for loans)', 'Legal and documentation service providers'] },
    'To provide these services effectively, we collect and process certain user information, which is explained in this policy.',
  ],
  collect: [
    { type: 'subheading', text: '4.1 Information You Provide Voluntarily' },
    'When you fill forms, register, or interact with us, we may collect:',
    { type: 'list', items: ['Your name', 'Phone number', 'Email address', 'Property preferences (buy/sell/rent)', 'Budget, location, property type', 'Any additional details you choose to provide'] },
    { type: 'subheading', text: '4.2 Information Collected Automatically' },
    'When you visit our website or interact with our platform, we may automatically collect:',
    { type: 'list', items: ['IP address', 'Browser type and device information', 'Pages visited and time spent', 'Search behavior and preferences', 'Location data (if enabled)'] },
    { type: 'subheading', text: '4.3 Communication Data' },
    'When you communicate with us, we may record:',
    { type: 'list', items: ['Phone call interactions', 'WhatsApp messages', 'Emails and SMS', 'CRM remarks and follow-up notes'] },
    { type: 'subheading', text: '4.4 Information from Third Parties' },
    'We may receive your data from:',
    { type: 'list', items: ['Advertising platforms (Facebook Ads, Google Ads)', 'Referral partners', 'Lead generation campaigns'] },
  ],
  why: [
    'We collect your information to provide a seamless and efficient real estate experience. This includes:',
    { type: 'list', items: ['Understanding your property requirements', 'Connecting you with relevant buyers/sellers', 'Providing loan and financial assistance', 'Coordinating legal and documentation support', 'Sending property recommendations and updates', 'Improving our services and platform'] },
  ],
  use: [
    'Your information is used for:',
    { type: 'list', items: ['Service delivery and consultation', 'Lead matching and sharing', 'Customer support and communication', 'Marketing and promotional campaigns (with consent)', 'Internal analytics and performance tracking', 'CRM management and follow-up tracking'] },
  ],
  sharing: [
    'We value your trust and do not sell your personal data.',
    'However, to provide our services, we may share your information with:',
    { type: 'list', items: ['Property owners or buyers', 'Banking and financial institutions', 'Legal and documentation partners', 'Internal teams and service providers'] },
  ],
  thirdparty: [
    'We use third-party platforms such as:',
    { type: 'list', items: ['WhatsApp Business API', 'Facebook and Instagram', 'Google services'] },
  ],
  cookies: [
    'We use cookies and similar technologies to:',
    { type: 'list', items: ['Enhance user experience', 'Track website performance', 'Understand user behavior', 'Deliver relevant advertisements'] },
  ],
  security: [
    'We implement appropriate security measures including:',
    { type: 'list', items: ['Secure servers', 'Access control systems', 'Data encryption (where applicable)'] },
  ],
  retention: [
    'We retain your data only for as long as necessary to:',
    { type: 'list', items: ['Provide services', 'Meet legal obligations', 'Resolve disputes'] },
  ],
  rights: [
    'You have the right to:',
    { type: 'list', items: ['Access your data', 'Correct your data', 'Request deletion', 'Withdraw consent'] },
  ],
  deletion: [
    'You may request deletion by emailing: support@resaleexpert.in',
    'We process such requests within 7 working days, subject to legal requirements.',
  ],
  thirdpartylinks: [
    'Our website may contain links to external websites. We are not responsible for their privacy practices.',
  ],
  children: [
    'Our services are not intended for individuals under 18 years of age.',
  ],
  legal: [
    'We comply with applicable Indian laws including:',
    { type: 'list', items: ['Information Technology Act, 2000', 'Digital Personal Data Protection Act, 2023'] },
  ],
  changes: [
    'We may update this Privacy Policy periodically. Users are encouraged to review this page regularly.',
  ],
  contact: [
    'For any concerns, contact us at:',
    { type: 'list', items: ['Email: support@resaleexpert.in', 'Phone: +91 9637009639', 'Company: Hously Finntech Realty'] },
  ],
  consent: [
    'By using our platform, you confirm that you have read, understood, and agreed to this Privacy Policy.',
  ],
};

const renderContentItem = (item: any, idx: number) => {
  if (typeof item === 'string') {
    return <Text key={idx} style={{ fontSize: 13, color: '#5A7184', lineHeight: 20, marginBottom: 12 }}>{item}</Text>;
  }
  if (item.type === 'list') {
    return (
      <View key={idx} style={{ marginBottom: 16, gap: 8 }}>
        {item.items.map((listItem: string, i: number) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
            <CircleCheckBig size={14} color="#E67E22" style={{ marginTop: 2 }} />
            <Text style={{ fontSize: 12, color: '#5A7184', flex: 1 }}>{listItem}</Text>
          </View>
        ))}
      </View>
    );
  }
  if (item.type === 'subheading') {
    return <Text key={idx} style={{ fontSize: 13, fontWeight: '700', color: '#0F2B3D', marginTop: 8, marginBottom: 8 }}>{item.text}</Text>;
  }
  return null;
};

const PrivacyPolicyScreen = ({ 
  onBack,
  onTabChange 
}: { 
  onBack?: () => void;
  onTabChange?: (tab: string) => void;
}) => {
  const [activeSection, setActiveSection] = useState('intro');
  const [containerOffset, setContainerOffset] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const sectionOffsets = useRef<Record<string, number>>({});

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const offset = sectionOffsets.current[id];
    if (offset !== undefined && scrollRef.current) {
      scrollRef.current.scrollTo({ y: offset + containerOffset - 10, animated: true });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0F2B3D' }}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <ScrollView 
        ref={scrollRef}
        stickyHeaderIndices={[1]} 
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: '#F8FAFC' }}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {/* HERO SECTION */}
        <View style={{ backgroundColor: '#0F2B3D', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 36 }}>
          <TouchableOpacity 
            onPress={onBack}
            style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              gap: 6, 
              backgroundColor: 'rgba(230, 126, 34, 0.125)', 
              paddingHorizontal: 12, 
              paddingVertical: 6, 
              borderRadius: 8,
              alignSelf: 'flex-start',
              marginBottom: 16
            }}
          >
            <ArrowLeft size={14} color="white" />
            <Text style={{ color: 'white', fontSize: 13, fontWeight: '500' }}>Back to Website</Text>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <View style={{ backgroundColor: 'rgba(230, 126, 34, 0.125)', padding: 8, borderRadius: 12 }}>
              <Shield size={22} color="#E67E22" />
            </View>
            <Text style={{ fontSize: 24, fontWeight: '800', color: 'white' }}>Privacy Policy</Text>
          </View>
          
          <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 13, marginBottom: 12 }}>
            Resale Expert (A Platform by Hously Finntech Realty)
          </Text>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Calendar size={12} color="rgba(255, 255, 255, 0.5)" />
              <Text style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 11 }}>Effective Date: 24 June 2023</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <SquarePen size={12} color="rgba(255, 255, 255, 0.5)" />
              <Text style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 11 }}>Last Updated: 2026</Text>
            </View>
          </View>
        </View>

        {/* STICKY NAV BAR */}
        <View style={{ backgroundColor: '#F8FAFC', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}>
            {sections.map((section) => (
              <TouchableOpacity 
                key={section.id}
                onPress={() => scrollToSection(section.id)}
                style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  gap: 6, 
                  backgroundColor: activeSection === section.id ? 'rgba(230, 126, 34, 0.1)' : 'white', 
                  borderWidth: 1, 
                  borderColor: activeSection === section.id ? '#E67E22' : '#E2E8F0', 
                  paddingHorizontal: 12, 
                  paddingVertical: 8, 
                  borderRadius: 10 
                }}
              >
                <section.icon size={12} color={activeSection === section.id ? '#E67E22' : '#5A7184'} />
                <Text style={{ color: activeSection === section.id ? '#E67E22' : '#5A7184', fontSize: 11, fontWeight: '500' }}>
                  {section.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* CONTENT SECTIONS */}
        <View 
          onLayout={(e) => setContainerOffset(e.nativeEvent.layout.y)}
          style={{ padding: 20, gap: 20 }}
        >
          {sections.map((section) => (
            <View 
              key={section.id} 
              onLayout={(event) => {
                sectionOffsets.current[section.id] = event.nativeEvent.layout.y;
              }}
              style={{ 
                backgroundColor: 'white', 
                borderRadius: 12, 
                borderWidth: 1, 
                borderColor: '#E2E8F0', 
                overflow: 'hidden' 
              }}
            >
              <View 
                style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  gap: 8, 
                  paddingHorizontal: 16, 
                  paddingVertical: 12, 
                  backgroundColor: 'rgba(15, 43, 61, 0.02)', 
                  borderBottomWidth: 1, 
                  borderBottomColor: '#E2E8F0' 
                }}
              >
                <section.icon size={16} color="#E67E22" />
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#0F2B3D' }}>{section.title}</Text>
              </View>
              <View style={{ padding: 16 }}>
                {sectionContent[section.id].map((item, idx) => renderContentItem(item, idx))}
              </View>
            </View>
          ))}

          {/* HELP CARD */}
          <View style={{ backgroundColor: 'white', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', padding: 16 }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#0F2B3D', marginBottom: 4 }}>Need Help?</Text>
            <Text style={{ fontSize: 11, color: '#5A7184', marginBottom: 12 }}>Have questions about our privacy practices?</Text>
            <TouchableOpacity 
              onPress={() => Linking.openURL('mailto:support@resaleexpert.in')}
              style={{ backgroundColor: '#E67E22', paddingVertical: 10, borderRadius: 8, alignItems: 'center' }}
            >
              <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>Contact Support</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Footer onTabChange={onTabChange} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default PrivacyPolicyScreen;
