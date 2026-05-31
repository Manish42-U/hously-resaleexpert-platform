import React, { useRef, useState } from 'react';
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
  Scale,
  Calendar,
  SquarePen,
  FileText,
  AlertCircle,
  UserCheck,
  ShieldCheck,
  HelpCircle,
  Copyright,
  Gavel,
  CheckCircle2,
} from 'lucide-react-native';
import Footer from '../components/RealEstate/Footer';

const sections = [
  { id: 'agreement', title: '1. Agreement to Terms', icon: FileText },
  { id: 'eligibility', title: '2. Eligibility', icon: UserCheck },
  { id: 'services', title: '3. Our Services', icon: Gavel },
  { id: 'conduct', title: '4. User Conduct', icon: AlertCircle },
  { id: 'ip', title: '5. Intellectual Property', icon: Copyright },
  { id: 'liability', title: '6. Liability', icon: ShieldCheck },
  { id: 'governing', title: '7. Governing Law', icon: Scale },
  { id: 'contact', title: '8. Contact Us', icon: HelpCircle },
];

const sectionContent: Record<string, any[]> = {
  agreement: [
    'By accessing or using the Resale Expert platform, you agree to be bound by these Terms and Conditions. These terms constitute a legally binding agreement between you and Hously Finntech Realty.',
    'We reserve the right to modify these terms at any time. Your continued use of the platform after changes are posted constitutes your acceptance of the new terms.',
  ],
  eligibility: [
    'You must be at least 18 years of age to use our services.',
    'By using the platform, you represent and warrant that you have the right, authority, and capacity to enter into this agreement.',
  ],
  services: [
    'Resale Expert provides a platform for:',
    { type: 'list', items: ['Listing and searching for resale properties', 'Connecting buyers and sellers directly', 'Financial assistance and loan consulting', 'Property documentation and legal verification'] },
  ],
  conduct: [
    'Users agree not to:',
    { type: 'list', items: ['Post false or misleading property information', 'Engage in fraudulent activities', 'Violate any local or national laws', 'Interfere with the platform\'s security'] },
  ],
  ip: [
    'All content on this platform, including logos, text, and graphics, is the property of Hously Finntech Realty and protected by copyright laws.',
    'Users may not copy, modify, or distribute any content without our prior written consent.',
  ],
  liability: [
    'Resale Expert is a platform connecting users. We are not responsible for any disputes between buyers and sellers.',
    'We do not guarantee the accuracy of property listings or the conduct of users.',
  ],
  governing: [
    'These terms are governed by and construed in accordance with the laws of India.',
    'Any disputes shall be subject to the exclusive jurisdiction of the courts in Pune, Maharashtra.',
  ],
  contact: [
    'For any legal inquiries or concerns regarding these terms, please contact our legal team:',
    { type: 'list', items: ['Email: legal@resaleexpert.in', 'Address: Rahatani, Pune'] },
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
            <CheckCircle2 size={14} color="#E67E22" style={{ marginTop: 2 }} />
            <Text style={{ fontSize: 12, color: '#5A7184', flex: 1 }}>{listItem}</Text>
          </View>
        ))}
      </View>
    );
  }
  return null;
};

const TermsAndConditionsScreen = ({ 
  onBack,
  onTabChange 
}: { 
  onBack?: () => void;
  onTabChange?: (tab: string) => void;
}) => {
  const [activeSection, setActiveSection] = useState('agreement');
  const [containerOffset, setContainerOffset] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const sectionOffsets = useRef<Record<string, number>>({});

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const offset = sectionOffsets.current[id];
    if (offset !== undefined && scrollRef.current) {
      // Offset = section's Y inside container + container's Y in ScrollView - adjustment for sticky header
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
              <Scale size={22} color="#E67E22" />
            </View>
            <Text style={{ fontSize: 24, fontWeight: '800', color: 'white' }}>Terms & Conditions</Text>
          </View>
          
          <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 13, marginBottom: 12 }}>
            Rules and Guidelines for using Resale Expert platform
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
                borderWidth: 1.2, 
                borderColor: '#FED7AA', 
                overflow: 'hidden',
                shadowColor: '#0F172A',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.06,
                shadowRadius: 10,
                elevation: 2,
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
                  borderBottomColor: '#FED7AA' 
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
          <View
            style={{
              backgroundColor: 'white',
              borderRadius: 12,
              borderWidth: 1.2,
              borderColor: '#FED7AA',
              padding: 16,
              shadowColor: '#0F172A',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.06,
              shadowRadius: 10,
              elevation: 2,
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#0F2B3D', marginBottom: 4 }}>Questions?</Text>
            <Text style={{ fontSize: 11, color: '#5A7184', marginBottom: 12 }}>If you have any questions about these Terms, please contact us.</Text>
            <TouchableOpacity 
              onPress={() => Linking.openURL('mailto:support@resaleexpert.in')}
              style={{ backgroundColor: '#E67E22', paddingVertical: 10, borderRadius: 8, alignItems: 'center' }}
            >
              <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>Contact Legal Team</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Footer onTabChange={onTabChange} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default TermsAndConditionsScreen;
