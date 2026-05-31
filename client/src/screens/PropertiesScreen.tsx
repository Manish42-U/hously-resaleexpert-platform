import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  useWindowDimensions,
  DimensionValue,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  Bot,
  ChevronDown,
  Grid3X3,
  List,
  Search,
  SlidersHorizontal,
  Target,
} from 'lucide-react-native';
import PropertyCard, {
  Property,
  PropertyFetchLoader,
} from '../components/RealEstate/PropertyCard';
import Footer from '../components/RealEstate/Footer';

interface PropertiesScreenProps {
  properties: Property[];
  loading: boolean;
  onScroll?: (event: any) => void;
  onViewDetails?: (id: string) => void;
  onTabChange?: (tab: string) => void;
  initialSearchQuery?: string;
  initialCategory?: string;
}

const PropertiesScreen = ({
  properties,
  loading,
  onScroll,
  onViewDetails,
  onTabChange,
  initialSearchQuery = '',
  initialCategory = 'All',
}: PropertiesScreenProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [propertyMode, setPropertyMode] = useState('Buy');
  const [category, setCategory] = useState(initialCategory || 'All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState('All');
  const [maxBudget, setMaxBudget] = useState('All');
  const [sortBy, setSortBy] = useState('Recommended');
  const [showRecommendation, setShowRecommendation] = useState(true);
  const propertiesPerPage = 12;
  const scrollViewRef = useRef<ScrollView>(null);
  const { width } = useWindowDimensions();

  const filterChipContent = { gap: 8, paddingBottom: 12 };

  useEffect(() => {
    setSearchQuery(initialSearchQuery);
    setCategory(initialCategory || 'All');
    setCurrentPage(1);
  }, [initialCategory, initialSearchQuery]);

  const categories = useMemo(() => {
    const uniqueCategories = properties
      .map(item => item.propertyType)
      .filter((item): item is string => Boolean(item));
    return ['All', ...Array.from(new Set(uniqueCategories))];
  }, [properties]);

  const configs = useMemo(() => {
    const uniqueConfigs = properties
      .map(item => item.config)
      .filter((item): item is string => Boolean(item) && item !== 'N/A');
    return ['All', ...Array.from(new Set(uniqueConfigs))];
  }, [properties]);

  const budgetOptions = [
    { label: 'All', value: 'All' },
    { label: 'Under 50L', value: '5000000' },
    { label: 'Under 75L', value: '7500000' },
    { label: 'Under 1Cr', value: '10000000' },
    { label: 'Under 2Cr', value: '20000000' },
  ];

  const parsePriceValue = (property: Property) => {
    if (property.rawPrice) return Number(property.rawPrice);
    const clean = String(property.price || '')
      .replace(/[₹,\s]/g, '')
      .toLowerCase();
    const numeric = Number(clean.replace(/[^\d.]/g, ''));
    if (!numeric) return 0;
    if (clean.includes('cr')) return numeric * 10000000;
    if (clean.includes('l')) return numeric * 100000;
    return numeric;
  };

  const filteredProperties = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = properties.filter(item => {
      const searchableText = [
        item.title,
        item.location,
        item.code,
        item.config,
        item.propertyType,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      const normalizedCategory = category.toLowerCase();

      if (category !== 'All' && !searchableText.includes(normalizedCategory)) {
        return false;
      }

      if (
        selectedConfig !== 'All' &&
        !searchableText.includes(selectedConfig.toLowerCase())
      ) {
        return false;
      }

      if (maxBudget !== 'All') {
        const price = parsePriceValue(item);
        if (price && price > Number(maxBudget)) return false;
      }

      if (!query) return true;

      return searchableText.includes(query);
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'Price Low')
        return parsePriceValue(a) - parsePriceValue(b);
      if (sortBy === 'Price High')
        return parsePriceValue(b) - parsePriceValue(a);
      if (sortBy === 'AI Score')
        return Number(b.aiScore || 0) - Number(a.aiScore || 0);
      return (
        Number(b.featured) - Number(a.featured) ||
        Number(b.aiScore || 0) - Number(a.aiScore || 0)
      );
    });
  }, [category, maxBudget, properties, searchQuery, selectedConfig, sortBy]);

  const totalPages = Math.ceil(filteredProperties.length / propertiesPerPage);
  const startIndex = (currentPage - 1) * propertiesPerPage;
  const paginatedProperties = filteredProperties.slice(
    startIndex,
    startIndex + propertiesPerPage,
  );
  const showingStart = filteredProperties.length ? startIndex + 1 : 0;
  const showingEnd = Math.min(
    startIndex + propertiesPerPage,
    filteredProperties.length,
  );
  const cardColumns =
    viewMode === 'list'
      ? 1
      : width >= 1100
      ? 4
      : width >= 760
      ? 3
      : width >= 520
      ? 2
      : 1;
  const cardGap = 18;
  const cardWidth: DimensionValue =
    cardColumns === 1
      ? '100%'
      : `${(100 - (cardColumns - 1) * 3) / cardColumns}%`;

  const resetFilters = () => {
    setSearchQuery('');
    setCategory('All');
    setSelectedConfig('All');
    setMaxBudget('All');
    setSortBy('Recommended');
    setCurrentPage(1);
  };

  const activeFilterCount = [
    searchQuery.trim() ? 'search' : '',
    category !== 'All' ? 'category' : '',
    selectedConfig !== 'All' ? 'config' : '',
    maxBudget !== 'All' ? 'budget' : '',
    sortBy !== 'Recommended' ? 'sort' : '',
  ].filter(Boolean).length;

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  const renderPageNumbers = () => {
    const pages = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Logic for sliding window pagination
      pages.push(1);

      if (currentPage > 3) {
        pages.push(-1); // represents ellipsis '...'
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }

      if (currentPage < totalPages - 2) {
        pages.push(-2); // represents ellipsis '...'
      }

      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }

    return pages.map((page, index) => {
      if (page < 0) {
        return (
          <View
            key={`ellipsis-${index}`}
            className="w-10 h-10 items-center justify-center"
          >
            <Text className="text-gray-400 font-bold">...</Text>
          </View>
        );
      }

      const isActive = currentPage === page;
      return (
        <TouchableOpacity
          key={`page-${page}`}
          onPress={() => handlePageChange(page)}
          className={`w-10 h-10 rounded-full items-center justify-center border ${
            isActive
              ? 'bg-blue-600 border-blue-600 shadow-md shadow-blue-200'
              : 'bg-white border-gray-200'
          }`}
        >
          <Text
            className={`font-bold text-sm ${
              isActive ? 'text-white' : 'text-gray-600'
            }`}
          >
            {page}
          </Text>
        </TouchableOpacity>
      );
    });
  };

  const handleCategoryChange = (nextCategory: string) => {
    setCategory(nextCategory);
    setCurrentPage(1);
  };

  const handleViewModeChange = (nextMode: 'grid' | 'list') => {
    setViewMode(nextMode);
    setCurrentPage(1);
  };

  return (
    <ScrollView
      ref={scrollViewRef}
      className="flex-1 bg-gray-50"
      showsVerticalScrollIndicator={false}
      onScroll={onScroll}
      scrollEventThrottle={16}
    >
      <LinearGradient
        colors={['#0b3856', '#0c3854']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="py-5"
      >
        <View className="px-4 sm:px-6">
          <View className="items-center">
            <Text className="text-3xl font-bold mb-3 text-white text-center">
              Explore Premium Properties
            </Text>
            <Text className="text-lg text-blue-100 mb-3 text-center max-w-2xl">
              Discover verified properties from trusted sellers across top
              locations
            </Text>

            <View className="flex-row justify-center gap-2 mb-2">
              {['Buy', 'Rent'].map(mode => {
                const isDisabled = mode === 'Rent';
                const isActive = propertyMode === mode;
                return (
                  <TouchableOpacity
                    key={mode}
                    disabled={isDisabled}
                    onPress={() => setPropertyMode(mode)}
                    className={`px-5 py-2 rounded-full ${
                      isActive ? 'bg-[#E6761D]' : 'bg-gray-100'
                    } ${isDisabled ? 'opacity-60' : ''}`}
                  >
                    <Text
                      className={
                        isActive
                          ? 'text-white font-medium'
                          : 'text-gray-700 font-medium'
                      }
                    >
                      {mode}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="max-w-full mb-4"
              contentContainerStyle={{ gap: 8, paddingHorizontal: 4 }}
            >
              {categories.map(item => {
                const isActive = category === item;
                return (
                  <TouchableOpacity
                    key={item}
                    onPress={() => handleCategoryChange(item)}
                    className={`px-4 py-1.5 rounded-full ${
                      isActive ? 'bg-white' : 'bg-white/20'
                    }`}
                  >
                    <Text
                      className={
                        isActive ? 'text-black text-sm' : 'text-white text-sm'
                      }
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View className="bg-white/10 rounded-2xl p-2 shadow-xl w-full max-w-4xl">
              <View className="gap-3">
                <View className="bg-white/30 border border-white/30 rounded-lg px-3 py-2">
                  <Text className="text-white">Pune</Text>
                </View>

                <View className="flex-row items-center bg-[#0b3856] border border-gray-200 rounded-xl h-11">
                  <Search size={16} color="white" style={{ marginLeft: 12 }} />
                  <TextInput
                    value={searchQuery}
                    onChangeText={text => {
                      setSearchQuery(text);
                      setCurrentPage(1);
                    }}
                    placeholder="Search properties by locality or area"
                    placeholderTextColor="rgba(255,255,255,0.7)"
                    className="flex-1 h-11 px-3 text-white text-sm"
                  />
                </View>

                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={() => {
                      setCurrentPage(1);
                      scrollViewRef.current?.scrollTo({
                        y: 310,
                        animated: true,
                      });
                    }}
                    className="flex-1 bg-[#E6761D] py-2 rounded-lg items-center"
                  >
                    <Text className="text-white text-base font-medium">
                      Search
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={resetFilters}
                    className="flex-1 bg-gray-200 py-2 rounded-lg items-center"
                  >
                    <Text className="text-gray-700 text-base font-medium">
                      Reset
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text className="text-xs text-white px-2 py-1">
                  Add up to 1 localities.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>

      <View className="px-4 sm:px-6 py-8">
        <View className="mb-6">
          <View className="flex-row flex-wrap items-start justify-between gap-3">
            <View className="min-w-[180px]">
              <Text className="text-xl font-bold text-[#0b3856]">
                All Properties ({filteredProperties.length})
              </Text>
              <Text className="text-gray-600 text-sm leading-snug">
                in Pune | Showing {showingStart}-{showingEnd} of{' '}
                {filteredProperties.length} results
              </Text>
            </View>

            <View className="flex-row items-center gap-2">
              <TouchableOpacity
                onPress={() => handleViewModeChange('grid')}
                className={`p-2 rounded-lg w-9 h-9 items-center justify-center ${
                  viewMode === 'grid' ? 'bg-blue-100' : 'bg-gray-100'
                }`}
              >
                <Grid3X3
                  size={16}
                  color={viewMode === 'grid' ? '#2563eb' : '#4b5563'}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleViewModeChange('list')}
                className={`p-2 rounded-lg w-9 h-9 items-center justify-center ${
                  viewMode === 'list' ? 'bg-blue-100' : 'bg-gray-100'
                }`}
              >
                <List
                  size={16}
                  color={viewMode === 'list' ? '#2563eb' : '#4b5563'}
                />
              </TouchableOpacity>
            </View>
          </View>

          {showRecommendation && (
            <View className="flex-row items-start gap-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg shadow-sm mt-4">
              <Bot size={16} color="#E6761D" />
              <View className="flex-1">
                <Text className="font-semibold text-gray-800 text-sm">
                  AI Recommendations
                </Text>
                <Text className="text-gray-700 text-sm">
                  Found{' '}
                  <Text className="font-semibold">
                    {filteredProperties.length}
                  </Text>{' '}
                  public properties. Pune show strong growth potential.
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowRecommendation(false)}>
                <Text className="text-gray-500 text-xl leading-5">x</Text>
              </TouchableOpacity>
            </View>
          )}

          <View className="flex-row items-center justify-end gap-3 mt-4">
            <View className="flex-row items-center gap-2">
              <Target size={16} color="#2563eb" />
              <Text className="text-sm text-gray-600">AI-Powered Search</Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowFilters(value => !value)}
              className="bg-[#E6761D] px-3 py-1.5 flex-row gap-1 items-center rounded-xl"
            >
              <SlidersHorizontal size={12} color="white" />
              <Text className="text-white text-xs font-semibold">
                Filters{activeFilterCount ? ` (${activeFilterCount})` : ''}
              </Text>
              <ChevronDown size={14} color="white" />
            </TouchableOpacity>
          </View>

          {showFilters && (
            <View className="bg-white rounded-2xl p-4 mt-4 border border-gray-100 shadow-sm">
              <Text className="text-[#0b3856] font-black text-base mb-3">
                Refine Properties
              </Text>

              <Text className="text-xs font-bold text-gray-500 uppercase mb-2">
                Configuration
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={filterChipContent}
              >
                {configs.map(item => (
                  <TouchableOpacity
                    key={item}
                    onPress={() => {
                      setSelectedConfig(item);
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-2 rounded-full border ${
                      selectedConfig === item
                        ? 'bg-[#0b3856] border-[#0b3856]'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold ${
                        selectedConfig === item ? 'text-white' : 'text-gray-600'
                      }`}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text className="text-xs font-bold text-gray-500 uppercase mb-2">
                Budget
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={filterChipContent}
              >
                {budgetOptions.map(item => (
                  <TouchableOpacity
                    key={item.value}
                    onPress={() => {
                      setMaxBudget(item.value);
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-2 rounded-full border ${
                      maxBudget === item.value
                        ? 'bg-[#0b3856] border-[#0b3856]'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold ${
                        maxBudget === item.value
                          ? 'text-white'
                          : 'text-gray-600'
                      }`}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text className="text-xs font-bold text-gray-500 uppercase mb-2">
                Sort By
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {['Recommended', 'AI Score', 'Price Low', 'Price High'].map(
                  item => (
                    <TouchableOpacity
                      key={item}
                      onPress={() => {
                        setSortBy(item);
                        setCurrentPage(1);
                      }}
                      className={`px-3 py-2 rounded-full border ${
                        sortBy === item
                          ? 'bg-[#E6761D] border-[#E6761D]'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <Text
                        className={`text-xs font-bold ${
                          sortBy === item ? 'text-white' : 'text-gray-600'
                        }`}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  ),
                )}
              </View>

              <TouchableOpacity
                onPress={resetFilters}
                className="self-start mt-4 px-4 py-2 rounded-xl bg-gray-100"
              >
                <Text className="text-gray-700 text-xs font-black">
                  Clear all filters
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {loading ? (
          <PropertyFetchLoader />
        ) : (
          <View
            className="flex-row flex-wrap justify-between"
            style={{ rowGap: cardGap }}
          >
            {paginatedProperties.length > 0 ? (
              paginatedProperties.map(item => (
                <View key={item.id} style={{ width: cardWidth }}>
                  <PropertyCard
                    item={item}
                    onViewDetails={onViewDetails}
                    variant={viewMode}
                  />
                </View>
              ))
            ) : (
              <View className="bg-white rounded-2xl p-8 border border-gray-100 items-center w-full">
                <Text className="text-gray-400 text-sm font-medium">
                  No properties found
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && !loading && (
          <View className="flex-row items-center justify-center gap-2 mt-8 py-4">
            <TouchableOpacity
              onPress={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-2 rounded-xl border ${
                currentPage === 1
                  ? 'bg-gray-100 border-gray-100 opacity-50'
                  : 'bg-white border-gray-200'
              }`}
            >
              <Text className="text-gray-600 text-xs font-black uppercase">
                Prev
              </Text>
            </TouchableOpacity>

            <View className="flex-row items-center gap-1.5">
              {renderPageNumbers()}
            </View>

            <TouchableOpacity
              onPress={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-2 rounded-xl border ${
                currentPage === totalPages
                  ? 'bg-gray-100 border-gray-100 opacity-50'
                  : 'bg-white border-gray-200'
              }`}
            >
              <Text className="text-gray-600 text-xs font-black uppercase">
                Next
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      <Footer onTabChange={onTabChange} />
    </ScrollView>
  );
};

export default PropertiesScreen;
