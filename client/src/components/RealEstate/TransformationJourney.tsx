import React from 'react';
import { View, Text } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const TransformationJourney = () => {
  const timeline = [
    {
      year: "2012-2018",
      title: "AAKAR INFRA SERVICES",
      subtitle: "The Beginning",
      description: "Started with a vision in infrastructure development, focusing on quality construction and civil engineering projects.",
      badge: "Founded with commitment to excellence"
    },
    {
      year: "2019-2021",
      title: "DIGITAL TRANSFORMATION",
      subtitle: "Growth Phase",
      description: "Embraced technology and innovation, introducing digital solutions for project management and client engagement.",
      badge: "Launched technology division"
    },
    {
      year: "2025 & Beyond",
      title: "HOUSLY FINNTECH REALTY",
      subtitle: "The Future",
      description: "Rebranded and unified three powerful divisions under one visionary brand. Leading innovation in real estate, finance, and technology.",
      badge: "Shaping the future of integrated services"
    }
  ];

  return (
    <View className="py-16 bg-white px-6">
      <View className="items-center mb-12">
        <Text className="text-2xl font-black text-gray-900 mb-2">Our Transformation Journey</Text>
        <Text className="text-gray-500 text-sm">From vision to Realty</Text>
      </View>

      <View className="relative">
        {/* Line */}
        <View className="absolute left-4 top-0 bottom-0 w-1 bg-gray-100 rounded-full" />

        {/* Timeline Items */}
        <View className="gap-10">
          {timeline.map((item, index) => (
            <View key={index} className="flex-row">
              <View className="z-10 mt-1">
                <View className="w-8 h-8 rounded-full bg-[#E6761D] border-4 border-white shadow-sm items-center justify-center">
                   <View className="w-2 h-2 rounded-full bg-white" />
                </View>
              </View>
              
              <View className="flex-1 ml-6 bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <View className="flex-row justify-between items-center mb-2">
                  <LinearGradient 
                    colors={['#E6761D', '#F97316']} 
                    className="px-3 py-1 rounded-full"
                  >
                    <Text className="text-white text-[10px] font-bold">{item.year}</Text>
                  </LinearGradient>
                </View>
                
                <Text className="text-gray-900 font-black text-base">{item.title}</Text>
                <Text className="text-[#E6761D] text-[10px] font-bold uppercase tracking-widest mb-2">{item.subtitle}</Text>
                <Text className="text-gray-500 text-xs leading-5 mb-4">{item.description}</Text>
                
                <View className="bg-emerald-50 self-start px-3 py-1.5 rounded-lg border border-emerald-100">
                  <Text className="text-emerald-700 text-[10px] font-bold">{item.badge}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default TransformationJourney;
