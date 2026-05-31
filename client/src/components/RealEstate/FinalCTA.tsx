import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const FinalCTA = ({ 
  onViewServices,
  onBrowseProperties,
}: { 
  onViewServices?: () => void;
  onBrowseProperties?: () => void;
}) => {
  return (
    <LinearGradient colors={['#0b3856', '#0c3854']} className="py-16 px-8 items-center">
      <Text className="text-white text-3xl font-black text-center mb-4 leading-tight">
        Ready to Find Your Perfect Property?
      </Text>
      <Text className="text-blue-100/70 text-center mb-10 leading-6 font-medium">
        Join thousands who found their dream properties with AI-powered search
      </Text>
      
      <View className="w-full gap-4">
        <TouchableOpacity 
          className="bg-[#E6761D] py-5 rounded-2xl items-center shadow-2xl shadow-orange-900"
          onPress={onBrowseProperties}
        >
          <Text className="text-white font-black uppercase tracking-[3px] text-base">Browse Properties</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className="border-2 border-white/40 py-5 rounded-2xl items-center"
          onPress={onViewServices}
        >
          <Text className="text-white font-black uppercase tracking-[3px] text-base">View All Services</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

export default FinalCTA;
