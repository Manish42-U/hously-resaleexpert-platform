import React, { useMemo, useRef, useState } from 'react';
import { Image, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Bot, Home, MessageCircle, Search, Send, X } from 'lucide-react-native';

type ChatMessage = {
  role: 'assistant' | 'user';
  text: string;
};

type FloatingChatProps = {
  properties?: any[];
  onOpenProperty?: (id: string) => void;
  onBrowseProperties?: () => void;
};

const botIcon = 'https://resaleexpert.in/assets/png/RE-C-KQu9TZ.png';

const formatPrice = (price?: string | number) => {
  const value = Number(price || 0);
  if (!value) return String(price || 'On Request');
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2).replace(/\.00$/, '')}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(2).replace(/\.00$/, '')}L`;
  return `₹${value.toLocaleString('en-IN')}`;
};

const FloatingChat = ({ properties = [], onOpenProperty, onBrowseProperties }: FloatingChatProps) => {
  const scrollRef = useRef<ScrollView>(null);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      text: 'Hi, I am ResaleExpert AI. Tell me your budget, locality, or BHK requirement and I will suggest verified resale options.',
    },
  ]);

  const featuredProperties = useMemo(() => {
    return properties
      .slice()
      .sort((a, b) => Number(b.aiScore || b.ai_score || 0) - Number(a.aiScore || a.ai_score || 0))
      .slice(0, 3);
  }, [properties]);

  const buildReply = (query: string) => {
    const lower = query.toLowerCase();
    const budgetMatch = lower.match(/(\d+)\s*(l|lac|lakh|cr|crore)?/);
    const budget = budgetMatch
      ? Number(budgetMatch[1]) * (budgetMatch[2]?.startsWith('cr') ? 10000000 : 100000)
      : 0;

    const matches = properties.filter((property) => {
      const text = [
        property.title,
        property.location,
        property.config,
        property.propertyType,
        property.code,
      ].filter(Boolean).join(' ').toLowerCase();
      const price = Number(String(property.price || '').replace(/[^\d.]/g, ''));
      const budgetOk = !budget || !price || price <= budget;
      return budgetOk && lower.split(/\s+/).some((word) => word.length > 2 && text.includes(word));
    }).slice(0, 3);

    if (lower.includes('sell') || lower.includes('valuation') || lower.includes('post')) {
      return 'For selling, keep ready: society NOC, latest electricity bill, property tax receipt, index-2/sale deed, and clear ownership chain. I can help you post the property and estimate market range based on locality and area.';
    }

    if (lower.includes('loan') || lower.includes('emi')) {
      return 'For resale homes, banks usually fund around 75-90% depending on profile, property age, and document clarity. Stamp duty, registration, legal fees, and society transfer charges should be planned separately.';
    }

    if (matches.length) {
      const list = matches.map((item, index) => `${index + 1}. ${item.title} in ${item.location} - ${formatPrice(item.price)} (${item.config || 'details available'})`).join('\n');
      return `I found matching verified options:\n${list}\nTap a suggested property card below to open full details.`;
    }

    if (featuredProperties.length) {
      const list = featuredProperties.map((item, index) => `${index + 1}. ${item.title} in ${item.location} - ${formatPrice(item.price)}`).join('\n');
      return `Here are the strongest current options by AI score:\n${list}\nYou can also search by "2BHK Rahatani under 80L" for tighter matches.`;
    }

    return 'Tell me locality, budget, and BHK, for example: "2BHK Rahatani under 80L". I will shortlist realistic resale options.';
  };

  const sendMessage = (preset?: string) => {
    const text = (preset || input).trim();
    if (!text) return;

    setMessages((prev) => [...prev, { role: 'user', text }, { role: 'assistant', text: buildReply(text) }]);
    setInput('');
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  };

  return (
    <>
      <View className="absolute bottom-10 right-6 z-[100]">
        <TouchableOpacity
          onPress={() => setOpen(true)}
          className="w-16 h-16 bg-white rounded-full items-center justify-center shadow-2xl border-[3px] border-[#E6761D] overflow-hidden"
          activeOpacity={0.9}
          accessibilityLabel="Open ResaleExpert AI chat"
        >
          <Image source={{ uri: botIcon }} className="w-11 h-11" resizeMode="contain" />
          <View className="absolute right-1 bottom-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" />
        </TouchableOpacity>
      </View>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View className="flex-1 bg-black/40 justify-end md:justify-center items-center p-3">
          <View className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-gray-100">
            <View className="bg-[#0b3856] px-4 py-3 flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-white items-center justify-center overflow-hidden">
                  <Image source={{ uri: botIcon }} className="w-8 h-8" resizeMode="contain" />
                </View>
                <View>
                  <Text className="text-white font-black text-base">ResaleExpert AI</Text>
                  <Text className="text-blue-100 text-xs">Verified property assistant</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setOpen(false)} className="p-2">
                <X size={18} color="white" />
              </TouchableOpacity>
            </View>

            <ScrollView ref={scrollRef} className="max-h-96 p-3 bg-slate-50" keyboardShouldPersistTaps="handled">
              {messages.map((message, index) => (
                <View key={`${message.role}-${index}`} className={`mb-2 ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <View className={`max-w-[86%] rounded-2xl px-3 py-2 ${message.role === 'user' ? 'bg-[#E6761D]' : 'bg-white border border-gray-100'}`}>
                    <Text className={`text-sm leading-5 ${message.role === 'user' ? 'text-white' : 'text-gray-700'}`}>{message.text}</Text>
                  </View>
                </View>
              ))}

              {featuredProperties.length > 0 && (
                <View className="mt-2 mb-3">
                  <Text className="text-xs font-black text-gray-500 uppercase mb-2">Quick suggestions</Text>
                  {featuredProperties.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => {
                        setOpen(false);
                        onOpenProperty?.(String(item.id));
                      }}
                      className="bg-white rounded-xl border border-gray-100 p-3 mb-2 flex-row items-center gap-3"
                    >
                      <View className="w-9 h-9 rounded-xl bg-orange-50 items-center justify-center">
                        <Home size={16} color="#E6761D" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm font-bold text-[#0b3856]" numberOfLines={1}>{item.title}</Text>
                        <Text className="text-xs text-gray-500" numberOfLines={1}>{item.location} • {formatPrice(item.price)}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </ScrollView>

            <View className="p-3 border-t border-gray-100 bg-white">
              <View className="flex-row flex-wrap gap-2 mb-3">
                {['2BHK Rahatani under 80L', 'EMI help', 'Sell property valuation'].map((item) => (
                  <TouchableOpacity key={item} onPress={() => sendMessage(item)} className="bg-slate-100 rounded-full px-3 py-1.5 flex-row items-center gap-1">
                    {item.includes('EMI') ? <Bot size={12} color="#0b3856" /> : <Search size={12} color="#0b3856" />}
                    <Text className="text-xs font-semibold text-[#0b3856]">{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View className="flex-row items-center gap-2">
                <View className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1">
                  <TextInput
                    value={input}
                    onChangeText={setInput}
                    placeholder="Ask about budget, locality, EMI..."
                    placeholderTextColor="#94A3B8"
                    className="text-sm text-gray-900 h-10"
                    onSubmitEditing={() => sendMessage()}
                  />
                </View>
                <TouchableOpacity onPress={() => sendMessage()} className="w-11 h-11 rounded-xl bg-[#E6761D] items-center justify-center">
                  <Send size={17} color="white" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={() => {
                  setOpen(false);
                  onBrowseProperties?.();
                }}
                className="mt-2 flex-row items-center justify-center gap-2 py-2"
              >
                <MessageCircle size={14} color="#0b3856" />
                <Text className="text-[#0b3856] text-xs font-bold">Browse all verified properties</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default FloatingChat;
