import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { Eye, MapPin, Star, Zap, Phone, Bot } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';

const WhatsAppIcon = ({
  size = 18,
  color = 'white',
}: {
  size?: number;
  color?: string;
}) => (
  <Svg width={size} height={size} viewBox="0 0 448 512" fill={color}>
    <Path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
  </Svg>
);

export const PropertyFetchLoader = ({
  message = 'Fetching verified properties',
}: {
  message?: string;
}) => (
  <View
    className="my-8 mx-1 rounded-2xl border-2 border-orange-200 bg-white px-5 py-8 items-center shadow-lg"
    style={{
      shadowColor: '#E6761D',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.14,
      shadowRadius: 18,
      elevation: 6,
    }}
  >
    <View className="w-16 h-16 rounded-full bg-orange-50 border border-orange-200 items-center justify-center mb-4">
      <ActivityIndicator size="large" color="#E6761D" />
    </View>
    <Text className="text-[#0b3856] font-black text-base">{message}</Text>
    <Text className="text-gray-500 text-xs mt-1 text-center">
      Please wait while we load latest listings
    </Text>
    <View className="flex-row gap-1.5 mt-4">
      {[0, 1, 2].map(item => (
        <View key={item} className="w-2 h-2 rounded-full bg-orange-300" />
      ))}
    </View>
  </View>
);

export type Property = {
  id: string;
  code?: string;
  title: string;
  price: string;
  rawPrice?: number;
  config: string;
  area: number;
  perSqFt: number;
  location: string;
  rating: number;
  views: number;
  image: string;
  featured: boolean;
  aiScore: number;
  amenities: string[];
  propertyType?: string;
};

const PropertyCard = ({
  item,
  onViewDetails,
  variant = 'grid',
}: {
  item: Property;
  onViewDetails?: (id: string) => void;
  variant?: 'grid' | 'list';
}) => {
  const viewCount = Number(item.views || 0);
  const formattedViews =
    viewCount >= 100000
      ? `${(viewCount / 100000).toFixed(1).replace(/\.0$/, '')}L`
      : viewCount >= 1000
      ? `${(viewCount / 1000).toFixed(1).replace(/\.0$/, '')}K`
      : String(viewCount);

  if (variant === 'list') {
    return (
      <View
        className="bg-white rounded-2xl shadow-md overflow-hidden mb-4 border-2 border-orange-200 flex-row transition-all hover:border-orange-500 hover:shadow-xl hover:shadow-orange-200"
        style={{
          shadowColor: '#E6761D',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.14,
          shadowRadius: 14,
          elevation: 5,
        }}
      >
        <View className="w-32 h-44 bg-gray-100 relative">
          <Image
            source={{ uri: item.image }}
            className="w-full h-full"
            resizeMode="cover"
          />
          {item.featured && (
            <View className="absolute top-2 left-2 bg-orange-50 px-2 py-1 rounded-full border border-orange-200">
              <Text className="text-[9px] font-bold text-orange-700 uppercase">
                featured
              </Text>
            </View>
          )}
          <View className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 rounded-full flex-row items-center border border-white/20">
            <Eye size={11} color="white" />
            <Text className="text-[10px] font-black text-white ml-1">
              {formattedViews}
            </Text>
          </View>
        </View>

        <View className="flex-1 p-4">
          <View className="flex-row justify-between items-start mb-1">
            <Text
              className="text-base font-bold text-[#0b3856] flex-1 mr-2"
              numberOfLines={2}
            >
              {item.title}
            </Text>
            <View className="bg-purple-50 px-2 py-1 rounded-full flex-row items-center">
              <Bot size={10} color="#7c3aed" />
              <Text className="text-[10px] font-bold text-purple-700 ml-1">
                {item.aiScore}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center mb-2">
            <MapPin size={13} color="#6b7280" />
            <Text
              className="text-gray-600 text-xs ml-1 flex-1"
              numberOfLines={1}
            >
              {item.location}
            </Text>
          </View>

          <Text className="text-lg font-bold text-green-600">
            ₹{item.price}
          </Text>
          <Text className="text-gray-500 text-xs mb-3">
            {item.config} • {item.area} sq ft • ₹{item.perSqFt}/sq ft
          </Text>

          <View className="flex-row gap-2">
            <TouchableOpacity
              className="flex-1 bg-[#E6761D] py-2 rounded-lg items-center"
              onPress={() => onViewDetails?.(item.id)}
            >
              <Text className="text-white font-bold text-xs">View Details</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="px-3 bg-green-50 rounded-lg border border-green-100 items-center justify-center"
              onPress={() => Linking.openURL('tel:+919637009639')}
            >
              <Phone size={16} color="#059669" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View
      className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8 border-2 border-orange-200 transition-all hover:border-orange-500 hover:shadow-2xl hover:shadow-orange-200"
      style={{
        shadowColor: '#E6761D',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.16,
        shadowRadius: 16,
        elevation: 6,
      }}
    >
      <View className="relative">
        <Image
          source={{ uri: item.image }}
          className="w-full h-48"
          resizeMode="cover"
        />

        {/* Watermark effect */}
        <View className="absolute inset-0 items-center justify-center pointer-events-none opacity-40">
          <Text className="text-white text-2xl font-bold">ResaleExpert.in</Text>
        </View>

        {/* Badges */}
        <View className="absolute top-3 left-3 flex-row gap-2 z-20">
          {item.featured && (
            <View className="bg-orange-50 px-2 py-1 rounded-full flex-row items-center border border-orange-200">
              <Zap size={10} color="#c2410c" fill="#c2410c" />
              <Text className="text-[10px] font-bold text-orange-700 ml-1 uppercase">
                featured
              </Text>
            </View>
          )}
          <View className="bg-purple-600 px-2 py-1 rounded-full flex-row items-center shadow-sm">
            <Bot size={12} color="white" />
            <Text className="text-[10px] font-bold text-white ml-1">
              AI {item.aiScore}
            </Text>
          </View>
        </View>

        {/* Stats overlay */}
        <View className="absolute bottom-4 left-4 flex-row gap-2">
          <View className="bg-white/90 rounded-full px-2 py-1 flex-row items-center">
            <Star size={12} color="#EAB308" fill="#EAB308" />
            <Text className="text-[10px] font-bold text-gray-900 ml-1">
              {item.rating}
            </Text>
          </View>
          <View className="bg-black/70 rounded-full px-2.5 py-1 flex-row items-center border border-white/20">
            <Eye size={12} color="white" />
            <Text className="text-[10px] font-black text-white ml-1">
              {formattedViews} views
            </Text>
          </View>
        </View>
      </View>

      <View className="p-5">
        <View className="flex-row justify-between items-start mb-2">
          <Text className="text-lg font-bold text-[#0b3856] flex-1 mr-2">
            {item.title}
          </Text>
          <Text className="text-gray-400 text-base font-medium">
            {item.code || item.id}
          </Text>
        </View>

        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-xl font-bold text-green-600">
              ₹{item.price}
            </Text>
            <Text className="text-gray-500 text-sm">
              {item.config} • {item.area} sq ft
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-gray-400 text-xs">Price per sq ft</Text>
            <Text className="text-gray-900 font-semibold text-sm">
              ₹{item.perSqFt}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center mb-4">
          <MapPin size={16} color="#6b7280" />
          <Text className="text-gray-600 text-sm ml-2">{item.location}</Text>
        </View>

        <View className="flex-row flex-wrap gap-2 mb-5">
          {item.amenities.slice(0, 2).map((amenity, idx) => (
            <View key={idx} className="bg-blue-50 px-2.5 py-1 rounded-full">
              <Text className="text-blue-700 text-[11px] font-medium">
                {amenity}
              </Text>
            </View>
          ))}
          {item.amenities.length > 2 && (
            <View className="bg-gray-100 px-2.5 py-1 rounded-full">
              <Text className="text-gray-600 text-[11px] font-medium">
                +{item.amenities.length - 2} more
              </Text>
            </View>
          )}
        </View>

        <View className="flex-row gap-3">
          <TouchableOpacity
            className="flex-1 bg-[#E6761D] py-2.5 rounded-lg items-center"
            onPress={() => onViewDetails?.(item.id)}
          >
            <Text className="text-white font-bold text-sm">View Details</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="p-3 bg-green-50 rounded-lg border border-green-100"
            onPress={() => Linking.openURL('tel:+919637009639')}
          >
            <Phone size={18} color="#059669" />
          </TouchableOpacity>
          <TouchableOpacity
            className="p-3 bg-[#25D366] rounded-lg"
            onPress={() =>
              Linking.openURL(
                `https://wa.me/919146009176?text=Hi, I'm interested in property ${
                  item.code || item.title || item.id
                }`,
              )
            }
          >
            <WhatsAppIcon size={18} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default PropertyCard;
