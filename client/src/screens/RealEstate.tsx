import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Components
import Header from '../components/RealEstate/Header';
import Hero from '../components/RealEstate/Hero';
import MarketIntelligence from '../components/RealEstate/MarketIntelligence';
import PropertyCard, {
  Property,
  PropertyFetchLoader,
} from '../components/RealEstate/PropertyCard';

// Core Components
import SellSection from '../components/RealEstate/SellSection';
import WhyChooseUs from '../components/RealEstate/WhyChooseUs';
import StatsSection from '../components/RealEstate/StatsSection';
import Testimonials from '../components/RealEstate/Testimonials';
import FinalCTA from '../components/RealEstate/FinalCTA';
import Footer from '../components/RealEstate/Footer';
import FloatingChat from '../components/RealEstate/FloatingChat';
import { propertyService } from '../services/api';
import { useCmsContent } from '../hooks/useCmsContent';

// Screens
import ServicesScreen from './ServicesScreen';
import PropertiesScreen from './PropertiesScreen';
import BlogsScreen from './BlogsScreen';
import AboutScreen from './AboutScreen';
import ContactScreen from './ContactScreen';
import PostPropertyScreen from './PostPropertyScreen';
import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';
import AdminDashboardScreen from './AdminDashboardScreen';
import PropertyDetailScreen from './PropertyDetailScreen';
import BlogDetailScreen from './BlogDetailScreen';
import PrivacyPolicyScreen from './PrivacyPolicyScreen';
import TermsAndConditionsScreen from './TermsAndConditionsScreen';

const formatPrice = (price?: number | string) => {
  const numericPrice = Number(price || 0);
  if (!numericPrice) return 'On Request';
  if (numericPrice >= 10000000)
    return `${(numericPrice / 10000000).toFixed(2).replace(/\.00$/, '')}Cr`;
  if (numericPrice >= 100000)
    return `${(numericPrice / 100000).toFixed(2).replace(/\.00$/, '')}L`;
  return numericPrice.toLocaleString('en-IN');
};

const normalizeProperty = (property: any): Property => {
  const area = Number(
    property.area || property.carpet_area || property.built_up_area || 0,
  );
  const price = Number(property.price || 0);
  const images = Array.isArray(property.images) ? property.images : [];
  const titleParts = [
    property.property_type,
    property.unit_type,
    property.subtype,
  ].filter(Boolean);
  const entityId = property.property_code || property.code || property.id;

  return {
    id: String(entityId),
    code:
      property.property_code ||
      property.code ||
      `REX${String(property.id).padStart(4, '0')}`,
    title: titleParts.length
      ? titleParts.join(' ')
      : property.title || 'Residential Property',
    price: formatPrice(property.price),
    rawPrice: price,
    config: property.unit_type || property.config || 'N/A',
    area,
    perSqFt: area && price ? Math.round(price / area) : 0,
    location: property.location || 'Location not added',
    rating: Number(property.rating || 4.6),
    views: Number(property.views || 0),
    image:
      property.image ||
      property.image_url ||
      images[0] ||
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
    featured: Boolean(property.featured),
    aiScore: Number(property.aiScore || property.ai_score || 90),
    amenities: Array.isArray(property.amenities) ? property.amenities : [],
    propertyType: property.property_type || 'Residential',
  };
};

const RealEstate = ({ route }: any) => {
  const homeContent = useCmsContent('home', {
    heroImage:
      'https://res.cloudinary.com/dblem9twa/image/upload/v1/hously/hero/main.jpg',
    heroTitle: 'Find Your Perfect Resale Property in Pune & PCMC',
    heroSubtitle:
      'Browse verified resale flats, apartments, and commercial properties. Trusted by homeowners and buyers for transparent, hassle-free transactions.',
    featuredTitle: 'Featured Properties',
    featuredSubtitle: 'Handpicked premium properties with AI recommendations',
    sellTitle: 'Sell Your Resale Property Faster & Smarter in Pune',
    sellSubtitle:
      'Get instant AI-based property valuation, connect with verified buyers, and close deals faster with ResaleExpert.',
    sellImage:
      'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=600',
    soldValue: '₹500Cr+',
    soldLabel: 'Properties Sold',
  });
  const insets = useSafeAreaInsets();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [propertyType, setPropertyType] = useState('Buy');
  const [category, setCategory] = useState('All');
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState(
    route?.params?.initialTab || 'Home',
  );
  const [adminUser, setAdminUser] = useState<any>(null);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [selectedBlog, setSelectedBlog] = useState<any>(null);
  const [recentBlogs, setRecentBlogs] = useState<any[]>([]);

  useEffect(() => {
    const loadProperties = async () => {
      setLoading(true);
      try {
        const response = await propertyService.getAll();
        const propertyRows = response.data?.data ?? response.data;
        const fetchedProperties = Array.isArray(propertyRows)
          ? propertyRows.map(normalizeProperty)
          : [];
        setProperties(fetchedProperties);
      } catch (error) {
        console.error('Failed to load properties', error);
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };
    loadProperties();
  }, []);

  useEffect(() => {
    setIsScrolled(activeTab !== 'Home');
  }, [activeTab]);

  const handleViewDetails = async (id: string) => {
    try {
      let viewedProperty: any = null;
      try {
        const viewResponse = await propertyService.recordView(id);
        viewedProperty = viewResponse.data?.data?.property;
        const nextViews = Number(
          viewResponse.data?.data?.views || viewedProperty?.views || 0,
        );
        setProperties(current =>
          current.map(item =>
            item.id === id || item.code === id
              ? { ...item, views: nextViews }
              : item,
          ),
        );
      } catch (viewError) {
        console.error('Failed to record property view', viewError);
      }

      const response = viewedProperty
        ? { data: { data: viewedProperty } }
        : await propertyService.getById(id);
      const property = response.data?.data ?? response.data;
      setSelectedProperty(property);
      setActiveTab('PropertyDetail');
    } catch (error) {
      console.error('Failed to load property details', error);
      Alert.alert(
        'Property details unavailable',
        'Could not fetch this property from the database.',
      );
    }
  };

  const updateHeaderState = useCallback((offsetY: number) => {
    if (activeTab !== 'Home') {
      setIsScrolled(true);
      return;
    }
    setIsScrolled(Math.max(0, offsetY) > 8);
  }, [activeTab]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    updateHeaderState(event.nativeEvent.contentOffset.y);
  };

  const filteredProperties = properties.filter(item => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const titleMatch = item.title
        ? item.title.toLowerCase().includes(query)
        : false;
      const locationMatch = item.location
        ? item.location.toLowerCase().includes(query)
        : false;
      if (!titleMatch && !locationMatch) {
        return false;
      }
    }

    if (category && category !== 'All') {
      const itemCat = item.propertyType || 'Residential';
      if (itemCat.toLowerCase() !== category.toLowerCase()) {
        return false;
      }
    }

    return true;
  });

  return (
    <View className="flex-1 bg-white">
      <StatusBar
        barStyle={
          isScrolled || activeTab !== 'Home' ? 'dark-content' : 'light-content'
        }
        translucent
        backgroundColor="transparent"
      />

      {activeTab === 'Home' ? (
        <ScrollView
          className="flex-1 bg-slate-50"
          showsVerticalScrollIndicator={false}
          bounces={false}
          onScroll={handleScroll}
          onScrollEndDrag={handleScroll}
          onMomentumScrollEnd={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <Hero
            propertyType={propertyType}
            setPropertyType={setPropertyType}
            category={category}
            setCategory={setCategory}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            content={homeContent}
            onSearch={() => setActiveTab('Properties')}
          />

          <MarketIntelligence />

          <View className="py-12 bg-white px-6">
            <View className="items-center mb-10">
              <Text className="text-3xl font-black text-[#0b3856] text-center tracking-tight">
                {homeContent.featuredTitle}
              </Text>
              <Text className="text-gray-500 text-sm text-center mt-3 font-medium px-4">
                {homeContent.featuredSubtitle}
              </Text>
            </View>

            {loading ? (
              <PropertyFetchLoader message="Fetching featured properties" />
            ) : filteredProperties.length ? (
              filteredProperties.map(item => (
                <PropertyCard
                  key={item.id}
                  item={item}
                  onViewDetails={handleViewDetails}
                />
              ))
            ) : (
              <View className="py-10 items-center justify-center">
                <Text className="text-gray-500 font-medium">
                  No properties found matching your criteria
                </Text>
              </View>
            )}

            <TouchableOpacity
              onPress={() => setActiveTab('Properties')}
              className="bg-[#E6761D] py-4 rounded-2xl items-center shadow-xl shadow-orange-100"
            >
              <Text className="text-white font-black text-sm uppercase tracking-widest">
                View All Properties
              </Text>
            </TouchableOpacity>
          </View>

          <SellSection
            onPostProperty={() => setActiveTab('PostProperty')}
            content={homeContent}
          />
          <WhyChooseUs />
          <StatsSection />
          <Testimonials />
          <FinalCTA
            onViewServices={() => setActiveTab('Services')}
            onBrowseProperties={() => setActiveTab('Properties')}
          />
          <Footer onTabChange={setActiveTab} />
        </ScrollView>
      ) : activeTab === 'Services' ? (
        <View style={{ flex: 1, paddingTop: 80 + insets.top }}>
          <ServicesScreen onScroll={handleScroll} onTabChange={setActiveTab} />
        </View>
      ) : activeTab === 'Properties' ? (
        <View style={{ flex: 1, paddingTop: 80 + insets.top }}>
          <PropertiesScreen
            properties={properties}
            loading={loading}
            onScroll={handleScroll}
            onViewDetails={handleViewDetails}
            onTabChange={setActiveTab}
            initialSearchQuery={searchQuery}
            initialCategory={category}
          />
        </View>
      ) : activeTab === 'Blogs' ? (
        <View style={{ flex: 1, paddingTop: 80 + insets.top }}>
          <BlogsScreen
            onScroll={handleScroll}
            onReadBlog={(blog, blogs) => {
              setSelectedBlog(blog);
              setRecentBlogs(blogs);
              setActiveTab('BlogDetail');
            }}
            onTabChange={setActiveTab}
          />
        </View>
      ) : activeTab === 'PropertyDetail' && selectedProperty ? (
        <View style={{ flex: 1, paddingTop: 80 + insets.top }}>
          <PropertyDetailScreen
            property={selectedProperty}
            similar={properties}
            onBack={() => setActiveTab('Properties')}
            onOpenProperty={handleViewDetails}
            onTabChange={setActiveTab}
          />
        </View>
      ) : activeTab === 'BlogDetail' && selectedBlog ? (
        <BlogDetailScreen
          blog={selectedBlog}
          recent={recentBlogs}
          onBack={() => setActiveTab('Blogs')}
          onOpenBlog={(blog: any) => {
            setSelectedBlog(blog);
            setActiveTab('BlogDetail');
          }}
        />
      ) : activeTab === 'About' ? (
        <View style={{ flex: 1, paddingTop: 80 + insets.top }}>
          <AboutScreen onScroll={handleScroll} onTabChange={setActiveTab} />
        </View>
      ) : activeTab === 'Contact' ? (
        <View style={{ flex: 1, paddingTop: 80 + insets.top }}>
          <ContactScreen onScroll={handleScroll} onTabChange={setActiveTab} />
        </View>
      ) : activeTab === 'PrivacyPolicy' ? (
        <View style={{ flex: 1, paddingTop: 80 + insets.top }}>
          <PrivacyPolicyScreen
            onBack={() => setActiveTab('Home')}
            onTabChange={setActiveTab}
          />
        </View>
      ) : activeTab === 'Terms' ? (
        <View style={{ flex: 1, paddingTop: 80 + insets.top }}>
          <TermsAndConditionsScreen
            onBack={() => setActiveTab('Home')}
            onTabChange={setActiveTab}
          />
        </View>
      ) : activeTab === 'PostProperty' ? (
        <View style={{ flex: 1, paddingTop: 80 + insets.top }}>
          <PostPropertyScreen
            onScroll={handleScroll}
            onTabChange={setActiveTab}
          />
        </View>
      ) : activeTab === 'Login' ? (
        <View style={{ flex: 1, paddingTop: 80 + insets.top }}>
          <LoginScreen
            onLogin={(user: any) => {
              setAdminUser(user);
              setActiveTab('Admin');
            }}
            onRegisterPress={() => setActiveTab('Register')}
          />
        </View>
      ) : activeTab === 'Register' ? (
        <View style={{ flex: 1, paddingTop: 80 + insets.top }}>
          <RegisterScreen
            onRegistered={(user: any) => {
              if (['admin', 'manager', 'agent'].includes(user?.role)) {
                setAdminUser(user);
                setActiveTab('Admin');
              } else {
                setActiveTab('Login');
              }
            }}
            onLoginPress={() => setActiveTab('Login')}
          />
        </View>
      ) : activeTab === 'Admin' ? (
        <View style={{ flex: 1, paddingTop: 80 + insets.top }}>
          <AdminDashboardScreen
            user={adminUser}
            onLogout={() => {
              setAdminUser(null);
              setActiveTab('Login');
            }}
          />
        </View>
      ) : (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: 80 + insets.top,
          }}
        >
          <Text className="text-xl font-bold text-[#0c3854]">
            {activeTab} Section Coming Soon
          </Text>
          <TouchableOpacity
            onPress={() => setActiveTab('Home')}
            className="mt-4 bg-[#E6761D] px-6 py-2 rounded-xl"
          >
            <Text className="text-white font-bold">Go Back Home</Text>
          </TouchableOpacity>
        </View>
      )}

      <Header
        isScrolled={isScrolled}
        activeTab={activeTab}
        onTabChange={tab => setActiveTab(tab)}
      />
      <FloatingChat
        properties={properties}
        onOpenProperty={handleViewDetails}
        onBrowseProperties={() => setActiveTab('Properties')}
      />
    </View>
  );
};

export default RealEstate;
