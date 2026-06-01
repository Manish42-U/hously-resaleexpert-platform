import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  Linking,
  Platform,
  TouchableOpacity,
  Animated,
  StatusBar,
  TouchableWithoutFeedback,
  LayoutChangeEvent,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Menu, X } from 'lucide-react-native';

interface HeaderProps {
  isScrolled?: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const ADMIN_LOGIN_URL = __DEV__
  ? 'http://localhost:5173/login'
  : 'https://admin.resaleexpert.in/login';

const Header = ({ isScrolled = false, activeTab, onTabChange }: HeaderProps) => {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const isLargeScreen = windowWidth > 992;
  const showHeaderActions = windowWidth >= 768;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [drawerHeight, setDrawerHeight] = useState(0);
  
  const slideAnim = useRef(new Animated.Value(0)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const toggleMenu = () => {
    if (isMenuOpen) {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(backdropOpacity, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start(() => setIsMenuOpen(false));
    } else {
      setIsMenuOpen(true);
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(backdropOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    }
  };

  const closeMenu = () => {
    if (isMenuOpen) toggleMenu();
  };

  const handleLinkPress = (tab: string) => {
    if (tab === 'Login') {
      if (Platform.OS === 'web' && (globalThis as any)?.location) {
        (globalThis as any).location.href = ADMIN_LOGIN_URL;
        return;
      }

      Linking.openURL(ADMIN_LOGIN_URL);
      closeMenu();
      return;
    }

    onTabChange(tab);
    closeMenu();
  };

  const onDrawerLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    if (drawerHeight === 0 && height > 0) setDrawerHeight(height);
  };

  const drawerTranslateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-drawerHeight, 0],
  });

  const navLinks = [
    { label: 'Home' },
    { label: 'Properties' },
    { label: 'Services' },
    { label: 'About' },
    { label: 'Blogs' },
    { label: 'Contact' },
  ];

  const isTransparent = activeTab === 'Home' && !isScrolled && !isMenuOpen;
  const textColor = isTransparent ? '#FFFFFF' : '#0c3854';
  const borderBottomColor = isTransparent ? 'transparent' : '#E5E7EB';
  const headerBackgroundColor = isTransparent ? 'transparent' : '#FFFFFF';
  const logoUri = isTransparent
    ? 'https://resaleexpert.in/uploads/system/footer_logo-1759471021661-685054072-Resale_Expert_White.png'
    : 'https://resaleexpert.in/uploads/system/company_logo-1778756377340-827835566-Resale-Expert-Logo.png';
  const isPostPropertyPage = activeTab === 'PostProperty';
  const headerHeight = 90 + insets.top;
  const logoWidth = isLargeScreen ? 300 : showHeaderActions ? 220 : Math.min(305, windowWidth - 72);
  const actionButtonTextColor = isTransparent ? '#FFFFFF' : '#0c3854';
  const actionButtonBorderColor = isTransparent ? 'rgba(255,255,255,0.75)' : '#0c3854';

  return (
    <>
      <StatusBar barStyle={isTransparent ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />

      {/* HEADER – only logo and menu icon */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000 }}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: headerBackgroundColor }}>
          <Animated.View
            style={{
              height: 90,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 20,
              backgroundColor: headerBackgroundColor,
              borderBottomWidth: isTransparent ? 0 : 1,
              borderBottomColor: borderBottomColor,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: isTransparent ? 0 : 0.05,
              shadowRadius: isTransparent ? 0 : 4,
              elevation: isTransparent ? 0 : 2,
            }}
          >
            {/* Logo and Brand */}
            <TouchableOpacity 
              activeOpacity={0.8} 
              style={{ flexDirection: 'row', alignItems: 'center', marginRight: 20 }}
              onPress={() => handleLinkPress('Home')}
            >
              <Image
                source={{ uri: logoUri }}
                style={{
                  height: 84,
                  width: logoWidth,
                }}
                resizeMode="contain"
              />
            </TouchableOpacity>

            {/* Navigation Links for Large Screens */}
            {isLargeScreen ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'center', gap: 16 }}>
                {navLinks.map((link, index) => {
                  const isActive = activeTab === link.label;
                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleLinkPress(link.label)}
                      style={{
                        paddingVertical: 8,
                        borderBottomWidth: 2,
                        borderBottomColor: isActive ? '#E6761D' : 'transparent',
                        marginHorizontal: 4,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: '600',
                          color: isActive ? '#E6761D' : textColor,
                        }}
                      >
                        {link.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : null}

            {showHeaderActions ? (
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: isLargeScreen ? 10 : 8,
                marginRight: 12,
              }}>
                {!isPostPropertyPage && (
                  <TouchableOpacity
                    activeOpacity={0.86}
                    onPress={() => handleLinkPress('PostProperty')}
                    style={{
                      backgroundColor: '#E6761D',
                      borderRadius: 12,
                      paddingHorizontal: isLargeScreen ? 14 : 12,
                      paddingVertical: 10,
                      shadowColor: '#E6761D',
                      shadowOffset: { width: 0, height: 6 },
                      shadowOpacity: 0.18,
                      shadowRadius: 10,
                      elevation: 3,
                    }}
                  >
                    <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: isLargeScreen ? 13 : 12 }}>
                      Post Property
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  activeOpacity={0.86}
                  onPress={() => handleLinkPress('Login')}
                  style={{
                    borderWidth: 1.5,
                    borderColor: actionButtonBorderColor,
                    borderRadius: 12,
                    paddingHorizontal: isLargeScreen ? 14 : 12,
                    paddingVertical: 9,
                    backgroundColor: isTransparent ? 'rgba(255,255,255,0.06)' : '#FFFFFF',
                  }}
                >
                  <Text style={{ color: actionButtonTextColor, fontWeight: '900', fontSize: isLargeScreen ? 13 : 12 }}>
                    Login
                  </Text>
                </TouchableOpacity>

                {!isPostPropertyPage && (
                  <TouchableOpacity
                    activeOpacity={0.86}
                    onPress={() => handleLinkPress('PostProperty')}
                    style={{
                      backgroundColor: isTransparent ? 'rgba(12,56,84,0.86)' : '#0c3854',
                      borderRadius: 12,
                      paddingHorizontal: isLargeScreen ? 14 : 12,
                      paddingVertical: 10,
                    }}
                  >
                    <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: isLargeScreen ? 13 : 12 }}>
                      Get Started
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : null}

            <TouchableOpacity onPress={toggleMenu}>
              {isMenuOpen ? <X color={textColor} size={34} /> : <Menu color={textColor} size={34} />}
            </TouchableOpacity>
          </Animated.View>
        </SafeAreaView>
      </View>

      {/* Backdrop */}
      {isMenuOpen && (
        <TouchableWithoutFeedback onPress={closeMenu}>
          <Animated.View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              opacity: backdropOpacity,
              zIndex: 998,
            }}
          />
        </TouchableWithoutFeedback>
      )}

      {/* DRAWER – everything inside, only visible when menu is open */}
      {isMenuOpen && (
        <Animated.View
          onLayout={onDrawerLayout}
          style={{
            position: 'absolute',
            top: headerHeight,
            left: 0,
            right: 0,
            backgroundColor: '#FFFFFF',
            transform: [{ translateY: drawerTranslateY }],
            zIndex: 999,
            elevation: 999,
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
            borderBottomWidth: 1,
            borderBottomColor: '#E5E7EB',
            maxHeight: '80%', // so it doesn't cover full screen if too many items
          }}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 }}>
              {/* Navigation Links */}
              {navLinks.map((link, index) => (
                <TouchableOpacity
                  key={index}
                  style={{
                    paddingVertical: 14,
                    borderBottomWidth: 1,
                    borderBottomColor: activeTab === link.label ? '#E6761D' : '#F3F4F6',
                  }}
                  onPress={() => handleLinkPress(link.label)}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '600',
                      color: activeTab === link.label ? '#E6761D' : '#0c3854',
                    }}
                  >
                    {link.label}
                  </Text>
                </TouchableOpacity>
              ))}

              {/* Action Buttons – exactly below the nav links */}
              <View style={{ paddingTop: 16, marginTop: 16, borderTopWidth: 1, borderTopColor: '#F3F4F6', gap: 12 }}>
                {!isPostPropertyPage && (
                  <TouchableOpacity
                    style={{ backgroundColor: '#E6761D', paddingVertical: 12, borderRadius: 10, alignItems: 'center' }}
                    onPress={() => handleLinkPress('PostProperty')}
                  >
                    <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 14 }}>Post Property</Text>
                  </TouchableOpacity>
                )}

                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <TouchableOpacity
                    style={{ flex: 1, borderWidth: 1.5, borderColor: '#0c3854', paddingVertical: 12, borderRadius: 10, alignItems: 'center' }}
                    onPress={() => handleLinkPress('Login')}
                  >
                    <Text style={{ color: '#0c3854', fontWeight: 'bold', fontSize: 14 }}>Login</Text>
                  </TouchableOpacity>
                  {!isPostPropertyPage && (
                    <TouchableOpacity
                      style={{ flex: 1, backgroundColor: '#0c3854', paddingVertical: 12, borderRadius: 10, alignItems: 'center' }}
                      onPress={() => handleLinkPress('PostProperty')}
                    >
                      <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 14 }}>Get Started</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          </ScrollView>
        </Animated.View>
      )}
    </>
  );
};

export default Header;
