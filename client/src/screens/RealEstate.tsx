import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Alert,
  Platform,
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
  const syncsBrowserHistory =
    Platform.OS === 'web' &&
    Boolean((globalThis as any)?.history) &&
    Boolean((globalThis as any)?.location);

  const tabPathByName = useMemo<Record<string, string>>(
    () => ({
      Home: '/home',
      Properties: '/properties',
      Services: '/services',
      About: '/about',
      Blogs: '/blogs',
      Contact: '/contact',
      PostProperty: '/post-property',
      PropertyDetail: '/property-detail',
      BlogDetail: '/blog-detail',
      PrivacyPolicy: '/privacy-policy',
      Terms: '/terms-and-conditions',
    }),
    [],
  );

  const tabNameByPath = useMemo<Record<string, string>>(
    () =>
      Object.fromEntries(
        Object.entries(tabPathByName).map(([tab, path]) => [path, tab]),
      ),
    [tabPathByName],
  );

  const changeTab = useCallback(
    (tab: string, options: { replace?: boolean } = {}) => {
      setActiveTab(tab);
      if (!syncsBrowserHistory) return;

      const history = (globalThis as any).history;
      const location = (globalThis as any).location;
      const path = tabPathByName[tab] || `/${tab.toLowerCase()}`;
      if (location.pathname === path && !options.replace) return;

      const state = { activeTab: tab };
      if (options.replace) {
        history.replaceState(state, '', path);
      } else {
        history.pushState(state, '', path);
      }
    },
    [syncsBrowserHistory, tabPathByName],
  );

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
    if (!syncsBrowserHistory) return;

    const history = (globalThis as any).history;
    const location = (globalThis as any).location;
    const initialTab =
      tabNameByPath[String(location.pathname).toLowerCase()] || activeTab;
    history.replaceState({ activeTab: initialTab }, '', location.pathname);

    const handlePopState = (event: any) => {
      const nextTab =
        event.state?.activeTab ||
        tabNameByPath[String((globalThis as any).location.pathname).toLowerCase()] ||
        'Home';
      setActiveTab(nextTab);
    };

    (globalThis as any).addEventListener('popstate', handlePopState);
    return () =>
      (globalThis as any).removeEventListener('popstate', handlePopState);
  }, [activeTab, syncsBrowserHistory, tabNameByPath]);

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
      changeTab('PropertyDetail');
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
  const homeProperties = filteredProperties.slice(0, 12);

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
            onSearch={() => changeTab('Properties')}
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
            ) : homeProperties.length ? (
              homeProperties.map(item => (
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
              onPress={() => changeTab('Properties')}
              className="bg-[#E6761D] py-4 rounded-2xl items-center shadow-xl shadow-orange-100"
            >
              <Text className="text-white font-black text-sm uppercase tracking-widest">
                View All Properties
              </Text>
            </TouchableOpacity>
          </View>

          <SellSection
            onPostProperty={() => changeTab('PostProperty')}
            content={homeContent}
          />
          <WhyChooseUs />
          <StatsSection />
          <Testimonials />
          <FinalCTA
            onViewServices={() => changeTab('Services')}
            onBrowseProperties={() => changeTab('Properties')}
          />
          <Footer onTabChange={changeTab} />
        </ScrollView>
      ) : activeTab === 'Services' ? (
        <View style={{ flex: 1, paddingTop: 80 + insets.top }}>
          <ServicesScreen onScroll={handleScroll} onTabChange={changeTab} />
        </View>
      ) : activeTab === 'Properties' ? (
        <View style={{ flex: 1, paddingTop: 80 + insets.top }}>
          <PropertiesScreen
            properties={properties}
            loading={loading}
            onScroll={handleScroll}
            onViewDetails={handleViewDetails}
            onTabChange={changeTab}
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
              changeTab('BlogDetail');
            }}
            onTabChange={changeTab}
          />
        </View>
      ) : activeTab === 'PropertyDetail' && selectedProperty ? (
        <View style={{ flex: 1, paddingTop: 80 + insets.top }}>
          <PropertyDetailScreen
            property={selectedProperty}
            similar={properties}
            onBack={() => changeTab('Properties')}
            onOpenProperty={handleViewDetails}
            onTabChange={changeTab}
          />
        </View>
      ) : activeTab === 'BlogDetail' && selectedBlog ? (
        <BlogDetailScreen
          blog={selectedBlog}
          recent={recentBlogs}
          onBack={() => changeTab('Blogs')}
          onOpenBlog={(blog: any) => {
            setSelectedBlog(blog);
            changeTab('BlogDetail');
          }}
        />
      ) : activeTab === 'About' ? (
        <View style={{ flex: 1, paddingTop: 80 + insets.top }}>
          <AboutScreen onScroll={handleScroll} onTabChange={changeTab} />
        </View>
      ) : activeTab === 'Contact' ? (
        <View style={{ flex: 1, paddingTop: 80 + insets.top }}>
          <ContactScreen onScroll={handleScroll} onTabChange={changeTab} />
        </View>
      ) : activeTab === 'PrivacyPolicy' ? (
        <View style={{ flex: 1, paddingTop: 80 + insets.top }}>
          <PrivacyPolicyScreen
            onBack={() => changeTab('Home')}
            onTabChange={changeTab}
          />
        </View>
      ) : activeTab === 'Terms' ? (
        <View style={{ flex: 1, paddingTop: 80 + insets.top }}>
          <TermsAndConditionsScreen
            onBack={() => changeTab('Home')}
            onTabChange={changeTab}
          />
        </View>
      ) : activeTab === 'PostProperty' ? (
        <View style={{ flex: 1, paddingTop: 80 + insets.top }}>
          <PostPropertyScreen
            onScroll={handleScroll}
            onTabChange={changeTab}
          />
        </View>
      ) : activeTab === 'Login' ? (
        <View style={{ flex: 1, paddingTop: 80 + insets.top }}>
          <LoginScreen
            onLogin={(user: any) => {
              setAdminUser(user);
              changeTab('Admin');
            }}
            onRegisterPress={() => changeTab('Register')}
          />
        </View>
      ) : activeTab === 'Register' ? (
        <View style={{ flex: 1, paddingTop: 80 + insets.top }}>
          <RegisterScreen
            onRegistered={(user: any) => {
              if (['admin', 'manager', 'agent'].includes(user?.role)) {
                setAdminUser(user);
                changeTab('Admin');
              } else {
                changeTab('Login');
              }
            }}
            onLoginPress={() => changeTab('Login')}
          />
        </View>
      ) : activeTab === 'Admin' ? (
        <View style={{ flex: 1, paddingTop: 80 + insets.top }}>
          <AdminDashboardScreen
            user={adminUser}
            onLogout={() => {
              setAdminUser(null);
              changeTab('Login');
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
            onPress={() => changeTab('Home')}
            className="mt-4 bg-[#E6761D] px-6 py-2 rounded-xl"
          >
            <Text className="text-white font-bold">Go Back Home</Text>
          </TouchableOpacity>
        </View>
      )}

      <Header
        isScrolled={isScrolled}
        activeTab={activeTab}
        onTabChange={changeTab}
      />
      <FloatingChat
        properties={properties}
        onOpenProperty={handleViewDetails}
        onBrowseProperties={() => changeTab('Properties')}
      />
    </View>
  );
};

export default RealEstate;
