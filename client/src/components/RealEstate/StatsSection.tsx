import React, { useRef, useState } from 'react';
import { Pressable, View, Text } from 'react-native';
import { Home, Users, Award, Globe } from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';

const StatsSection = () => {
  const [activeStat, setActiveStat] = useState<string | null>(null);
  const statTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stats = [
    {
      label: 'Properties Sold',
      value: '10K',
      plus: '+',
      icon: Home,
      colors: ['#dbeafe', '#eff6ff'],
      iconBg: '#bfdbfe',
      hoverIconBg: '#93c5fd',
      iconColor: '#1d4ed8',
      lineColor: '#93c5fd',
    },
    {
      label: 'Happy Customers',
      value: '25K',
      plus: '+',
      icon: Users,
      colors: ['#d1fae5', '#ecfdf5'],
      iconBg: '#a7f3d0',
      hoverIconBg: '#6ee7b7',
      iconColor: '#047857',
      lineColor: '#6ee7b7',
    },
    {
      label: 'Years of Trust',
      value: '15',
      plus: '+',
      icon: Award,
      colors: ['#fef3c7', '#fffbeb'],
      iconBg: '#fde68a',
      hoverIconBg: '#fcd34d',
      iconColor: '#b45309',
      lineColor: '#fcd34d',
    },
    {
      label: 'Monthly Visitors',
      value: '7M',
      plus: '+',
      icon: Globe,
      colors: ['#f3e8ff', '#faf5ff'],
      iconBg: '#e9d5ff',
      hoverIconBg: '#d8b4fe',
      iconColor: '#7e22ce',
      lineColor: '#d8b4fe',
    },
  ];

  const activateStat = (label: string) => {
    if (statTimer.current) clearTimeout(statTimer.current);
    setActiveStat(label);
  };

  const releaseStat = () => {
    if (statTimer.current) clearTimeout(statTimer.current);
    statTimer.current = setTimeout(() => setActiveStat(null), 700);
  };

  return (
    <View className="py-10 bg-gray-50 px-6">
      <View className="flex-row flex-wrap justify-between">
        {stats.map(item => (
          <Pressable
            key={item.label}
            className="w-[48%] mb-5"
            onHoverIn={() => activateStat(item.label)}
            onHoverOut={() => setActiveStat(null)}
            onPressIn={() => activateStat(item.label)}
            onPressOut={releaseStat}
            onPress={() => activateStat(item.label)}
            style={() => {
              const active = activeStat === item.label;
              return {
                borderRadius: 12,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: active ? 5 : 2 },
                shadowOpacity: active ? 0.14 : 0.07,
                shadowRadius: active ? 9 : 4,
                elevation: active ? 5 : 2,
                transform: [{ translateY: active ? -4 : 0 }],
              };
            }}
          >
            {() => (
              <LinearGradient
                colors={item.colors}
                style={{
                  borderRadius: 12,
                  padding: 14,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor:
                    activeStat === item.label ? item.lineColor : 'rgba(255,255,255,0.9)',
                }}
              >
                <View
                  style={{
                    backgroundColor:
                      activeStat === item.label ? item.hoverIconBg : item.iconBg,
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 8,
                  }}
                >
                  <item.icon size={18} color={item.iconColor} />
                </View>
                <Text className="text-xl font-bold text-gray-800 leading-tight">
                  {item.value}
                  <Text className="text-base text-gray-600">{item.plus}</Text>
                </Text>
                <Text className="text-gray-600 text-[11px] font-medium mt-0.5 text-center">
                  {item.label}
                </Text>
                <View
                  style={{ backgroundColor: item.lineColor }}
                  className="w-6 h-0.5 rounded-full mt-1.5"
                />
              </LinearGradient>
            )}
          </Pressable>
        ))}
      </View>
    </View>
  );
};

export default StatsSection;
