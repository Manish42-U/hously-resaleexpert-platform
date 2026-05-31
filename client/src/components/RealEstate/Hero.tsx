import React, { useEffect, useMemo, useState } from 'react';
import { Animated, Easing, Image, Platform, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { ChevronRight, MapPin, Search } from 'lucide-react-native';

interface HeroProps {
  propertyType: string;
  setPropertyType: (type: string) => void;
  category: string;
  setCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  content?: {
    heroImage?: string;
    heroImages?: string[] | string;
    heroTitle?: string;
    heroSubtitle?: string;
  };
  onSearch?: () => void;
}

const Hero = ({ 
  propertyType, 
  setPropertyType, 
  category, 
  setCategory, 
  searchQuery, 
  setSearchQuery,
  content,
  onSearch,
}: HeroProps) => {
  const { height: windowHeight } = useWindowDimensions();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeImage, setActiveImage] = useState('');
  const [incomingImage, setIncomingImage] = useState('');
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  const heroImages = useMemo(() => {
    const defaultHeroImages = [
      '/uploads/hero/photos-1760109484516-61894450-heaader-03.jpg',
      '/uploads/hero/photos-1760109484520-223205966-header-01-1.jpg',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1800&q=90',
    ];

    const toAbsoluteHeroImage = (value?: string) => {
      const image = value?.trim();
      if (!image) return '';
      if (/^https?:\/\//i.test(image)) return image;
      if (image.startsWith('/uploads/')) return `https://resaleexpert.in${image}`;
      return '';
    };

    const cmsImages = Array.isArray(content?.heroImages)
      ? content.heroImages
      : typeof content?.heroImages === 'string'
        ? content.heroImages.split(',').map((item) => item.trim())
        : [];

    const images = [
      ...defaultHeroImages,
      content?.heroImage,
      ...cmsImages,
    ]
      .map(toAbsoluteHeroImage)
      .filter((image) => image && !image.includes('/hously/hero/main.jpg'));
    return Array.from(new Set(images)).slice(0, 3);
  }, [content?.heroImage, content?.heroImages]);

  const imageUrl = heroImages[currentSlide] || 'https://resaleexpert.in/uploads/hero/photos-1760109484520-223205966-header-01-1.jpg';

  const goToNextImage = () => {
    if (heroImages.length <= 1) return;
    setCurrentSlide((prev) => (prev + 1) % heroImages.length);
  };

  useEffect(() => {
    if (heroImages.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  useEffect(() => {
    if (currentSlide > heroImages.length - 1) {
      setCurrentSlide(0);
    }
  }, [currentSlide, heroImages.length]);

  useEffect(() => {
    heroImages.forEach((url) => {
      Image.prefetch(url).catch(() => null);
    });
  }, [heroImages]);

  useEffect(() => {
    if (!imageUrl) return;
    if (!activeImage) {
      setActiveImage(imageUrl);
      return;
    }
    if (imageUrl === activeImage || imageUrl === incomingImage) return;

    let cancelled = false;
    const showNext = () => {
      if (cancelled) return;
      setIncomingImage(imageUrl);
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1400,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: Platform.OS !== 'web',
      }).start(({ finished }) => {
        if (!finished || cancelled) return;
        setActiveImage(imageUrl);
        setIncomingImage('');
        fadeAnim.setValue(0);
      });
    };

    Image.prefetch(imageUrl).then(showNext).catch(showNext);
    return () => {
      cancelled = true;
    };
  }, [activeImage, fadeAnim, imageUrl, incomingImage]);

  const renderHeroImage = (url: string, opacity: any, key: string) => {
    if (!url) return null;

    if (Platform.OS === 'web') {
      return (
        <Animated.View
          key={key}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            height: '100%',
            opacity,
            backgroundImage: `url("${url}")`,
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
          } as any}
        />
      );
    }

    return (
      <Animated.Image
        key={key}
        source={{ uri: url }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          opacity,
        }}
        resizeMode="cover"
        onError={goToNextImage}
      />
    );
  };

  return (
    <View
      style={{
        minHeight: Platform.OS === 'web' ? '100vh' : Math.max(windowHeight, 760),
        backgroundColor: '#1e3a5f',
        overflow: 'hidden',
      } as any}
      className="relative"
    >
      {renderHeroImage(activeImage || imageUrl, 1, 'active-hero')}
      {incomingImage ? renderHeroImage(incomingImage, fadeAnim, 'incoming-hero') : null}
        {/* Dark gradient overlay */}
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.18)',
        }} />
        
        <LinearGradient 
          colors={['rgba(4,14,24,0.08)', 'rgba(4,14,24,0.34)', 'rgba(4,14,24,0.58)']} 
          style={{
            flex: 1,
            justifyContent: 'center',
            paddingHorizontal: 16,
            paddingTop: 155,
            paddingBottom: 28,
          }}
        >
          {/* Title and Subtitle */}
          <View style={{ marginBottom: 22 }}>
            <Text style={{ fontSize: 28, lineHeight: 36 }} className="text-white font-black text-center mb-3">
              {content?.heroTitle || 'Find Your Perfect Resale Property in Pune & PCMC'}
            </Text>
            <Text style={{ fontSize: 15, lineHeight: 22 }} className="text-blue-100 text-center px-2 opacity-95">
              {content?.heroSubtitle || 'Browse verified resale flats, apartments, and commercial properties. Trusted by homeowners and buyers for transparent, hassle-free transactions.'}
            </Text>
          </View>

          {/* Buy/Rent Toggle */}
          <View className="flex-row justify-center gap-3 mb-3">
            <TouchableOpacity
              onPress={() => setPropertyType('Buy')}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 999,
                backgroundColor: propertyType === 'Buy' ? '#E6761D' : 'rgba(255,255,255,0.2)',
              }}
            >
              <Text className="text-white text-xs font-bold">Buy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              disabled
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 999,
                backgroundColor: 'rgba(243,244,246,0.6)',
                opacity: 0.6,
              }}
            >
              <Text className="text-gray-700 text-xs font-bold">Rent</Text>
            </TouchableOpacity>
          </View>

          {/* Category Chips */}
          <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 8,
            marginBottom: 18,
          }}>
              {['All', 'Agriculture Land', 'Commercial', 'Residential'].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategory(cat)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 999,
                    backgroundColor: category === cat ? 'white' : 'rgba(255,255,255,0.2)',
                    minWidth: 'auto',
                  }}
                >
                  <Text style={{
                    fontSize: 13,
                    fontWeight: '500',
                    color: category === cat ? 'black' : 'white',
                  }}>{cat}</Text>
                </TouchableOpacity>
              ))}
          </View>

          {/* Search Form */}
          <View style={{
            backgroundColor: 'rgba(255,255,255,0.16)',
            borderRadius: 16,
            padding: 16,
            gap: 12,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.16)',
            overflow: 'hidden',
            ...(Platform.OS === 'web' ? {
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            } : {}),
            shadowColor: '#020617',
            shadowOffset: { width: 0, height: 18 },
            shadowOpacity: 0.32,
            shadowRadius: 30,
            elevation: 12,
          } as any}>
            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(255,255,255,0.06)',
              }}
            />
            <View style={{
              flexDirection: Platform.OS === 'web' ? 'row' : 'column',
              gap: 12,
            }}>
              {/* City Selector */}
              <View style={{ width: Platform.OS === 'web' ? 190 : '100%', zIndex: 20 } as any}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setIsCityDropdownOpen((open) => !open)}
                  style={{
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.30)',
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    backgroundColor: 'transparent',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                    minHeight: 42,
                  }}
                >
                  <MapPin size={15} color="#FFFFFF" />
                  <Text style={{
                    fontSize: 13,
                    color: '#FFFFFF',
                    fontWeight: '800',
                    flex: 1,
                  }}>Pune</Text>
                  <ChevronRight
                    size={15}
                    color="#FFFFFF"
                    style={{ transform: [{ rotate: isCityDropdownOpen ? '-90deg' : '90deg' }] }}
                  />
                </TouchableOpacity>
                {isCityDropdownOpen && (
                  <View style={{
                    position: 'absolute',
                    top: 48,
                    left: 0,
                    right: 0,
                    borderRadius: 10,
                    overflow: 'hidden',
                    backgroundColor: '#0b3856',
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.25)',
                    shadowColor: '#020617',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.22,
                    shadowRadius: 16,
                    elevation: 8,
                  } as any}>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => setIsCityDropdownOpen(false)}
                      style={{ paddingHorizontal: 12, paddingVertical: 11 }}
                    >
                      <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '800' }}>Pune</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Search Input */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'rgba(255,255,255,0.10)',
                borderRadius: 8,
                borderWidth: 0,
                paddingHorizontal: 12,
                paddingVertical: 6,
                gap: 8,
                flex: 1,
                minHeight: 42,
              }}>
                <Search size={18} color="#FFFFFF" />
                <TextInput
                  style={{
                    flex: 1,
                    fontSize: 14,
                    color: '#FFFFFF',
                    fontWeight: '600',
                    paddingVertical: 4,
                  }}
                  placeholder="Search properties by locality or area"
                  placeholderTextColor="rgba(255,255,255,0.70)"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>

              {/* Search Button */}
              <TouchableOpacity
                onPress={onSearch}
                style={{
                backgroundColor: '#E6761D',
                paddingVertical: 8,
                paddingHorizontal: 16,
                borderRadius: 8,
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 42,
                width: Platform.OS === 'web' ? 112 : '100%',
                shadowColor: '#E6761D',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.24,
                shadowRadius: 12,
                elevation: 4,
              } as any}>
                <Text style={{
                  color: 'white',
                  fontSize: 16,
                  fontWeight: '700',
                }}>Search</Text>
              </TouchableOpacity>
            </View>
            <View style={{
              marginTop: 0,
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 8,
            }}>
              <Text style={{ color: 'rgba(255,255,255,0.92)', fontSize: 12, fontWeight: '700' }}>
                Add up to 1 localities.
              </Text>
            </View>
          </View>

          {/* Slide Indicators */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 6,
            marginTop: 32,
          }}>
            {heroImages.map((_, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setCurrentSlide(index)}
                style={{
                  width: index === currentSlide ? 24 : 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: index === currentSlide ? 'white' : 'rgba(255,255,255,0.6)',
                }}
              />
            ))}
          </View>
        </LinearGradient>
    </View>
  );
};
export default Hero;
