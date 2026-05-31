import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Modal,
  FlatList,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  Switch,
} from 'react-native';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import LinearGradient from 'react-native-linear-gradient';
import Footer from '../components/RealEstate/Footer';
import { propertyService } from '../services/api';
import {
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  Clock,
  Camera,
  Plus,
  Trash2,
  CheckCircle2,
  CircleCheckBig,
  FileText,
  X,
  ChevronDown,
  Mail,
  Phone,
  User,
  MessageCircle,
  ChevronRight,
  Shield,
  BadgeCheck,
  Headphones,
  ArrowLeft,
  Home,
  Sparkles,
  Globe,
  Rocket,
  Award,
} from 'lucide-react-native';

// ---------- Type Definitions ----------
type Owner = {
  title: string;
  fullName: string;
  email: string;
  phone: string;
  whatsapp: string;
  sameAsPhone: boolean;
};

type Property = {
  listingFor: string;
  propertyType: string;
  subtype: string;
  bedrooms: string;
  bathrooms: string;
  balconies: string;
  furnishing: string;
  facing: string;
  parkingType: string;
  parkingQty: string;
  unitType: string;
  wing: string;
  unitNo: string;
  totalFloors: string;
  floor: string;
  status: string;
  propertyAge: string;
  availability: string;
};

type Location = {
  society: string;
  location: string;
  city: string;
  landmark: string;
  pincode: string;
  fullAddress: string;
};

type Pricing = {
  carpetArea: string;
  builtupArea: string;
  price: string;
  rentExpected: string;
  deposit: string;
  maintenance: string;
  fixedPrice: boolean;
  negotiable: boolean;
};

type Timeline = {
  purchaseYear: string;
  purchaseMonth: string;
  possessionYear: string;
  possessionMonth: string;
  sellingRights: string;
  urgency: string;
};

type LegalDetails = {
  ownershipStatus: string;
  loanStatus: string;
  documentReady: boolean;
  interestedInSupport: boolean;
};

type NearbyPlace = {
  id: string;
  name: string;
  distance: string;
  unit: string;
  type: string;
};

type PickedImage = {
  uri: string;
  uploadValue?: string;
};

// ---------- Dropdown Options ----------
const TITLE_OPTIONS = ['Mr', 'Ms', 'Mrs', 'Dr'];
const LISTING_FOR = ['Sell', 'Rent', 'Sell or Rent'];
const PROPERTY_TYPES = [
  'Apartment',
  'House',
  'Villa',
  'Commercial',
  'Plot',
  'Shop',
  'Office',
  'Farmhouse',
];
const SUBTYPES = [
  'Flat',
  'Penthouse',
  'Row House',
  'Twin Bungalow',
  'Duplex',
  'Studio',
];
const BEDROOMS = ['1', '2', '3', '4', '5+'];
const BATHROOMS = ['1', '2', '3', '4', '5+'];
const BALCONIES = ['0', '1', '2', '3', '4+'];
const FURNISHING = ['Unfurnished', 'Semi-Furnished', 'Fully Furnished'];
const FACING = [
  'East',
  'West',
  'North',
  'South',
  'North-East',
  'North-West',
  'South-East',
  'South-West',
];
const PARKING_TYPES = ['Covered', 'Open', 'Basement', 'None'];
const PARKING_QTY = ['0', '1', '2', '3', '4+'];
const UNIT_TYPES = [
  '1BHK',
  '1.5BHK',
  '2BHK',
  '2.5BHK',
  '3BHK',
  '3.5BHK',
  '4BHK',
  '5BHK+',
  'Studio',
  'N/A',
];
const STATUS = ['Ready to Move', 'Under Construction', 'Resale', 'New Booking'];
const PROPERTY_AGE = [
  'New',
  '0-1 Years',
  '1-5 Years',
  '5-10 Years',
  '10+ Years',
];
const AVAILABILITY = [
  'Immediately',
  'Within 15 Days',
  'Within 1 Month',
  'Within 3 Months',
];
const TOTAL_FLOORS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10+'];
const FLOORS = [
  'Ground',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  'Top',
];
const SOCIETIES = [
  'Godrej Infinity',
  'Lodha Bella Vita',
  'Kumar City',
  'Nyati Eden',
];
const LOCATIONS = [
  'Wakad',
  'Hinjewadi',
  'Pimple Saudagar',
  'Rahatani',
  'Ravet',
  'Tathawade',
  'Punawale',
  'Baner',
  'Kharadi',
];
const CITIES = [
  'Pune',
  'Pimpri-Chinchwad',
  'Mumbai',
  'Nashik',
  'Nagpur',
  'Thane',
];
const YEARS = ['2026', '2025', '2024', '2023', '2022', '2021', '2020'];
const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
const SELLING_RIGHTS = [
  'Self Owned',
  'Joint Owners',
  'Power of Attorney',
  'Builder Allotment',
  'Under Loan',
];
const URGENCY = [
  'Immediately',
  'Within 15 Days',
  'Within 1 Month',
  'Within 3 Months',
  'Just Exploring',
];
const OWNERSHIP_STATUS = [
  'Clear Title',
  'Joint Ownership',
  'Power of Attorney',
  'Builder Transfer',
  'Other',
];
const LOAN_STATUS = [
  'No Loan',
  'Loan Running',
  'Loan Closed',
  'Need Help Closing Loan',
];
const AMENITIES_LIST = [
  'Swimming Pool',
  'Gym',
  'Clubhouse',
  'CCTV',
  'Elevator',
  'Security',
  'Power Backup',
  'Parking',
  'Garden',
  'Children Play Area',
  'Visitor Parking',
  'Water Supply',
];
const FURNISHING_ITEMS_LIST = [
  'Sofa',
  'Bed',
  'Wardrobe',
  'AC',
  'Refrigerator',
  'Washing Machine',
  'TV',
  'Modular Kitchen',
  'Geyser',
  'Dining Table',
];
const PLACE_TYPES = [
  'School',
  'Hospital',
  'Mall',
  'Metro',
  'Airport',
  'Bus Stop',
  'Railway Station',
  'IT Park',
  'Market',
];

const BRAND_NAVY = '#0B3856';
const BRAND_ORANGE = '#E6761D';

type PostPropertyScreenProps = {
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onTabChange?: (tab: string) => void;
};

// ---------- Custom Dropdown (Modal) ----------
type DropdownProps = {
  label: string;
  value: string;
  options: string[];
  onSelect: (val: string) => void;
  placeholder?: string;
  required?: boolean;
  showLabel?: boolean;
};

const CustomDropdown: React.FC<DropdownProps> = ({
  label,
  value,
  options,
  onSelect,
  placeholder,
  required,
  showLabel = true,
}) => {
  const [visible, setVisible] = useState(false);
  const display = value || placeholder || 'Select';
  const active = visible || Boolean(value);

  return (
    <View className="mb-3">
      {showLabel && (
        <Text className="text-[11px] font-semibold uppercase tracking-wide text-gray-600 mb-1">
          {label}
          {required && <Text className="text-red-400"> *</Text>}
        </Text>
      )}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setVisible(true)}
        className="flex-row justify-between items-center w-full rounded-xl border bg-white px-3 h-12 transition-all hover:border-orange-300 hover:bg-orange-50/40"
        style={{
          borderColor: active ? BRAND_ORANGE : '#E5E7EB',
          backgroundColor: active ? '#FFF7ED' : 'white',
          shadowColor: active ? BRAND_ORANGE : '#000000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: active ? 0.12 : 0.02,
          shadowRadius: active ? 8 : 2,
          elevation: active ? 2 : 0,
        }}
      >
        <Text
          className={`text-sm ${value ? 'text-gray-800' : 'text-gray-400'}`}
        >
          {display}
        </Text>
        <ChevronDown size={14} color="#9CA3AF" />
      </TouchableOpacity>
      <Modal visible={visible} transparent animationType="fade">
        <View className="flex-1 justify-center bg-black/50 px-4">
          <View className="bg-white rounded-xl max-h-96">
            <View className="flex-row justify-between items-center p-3 border-b border-gray-200">
              <Text className="font-bold text-gray-800">{label}</Text>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setVisible(false)}
              >
                <X size={18} color="#666" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={options}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => {
                    onSelect(item);
                    setVisible(false);
                  }}
                  className="p-3 border-b border-gray-100"
                >
                  <Text
                    className={`text-sm ${
                      value === item
                        ? 'text-orange-500 font-bold'
                        : 'text-gray-700'
                    }`}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ---------- Step Indicator ----------
type StepIndicatorProps = { currentStep: number };
const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  const steps = [
    { number: 1, label: 'You' },
    { number: 2, label: 'Property' },
  ];
  return (
    <View className="flex-row items-center mt-4">
      {steps.map((step, idx) => {
        const isActive = step.number === currentStep;
        const isDone = step.number < currentStep;
        return (
          <React.Fragment key={step.number}>
            <View className="flex-row items-center gap-1">
              <View
                className="w-5 h-5 rounded-full items-center justify-center"
                style={{
                  backgroundColor: isActive
                    ? BRAND_ORANGE
                    : isDone
                    ? BRAND_ORANGE
                    : '#F3F4F6',
                }}
              >
                <Text
                  className="text-[10px] font-black"
                  style={{ color: isActive || isDone ? 'white' : '#9CA3AF' }}
                >
                  {step.number}
                </Text>
              </View>
              <Text
                className="text-[10px] font-semibold"
                style={{
                  color: isActive
                    ? BRAND_ORANGE
                    : isDone
                    ? BRAND_ORANGE
                    : '#9CA3AF',
                }}
              >
                {step.label}
              </Text>
            </View>
            {idx < steps.length - 1 && (
              <View
                className="flex-1 h-px mx-1"
                style={{
                  backgroundColor: isDone ? BRAND_ORANGE + '66' : '#E5E7EB',
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
};

// ---------- Section Header ----------
const SectionHeader: React.FC<{
  icon: React.ReactNode;
  title: string;
  number: number;
}> = ({ icon, title, number }) => (
  <View className="flex-row items-center gap-2 mb-3">
    <View
      className="w-5 h-5 rounded-md items-center justify-center"
      style={{ backgroundColor: BRAND_NAVY }}
    >
      <Text className="text-[10px] font-black text-white">{number}</Text>
    </View>
    {icon}
    <Text className="text-[11px] font-black uppercase tracking-widest text-gray-500">
      {title}
    </Text>
    <View className="flex-1 h-px" style={{ backgroundColor: '#E5E7EB' }} />
  </View>
);

const PropertySectionHeader: React.FC<{
  icon: React.ReactNode;
  title: string;
}> = ({ icon, title }) => (
  <View className="flex-row items-center gap-2 mb-4 mt-1">
    <View
      className="w-1 h-4 rounded-full"
      style={{ backgroundColor: BRAND_ORANGE }}
    />
    {icon}
    <Text className="text-[11px] font-black uppercase tracking-wider text-gray-700">
      {title}
    </Text>
    <LinearGradient
      colors={['#FED7AA', '#FFFFFF00']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={{ flex: 1, height: 1 }}
    />
  </View>
);

// ---------- Form Card wrapper ----------
const FormCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <View
    className="bg-white rounded-2xl mb-4 overflow-hidden transition-all hover:border-orange-200 hover:shadow-lg"
    style={{
      borderWidth: 1.5,
      borderColor: '#FED7AA',
      shadowColor: BRAND_ORANGE,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.11,
      shadowRadius: 22,
      elevation: 5,
    }}
  >
    {children}
  </View>
);

const InfoPill: React.FC<{ icon?: React.ReactNode; label: string }> = ({
  icon,
  label,
}) => (
  <View className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 bg-gray-50">
    {icon}
    <Text className="text-[11px] font-semibold text-gray-600">{label}</Text>
  </View>
);

const InfoStat: React.FC<{ value: string; label: string }> = ({
  value,
  label,
}) => (
  <View className="flex-1 min-w-[45%]">
    <Text className="text-lg font-black" style={{ color: BRAND_ORANGE }}>
      {value}
    </Text>
    <Text className="text-[10px] font-bold uppercase tracking-wide text-gray-500">
      {label}
    </Text>
  </View>
);

const TextField: React.FC<{
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'phone-pad' | 'email-address';
  required?: boolean;
  multiline?: boolean;
}> = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  required,
  multiline,
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <View className="mb-3">
      <Text className="text-[11px] font-semibold uppercase tracking-wide text-gray-600 mb-1">
        {label}
        {required && <Text className="text-red-400"> *</Text>}
      </Text>
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        textAlignVertical={multiline ? 'top' : 'center'}
        className={`w-full px-3 rounded-xl text-sm border bg-white ${
          multiline ? 'py-2 min-h-[82px]' : 'h-12'
        } transition-all hover:border-orange-300 hover:bg-orange-50/30`}
        style={{
          borderColor: focused || value ? BRAND_ORANGE : '#E5E7EB',
          backgroundColor: focused ? '#FFF7ED' : 'white',
          shadowColor: focused ? BRAND_ORANGE : '#000000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: focused ? 0.12 : 0.02,
          shadowRadius: focused ? 8 : 2,
          elevation: focused ? 2 : 0,
        }}
        placeholderTextColor="#9CA3AF"
      />
    </View>
  );
};

const renderChoiceChips = (
  items: string[],
  selected: string[],
  onToggle: (item: string) => void,
) => (
  <View className="flex-row flex-wrap gap-2">
    {items.map(item => {
      const active = selected.includes(item);
      return (
        <TouchableOpacity
          activeOpacity={0.85}
          key={item}
          onPress={() => onToggle(item)}
          className="px-3 py-1.5 rounded-full border transition-all hover:border-orange-300 hover:bg-orange-50"
          style={{
            backgroundColor: active ? BRAND_ORANGE : 'white',
            borderColor: active ? BRAND_ORANGE : '#E5E7EB',
          }}
        >
          <Text
            className="text-xs font-medium"
            style={{ color: active ? 'white' : '#374151' }}
          >
            {item}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

// ---------- Main Component ----------
const PostPropertyScreen = ({
  onScroll,
  onTabChange,
}: PostPropertyScreenProps) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [focusedOwnerField, setFocusedOwnerField] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // ── Step 1: Owner / Seller details (fully editable) ──
  const [owner, setOwner] = useState<Owner>({
    title: 'Mr',
    fullName: '',
    email: '',
    phone: '',
    whatsapp: '',
    sameAsPhone: false,
  });

  // ── Step 2: Property state ──
  const [property, setProperty] = useState<Property>({
    listingFor: '',
    propertyType: '',
    subtype: '',
    bedrooms: '',
    bathrooms: '',
    balconies: '',
    furnishing: '',
    facing: '',
    parkingType: '',
    parkingQty: '',
    unitType: '',
    wing: '',
    unitNo: '',
    totalFloors: '',
    floor: '',
    status: '',
    propertyAge: '',
    availability: '',
  });

  const [location, setLocation] = useState<Location>({
    society: '',
    location: '',
    city: '',
    landmark: '',
    pincode: '',
    fullAddress: '',
  });

  const [pricing, setPricing] = useState<Pricing>({
    carpetArea: '',
    builtupArea: '',
    price: '',
    rentExpected: '',
    deposit: '',
    maintenance: '',
    fixedPrice: true,
    negotiable: false,
  });

  const [timeline, setTimeline] = useState<Timeline>({
    purchaseYear: '',
    purchaseMonth: '',
    possessionYear: '',
    possessionMonth: '',
    sellingRights: '',
    urgency: '',
  });

  const [legalDetails, setLegalDetails] = useState<LegalDetails>({
    ownershipStatus: '',
    loanStatus: '',
    documentReady: false,
    interestedInSupport: true,
  });

  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedFurnishingItems, setSelectedFurnishingItems] = useState<
    string[]
  >([]);
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);
  const [newPlace, setNewPlace] = useState<Omit<NearbyPlace, 'id'>>({
    name: '',
    distance: '',
    unit: 'km',
    type: '',
  });
  const [description, setDescription] = useState('');

  // ── Photos & Docs ──
  const [ownershipDoc, setOwnershipDoc] = useState<PickedImage | null>(null);
  const [propertyPhotos, setPropertyPhotos] = useState<PickedImage[]>([]);

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const ownerFieldStyle = (field: string, disabled = false) => {
    const active = focusedOwnerField === field || disabled === false;
    const focused = focusedOwnerField === field;
    return {
      opacity: disabled ? 0.6 : 1,
      borderColor: focused ? BRAND_ORANGE : active ? '#FED7AA' : '#E5E7EB',
      backgroundColor: focused ? '#FFF7ED' : 'white',
      shadowColor: focused ? BRAND_ORANGE : '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: focused ? 0.14 : 0.03,
      shadowRadius: focused ? 9 : 2,
      elevation: focused ? 3 : 0,
    };
  };

  // ── Helpers ──
  const toggleChip = (
    item: string,
    selected: string[],
    setSelected: React.Dispatch<React.SetStateAction<string[]>>,
  ) => {
    if (selected.includes(item)) {
      setSelected(selected.filter(i => i !== item));
    } else {
      setSelected([...selected, item]);
    }
  };

  const addNearbyPlace = () => {
    if (!newPlace.name.trim() || !newPlace.distance.trim() || !newPlace.type) {
      Alert.alert('Incomplete', 'Please fill Place Name, Distance, and Type');
      return;
    }
    setNearbyPlaces([
      ...nearbyPlaces,
      { ...newPlace, id: Date.now().toString() },
    ]);
    setNewPlace({ name: '', distance: '', unit: 'km', type: '' });
  };

  const removeNearbyPlace = (id: string) => {
    setNearbyPlaces(nearbyPlaces.filter(p => p.id !== id));
  };

  const pickOwnershipDocument = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
        includeBase64: true,
        quality: 0.8,
        maxWidth: 1600,
        maxHeight: 1600,
      });
      if (result.didCancel) return;
      if (result.errorCode) {
        Alert.alert('Error', result.errorMessage || 'Failed to pick document');
        return;
      }
      const asset = result.assets?.[0];
      if (asset?.uri) {
        setOwnershipDoc({
          uri: asset.uri,
          uploadValue: asset.base64
            ? `data:${asset.type || 'image/jpeg'};base64,${asset.base64}`
            : asset.uri,
        });
      }
    } catch {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const pickPropertyPhotos = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 10,
        includeBase64: true,
        quality: 0.8,
        maxWidth: 1600,
        maxHeight: 1600,
      });
      if (result.assets) {
        const photos = result.assets
          .filter(asset => asset.uri)
          .map(asset => ({
            uri: asset.uri!,
            uploadValue: asset.base64
              ? `data:${asset.type || 'image/jpeg'};base64,${asset.base64}`
              : asset.uri!,
          }));
        setPropertyPhotos([...propertyPhotos, ...photos].slice(0, 10));
      }
    } catch {
      Alert.alert('Error', 'Failed to pick images');
    }
  };

  const removePhoto = (uri: string) =>
    setPropertyPhotos(propertyPhotos.filter(p => p.uri !== uri));

  const formatPrice = (text: string) => {
    const raw = text.replace(/,/g, '');
    const num = parseInt(raw, 10);
    if (isNaN(num)) return '';
    return num.toLocaleString('en-IN');
  };

  const toNumber = (value: string) => {
    const num = Number(String(value || '').replace(/[^0-9.]/g, ''));
    return Number.isFinite(num) ? num : 0;
  };

  const uploadableImages = (images: PickedImage[]) =>
    images
      .map(image => image.uploadValue || image.uri)
      .filter(
        image => image.startsWith('http') || image.startsWith('data:image'),
      );

  const buildPropertyPayload = () => {
    const normalizedNearbyPlaces = [
      ...nearbyPlaces,
      ...(newPlace.name.trim() && newPlace.distance.trim() && newPlace.type
        ? [{ ...newPlace, id: Date.now().toString() }]
        : []),
    ];
    const selectedLocation = [
      location.society,
      location.location,
      location.city,
    ]
      .filter(Boolean)
      .join(', ');
    const listingType =
      property.listingFor === 'Rent'
        ? 'for Rent'
        : property.listingFor === 'Sell or Rent'
        ? 'for Sale or Rent'
        : 'for Sale';
    const titleParts = [
      property.unitType || (property.bedrooms ? `${property.bedrooms}BHK` : ''),
      property.propertyType || 'Property',
      listingType,
      location.location ? `in ${location.location}` : '',
    ].filter(Boolean);
    const timelineText = [
      timeline.purchaseYear || timeline.purchaseMonth
        ? `Purchase Date: ${timeline.purchaseMonth || ''} ${
            timeline.purchaseYear || ''
          }`.trim()
        : '',
      timeline.possessionYear || timeline.possessionMonth
        ? `Possession Date: ${timeline.possessionMonth || ''} ${
            timeline.possessionYear || ''
          }`.trim()
        : '',
      timeline.sellingRights ? `Selling Rights: ${timeline.sellingRights}` : '',
      timeline.urgency ? `Timeline: ${timeline.urgency}` : '',
    ].filter(Boolean);
    const nearbyText = normalizedNearbyPlaces.map(
      place =>
        `${place.name} - ${place.distance}${place.unit}${
          place.type ? ` (${place.type})` : ''
        }`,
    );
    const supportText = [
      legalDetails.ownershipStatus
        ? `Ownership Status: ${legalDetails.ownershipStatus}`
        : '',
      legalDetails.loanStatus ? `Loan Status: ${legalDetails.loanStatus}` : '',
      `Documents Ready: ${legalDetails.documentReady ? 'Yes' : 'No'}`,
      `Need Expert Support: ${legalDetails.interestedInSupport ? 'Yes' : 'No'}`,
    ].filter(Boolean);
    const ownershipDocValue = ownershipDoc?.uploadValue || ownershipDoc?.uri;
    const descriptionParts = [
      description,
      location.fullAddress ? `Full Address: ${location.fullAddress}` : '',
      location.landmark ? `Landmark: ${location.landmark}` : '',
      location.pincode ? `Pincode: ${location.pincode}` : '',
      property.wing || property.unitNo
        ? `Wing/Unit: ${property.wing || '-'} / ${property.unitNo || '-'}`
        : '',
      pricing.builtupArea ? `Builtup Area: ${pricing.builtupArea} sq.ft` : '',
      pricing.rentExpected
        ? `Expected Rent: Rs. ${pricing.rentExpected}/month`
        : '',
      pricing.deposit ? `Deposit: Rs. ${pricing.deposit}` : '',
      pricing.maintenance ? `Maintenance: Rs. ${pricing.maintenance}` : '',
      ...timelineText,
      ...supportText,
      nearbyText.length ? `Nearby Places: ${nearbyText.join(', ')}` : '',
      ownershipDocValue ? 'Ownership document uploaded' : '',
    ].filter(Boolean);
    const images = uploadableImages(propertyPhotos);
    const priceValue =
      property.listingFor === 'Rent'
        ? toNumber(pricing.rentExpected)
        : toNumber(pricing.price);
    const carpetAreaValue = toNumber(pricing.carpetArea);

    return {
      title: titleParts.join(' '),
      propertyType: property.propertyType,
      unitType: property.unitType || property.bedrooms,
      subtype: property.subtype,
      city: location.city || 'Pune',
      location:
        selectedLocation || location.location || location.city || 'Pune',
      price: priceValue,
      carpetArea: carpetAreaValue,
      perSqFt:
        priceValue && carpetAreaValue
          ? Math.round(priceValue / carpetAreaValue)
          : 0,
      bedrooms: toNumber(property.bedrooms),
      bathrooms: toNumber(property.bathrooms),
      parking: toNumber(property.parkingQty),
      parkingType: property.parkingType,
      floor: property.floor,
      totalFloors: property.totalFloors,
      furnishing: property.furnishing,
      builtYear: property.propertyAge,
      balcony: toNumber(property.balconies),
      facing: property.facing,
      negotiable: pricing.negotiable,
      status: 'Under Review',
      possessionDate: [timeline.possessionMonth, timeline.possessionYear]
        .filter(Boolean)
        .join(' '),
      description: descriptionParts.join('\n'),
      imageUrl: images[0] || undefined,
      images,
      amenities: selectedAmenities,
      furnishingItems: selectedFurnishingItems,
      fullName: `${owner.title}. ${owner.fullName}`.trim(),
      email: owner.email,
      phone: owner.phone,
      whatsapp: owner.whatsapp || owner.phone,
      executiveName: owner.fullName,
      executiveRole: 'Property Owner',
      ownerDetails: owner,
      locationDetails: location,
      pricingDetails: pricing,
      timelineDetails: timeline,
      legalDetails,
      nearbyPlaces: normalizedNearbyPlaces,
      nearby_places: normalizedNearbyPlaces,
      ownershipDocument: ownershipDocValue || '',
    };
  };

  // ── Step 1 validation & advance ──
  const handleStep1Next = () => {
    if (!owner.fullName.trim()) {
      Alert.alert('Required', 'Please enter your full name');
      return;
    }
    if (!owner.email.trim() || !owner.email.includes('@')) {
      Alert.alert('Required', 'Please enter a valid email');
      return;
    }
    if (!owner.phone.trim() || owner.phone.length < 6) {
      Alert.alert('Required', 'Please enter a valid phone number');
      return;
    }
    setCurrentStep(2);
  };

  // ── Step 2 validation & submit ──
  const handleStep2Next = () => {
    if (!property.listingFor) {
      Alert.alert('Validation', 'Please select Sell/Rent intent');
      return;
    }
    if (!property.propertyType) {
      Alert.alert('Validation', 'Please select Property Type');
      return;
    }
    if (!location.location) {
      Alert.alert('Validation', 'Please select Location');
      return;
    }
    if (!pricing.carpetArea) {
      Alert.alert('Validation', 'Please enter Carpet Area');
      return;
    }
    if (property.listingFor !== 'Rent' && !pricing.price) {
      Alert.alert('Validation', 'Please enter Expected Price');
      return;
    }
    if (property.listingFor !== 'Sell' && !pricing.rentExpected) {
      Alert.alert('Validation', 'Please enter Expected Rent');
      return;
    }
    handleSubmit();
  };

  // ── Final submit ──
  const handleSubmit = async () => {
    if (loading) return;
    const payload = buildPropertyPayload();
    setLoading(true);
    try {
      await propertyService.create(payload);
      setLoading(false);
      Alert.alert(
        'Property Submitted',
        'Your property is pending for verification. Our team will verify and list it soon.',
      );
      setSubmitted(true);
    } catch (error) {
      setLoading(false);
      console.error('[PostPropertyScreen] submit failed', error);
      Alert.alert(
        'Submission Failed',
        'Property admin me save nahi ho payi. Please server connection check karke dobara try karein.',
      );
    }
  };

  const scrollToOwnerForm = () => {
    setCurrentStep(1);
    requestAnimationFrame(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    });
  };

  // ─────────────────────────────────────────────────────────
  // ── RENDER HEADER (common across all steps) ──
  // ─────────────────────────────────────────────────────────
  const renderHero = () => (
    <FormCard>
      <View className="px-4 py-5">
        <View className="flex-row items-center self-start gap-2 px-3 py-1.5 rounded-full border border-slate-300 bg-slate-100 mb-4">
          <Sparkles size={13} color={BRAND_NAVY} />
          <Text
            className="text-[11px] font-black"
            style={{ color: BRAND_NAVY }}
          >
            Post Your Property - 100% Free
          </Text>
        </View>
        <Text className="text-3xl font-black text-gray-900 leading-tight">
          Sell or Rent Your{'\n'}
          <Text style={{ color: BRAND_ORANGE }}>Property Faster</Text>
        </Text>
        <Text className="text-[13px] text-gray-500 leading-5 mt-3">
          Connect with genuine buyers across Maharashtra. List in minutes with
          verification, legal support and expert help.
        </Text>
        <View className="flex-row flex-wrap gap-2 mt-4">
          {[
            'Legal documentation support',
            'Hassle-free transactions',
            'Direct buyer connect',
            'Verified badge',
            'Free expert help',
            '24/7 support',
          ].map(item => (
            <InfoPill
              key={item}
              icon={<CheckCircle2 size={11} color={BRAND_ORANGE} />}
              label={item}
            />
          ))}
        </View>
        <View className="flex-row flex-wrap gap-y-4 mt-5 pt-4 border-t border-gray-100">
          <InfoStat value="2.5L+" label="Active Buyers" />
          <InfoStat value="12L+" label="Monthly Views" />
          <InfoStat value="75K+" label="Listings" />
          <InfoStat value="18K+" label="Deals Closed" />
        </View>
      </View>
    </FormCard>
  );

  const renderProcess = () => (
    <FormCard>
      <View className="px-4 py-5">
        <View className="items-center mb-5">
          <Text
            className="text-[11px] font-black uppercase tracking-widest mb-2 px-3 py-1 rounded-full bg-slate-100"
            style={{ color: BRAND_NAVY }}
          >
            Simple Process
          </Text>
          <Text className="text-2xl font-black text-gray-900 text-center leading-8">
            Post Your Property in{' '}
            <Text style={{ color: BRAND_ORANGE }}>3 Steps</Text>
          </Text>
          <Text className="text-sm text-gray-500 mt-2 text-center leading-5">
            Fast, easy, and completely free - done in under 5 minutes.
          </Text>
        </View>
        {[
          {
            icon: <User size={24} color={BRAND_NAVY} />,
            step: '01',
            title: 'Owner Details',
            text: 'Share name, email and phone to start instantly.',
          },
          {
            icon: <Building2 size={24} color={BRAND_NAVY} />,
            step: '02',
            title: 'Property Info',
            text: 'Add location, area, pricing, amenities and nearby places.',
          },
          {
            icon: <Camera size={24} color={BRAND_NAVY} />,
            step: '03',
            title: 'Photos & Submit',
            text: 'Upload photos and documents, then submit for verification.',
          },
        ].map((item, idx) => (
          <View
            key={item.step}
            className={`flex-row items-start gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-4 ${
              idx < 2 ? 'mb-4' : ''
            }`}
          >
            <View className="w-14 h-14 rounded-2xl items-center justify-center bg-slate-100">
              {item.icon}
            </View>
            <View className="flex-1">
              <Text
                className="text-xs font-black uppercase tracking-widest"
                style={{ color: BRAND_NAVY }}
              >
                {item.step}
              </Text>
              <Text className="text-base font-bold text-gray-900 mt-1 leading-5">
                {item.title}
              </Text>
              <Text className="text-sm text-gray-500 mt-1 leading-5">
                {item.text}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </FormCard>
  );

  const renderWhyChooseUs = () => (
    <FormCard>
      <View className="px-4 py-5">
        <View className="items-center mb-5">
          <Text
            className="text-[11px] font-black uppercase tracking-widest mb-2 px-3 py-1 rounded-full bg-slate-100"
            style={{ color: BRAND_NAVY }}
          >
            Why Choose Us
          </Text>
          <Text className="text-2xl font-black text-gray-900 text-center leading-8">
            Everything You Need to{' '}
            <Text style={{ color: BRAND_ORANGE }}>Sell Faster</Text>
          </Text>
        </View>
        <View>
          {[
            {
              icon: <BadgeCheck size={22} color={BRAND_NAVY} />,
              title: 'Verified Listings',
              text: 'Trust badge for buyer confidence.',
            },
            {
              icon: <Rocket size={22} color={BRAND_NAVY} />,
              title: 'Instant Visibility',
              text: 'Reach genuine local buyers quickly.',
            },
            {
              icon: <Award size={22} color={BRAND_NAVY} />,
              title: '100% Free',
              text: 'Post at zero cost.',
            },
            {
              icon: <Headphones size={22} color={BRAND_NAVY} />,
              title: 'Expert Support',
              text: 'Guidance for docs, visits and deal flow.',
            },
          ].map((item, idx) => (
            <View
              key={item.title}
              className={`p-4 rounded-2xl border border-gray-100 bg-gray-50 ${
                idx < 3 ? 'mb-3' : ''
              }`}
            >
              <View className="w-12 h-12 rounded-2xl items-center justify-center bg-slate-100 mb-3">
                {item.icon}
              </View>
              <Text className="text-base font-bold text-gray-900">
                {item.title}
              </Text>
              <Text className="text-sm text-gray-500 leading-5 mt-1">
                {item.text}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </FormCard>
  );

  const renderReachSection = () => (
    <LinearGradient
      colors={[BRAND_NAVY, '#062B43']}
      className="rounded-2xl mb-4 overflow-hidden"
      style={{
        borderWidth: 1,
        borderColor: '#123F5E',
        shadowColor: BRAND_NAVY,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 18,
        elevation: 5,
      }}
    >
      <View className="px-4 py-8 items-center">
        <View className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 mb-4">
          <Globe size={12} color={BRAND_ORANGE} />
          <Text className="text-white text-[11px] font-bold uppercase tracking-wider">
            Maximum Reach
          </Text>
        </View>
        <Text className="text-3xl font-black text-white text-center leading-9">
          Over <Text style={{ color: BRAND_ORANGE }}>7 Million</Text>
          {'\n'}
          Monthly Visitors
        </Text>
        <Text className="text-blue-200 text-sm text-center leading-5 mt-3 mb-6">
          Your property gets maximum visibility across Maharashtra and beyond
        </Text>
        <TouchableOpacity
          onPress={scrollToOwnerForm}
          className="px-6 h-11 rounded-xl items-center justify-center mb-4"
          style={{ backgroundColor: BRAND_ORANGE }}
        >
          <Text className="text-white text-sm font-bold">
            Post Your Property Free
          </Text>
        </TouchableOpacity>
        <View className="flex-row items-center gap-2">
          <MapPin size={13} color={BRAND_ORANGE} />
          <Text className="text-blue-200 text-xs">
            Serving Maharashtra & Nearby Regions
          </Text>
        </View>
      </View>
    </LinearGradient>
  );

  const renderReadyCta = () => (
    <FormCard>
      <View className="px-4 py-8 items-center">
        <View className="w-14 h-14 rounded-2xl items-center justify-center bg-slate-100 mb-4">
          <Rocket size={26} color={BRAND_NAVY} />
        </View>
        <Text className="text-2xl font-black text-gray-900 text-center">
          Ready to Sell Your Property?
        </Text>
        <Text className="text-sm text-gray-500 text-center leading-5 mt-2 mb-6">
          Free, fast, and effective. Start your listing now.
        </Text>
        <TouchableOpacity
          onPress={scrollToOwnerForm}
          className="h-11 px-6 rounded-xl items-center justify-center flex-row gap-2"
          style={{ backgroundColor: BRAND_ORANGE }}
        >
          <Text className="text-white text-sm font-bold">
            Post Property for Free
          </Text>
          <ChevronRight size={15} color="white" />
        </TouchableOpacity>
      </View>
    </FormCard>
  );

  const renderFAQ = () => (
    <FormCard>
      <View className="px-4 py-4">
        <View className="items-center mb-4">
          <Text
            className="text-[10px] font-black uppercase tracking-widest mb-1"
            style={{ color: BRAND_NAVY }}
          >
            FAQ
          </Text>
          <Text className="text-lg font-black text-gray-900">
            Frequently Asked{' '}
            <Text style={{ color: BRAND_ORANGE }}>Questions</Text>
          </Text>
        </View>
        {[
          {
            question: 'Is it really free to post my property?',
            answer:
              'Yes. You can submit your property details, photos and documents without any listing charge.',
          },
          {
            question: 'How fast can I expect buyer enquiries?',
            answer:
              'After verification, your listing becomes visible to active buyers. Enquiries depend on location, price and photos.',
          },
          {
            question: 'Can I sell without a broker?',
            answer:
              'Yes. We help owners connect with genuine buyers while keeping the process transparent and guided.',
          },
          {
            question: 'What documents are required?',
            answer:
              'Basic ownership proof, property photos, society or tax documents and any loan/NOC details help us verify faster.',
          },
          {
            question: 'Can I edit my listing after posting?',
            answer:
              'Yes. The admin team can review and update property details, photos, pricing and status after submission.',
          },
        ].map((item, idx) => {
          const isOpen = openFaqIndex === idx;
          return (
            <TouchableOpacity
              key={item.question}
              activeOpacity={0.88}
              onPress={() => setOpenFaqIndex(isOpen ? null : idx)}
              className={`rounded-xl border px-3 py-3 ${idx < 4 ? 'mb-2' : ''}`}
              style={{
                borderColor: isOpen ? BRAND_ORANGE : '#F3F4F6',
                backgroundColor: isOpen ? '#FFF7ED' : 'white',
              }}
            >
              <View className="flex-row items-center justify-between">
                <Text className="flex-1 text-[13px] font-semibold text-gray-800 pr-3">
                  {item.question}
                </Text>
                <ChevronDown
                  size={15}
                  color={isOpen ? BRAND_ORANGE : '#9CA3AF'}
                  style={{
                    transform: [{ rotate: isOpen ? '180deg' : '0deg' }],
                  }}
                />
              </View>
              {isOpen && (
                <Text className="text-xs text-gray-500 leading-5 mt-3 pr-5">
                  {item.answer}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </FormCard>
  );

  const renderHeaderContent = () => (
    <View
      className="px-4 pt-4 pb-3"
      style={{ borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}
    >
      <View className="flex-row items-start justify-between">
        <View>
          <Text className="text-[14px] font-black text-gray-900 leading-tight">
            Start Your Free Listing
          </Text>
          <Text className="text-[11px] text-gray-500 mt-0.5">
            Enter your details to get started
          </Text>
        </View>
        <View
          className="px-2 py-1 rounded-lg"
          style={{ backgroundColor: '#EEF2F6' }}
        >
          <Text
            className="text-[9px] font-black uppercase tracking-widest"
            style={{ color: BRAND_NAVY }}
          >
            Free
          </Text>
        </View>
      </View>
      <StepIndicator currentStep={currentStep} />
    </View>
  );

  const renderHeader = () => <FormCard>{renderHeaderContent()}</FormCard>;

  // ─────────────────────────────────────────────────────────
  // ── STEP 1: YOUR DETAILS ──
  // ─────────────────────────────────────────────────────────
  const renderStep1 = () => (
    <FormCard>
      {renderHeaderContent()}
      <View className="px-4 py-4">
        <SectionHeader
          number={1}
          icon={<User size={12} color={BRAND_ORANGE} />}
          title="Your Details"
        />

        {/* Title + Full Name row */}
        <View className="flex-row gap-2 mb-1">
          {/* Title (compact) */}
          <View style={{ width: 80 }}>
            <Text className="text-[11px] font-bold uppercase tracking-wide text-gray-500 mb-1 leading-4">
              Title
            </Text>
            <CustomDropdown
              label="Title"
              value={owner.title}
              options={TITLE_OPTIONS}
              onSelect={v => setOwner({ ...owner, title: v })}
              showLabel={false}
            />
          </View>
          {/* Full Name */}
          <View className="flex-1">
            <Text className="text-[11px] font-bold uppercase tracking-wide text-gray-500 mb-1 leading-4">
              Full Name <Text className="text-orange-500">*</Text>
            </Text>
            <View
              className="flex-row items-center border rounded-xl bg-white h-12 px-3 mb-3"
              style={ownerFieldStyle('fullName')}
            >
              <User
                size={14}
                color={
                  focusedOwnerField === 'fullName' ? BRAND_ORANGE : '#9CA3AF'
                }
              />
              <TextInput
                placeholder="Your full name"
                value={owner.fullName}
                onChangeText={v => setOwner({ ...owner, fullName: v })}
                onFocus={() => setFocusedOwnerField('fullName')}
                onBlur={() => setFocusedOwnerField('')}
                className="flex-1 h-full text-sm ml-2 text-gray-800 py-0"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>
        </View>

        {/* Email */}
        <Text className="text-[11px] font-bold uppercase tracking-wide text-gray-500 mb-1 leading-4">
          Email <Text className="text-orange-500">*</Text>
        </Text>
        <View
          className="flex-row items-center border rounded-xl bg-white h-12 px-3 mb-3"
          style={ownerFieldStyle('email')}
        >
          <Mail
            size={14}
            color={focusedOwnerField === 'email' ? BRAND_ORANGE : '#9CA3AF'}
          />
          <TextInput
            placeholder="you@example.com"
            value={owner.email}
            onChangeText={v => setOwner({ ...owner, email: v })}
            onFocus={() => setFocusedOwnerField('email')}
            onBlur={() => setFocusedOwnerField('')}
            keyboardType="email-address"
            autoCapitalize="none"
            className="flex-1 h-full text-sm ml-2 text-gray-800 py-0"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Phone */}
        <Text className="text-[11px] font-bold uppercase tracking-wide text-gray-500 mb-1 leading-4">
          Phone <Text className="text-orange-500">*</Text>
        </Text>
        <View
          className="flex-row items-center border rounded-xl bg-white h-12 px-3 mb-3"
          style={ownerFieldStyle('phone')}
        >
          <Phone
            size={14}
            color={focusedOwnerField === 'phone' ? BRAND_ORANGE : '#9CA3AF'}
          />
          <TextInput
            placeholder="+91 XXXXX XXXXX"
            value={owner.phone}
            onFocus={() => setFocusedOwnerField('phone')}
            onBlur={() => setFocusedOwnerField('')}
            onChangeText={v => {
              setOwner({
                ...owner,
                phone: v,
                whatsapp: owner.sameAsPhone ? v : owner.whatsapp,
              });
            }}
            keyboardType="phone-pad"
            className="flex-1 h-full text-sm ml-2 text-gray-800 py-0"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* WhatsApp */}
        <View className="flex-row items-center justify-between mb-1">
          <View className="flex-row items-center gap-1">
            <MessageCircle size={11} color="#22C55E" />
            <Text className="text-[11px] font-bold uppercase tracking-wide text-gray-500 leading-4">
              WhatsApp
            </Text>
          </View>
          <TouchableOpacity
            onPress={() =>
              setOwner({
                ...owner,
                sameAsPhone: !owner.sameAsPhone,
                whatsapp: !owner.sameAsPhone ? owner.phone : owner.whatsapp,
              })
            }
            className="flex-row items-center gap-1.5"
          >
            <View
              className="w-3 h-3 rounded border"
              style={{
                backgroundColor: owner.sameAsPhone ? BRAND_ORANGE : 'white',
                borderColor: owner.sameAsPhone ? BRAND_ORANGE : '#D1D5DB',
              }}
            />
            <Text className="text-[9px] text-gray-400">Same as phone</Text>
          </TouchableOpacity>
        </View>
        <View
          className="flex-row items-center border rounded-xl bg-white h-12 px-3 mb-3"
          style={ownerFieldStyle('whatsapp', owner.sameAsPhone)}
        >
          <MessageCircle
            size={14}
            color={focusedOwnerField === 'whatsapp' ? BRAND_ORANGE : '#22C55E'}
          />
          <TextInput
            placeholder="WhatsApp number"
            value={owner.sameAsPhone ? owner.phone : owner.whatsapp}
            onChangeText={v => setOwner({ ...owner, whatsapp: v })}
            onFocus={() => setFocusedOwnerField('whatsapp')}
            onBlur={() => setFocusedOwnerField('')}
            keyboardType="phone-pad"
            editable={!owner.sameAsPhone}
            className="flex-1 h-full text-sm ml-2 text-gray-800 py-0"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Next button */}
        <TouchableOpacity
          onPress={handleStep1Next}
          className="h-10 rounded-xl items-center justify-center flex-row gap-2 mt-2"
          style={{ backgroundColor: BRAND_ORANGE }}
        >
          <Plus size={13} color="white" />
          <Text className="text-[13px] font-bold text-white">
            Next — Add property details
          </Text>
        </TouchableOpacity>

        {/* Terms */}
        <View
          className="mt-3 px-3 py-2 rounded-xl"
          style={{
            backgroundColor: '#FFF7ED',
            borderWidth: 1,
            borderColor: '#FED7AA',
          }}
        >
          <Text className="text-[10px] text-gray-500 text-center">
            By continuing you agree to our{' '}
            <Text className="underline" style={{ color: BRAND_ORANGE }}>
              Terms
            </Text>
            {' & '}
            <Text className="underline" style={{ color: BRAND_ORANGE }}>
              Privacy Policy
            </Text>
          </Text>
        </View>

        {/* Trust badges */}
        <View className="flex-row items-center justify-center gap-5 mt-3">
          {[
            { icon: <Shield size={12} color={BRAND_NAVY} />, label: 'Secure' },
            {
              icon: <BadgeCheck size={12} color={BRAND_NAVY} />,
              label: 'Verified',
            },
            {
              icon: <Headphones size={12} color={BRAND_NAVY} />,
              label: '24/7 Support',
            },
          ].map(({ icon, label }) => (
            <View key={label} className="flex-row items-center gap-1.5">
              {icon}
              <Text className="text-[10px] font-medium text-gray-400">
                {label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </FormCard>
  );

  // ─────────────────────────────────────────────────────────
  // ── STEP 2: PROPERTY DETAILS ──
  // ─────────────────────────────────────────────────────────
  const renderStep2 = () => {
    if (submitted) {
      return (
        <>
          <FormCard>
            <View className="p-6 items-center">
              <View className="w-16 h-16 rounded-2xl bg-orange-50 items-center justify-center mb-4">
                <Clock size={30} color={BRAND_ORANGE} />
              </View>
              <Text className="text-2xl font-black text-gray-900 text-center">
                Pending for Verification
              </Text>
              <Text className="text-sm text-gray-500 text-center leading-5 mt-2">
                Your property details, photos and documents have been submitted.
                Our team will verify everything and contact you shortly.
              </Text>
              <View className="w-full rounded-xl bg-gray-50 border border-gray-100 p-4 mt-5">
                {[
                  {
                    label: 'Owner',
                    value: `${owner.title}. ${owner.fullName}`,
                  },
                  { label: 'Property', value: property.propertyType || '-' },
                  { label: 'Location', value: location.location || '-' },
                  {
                    label: 'Status',
                    value: 'Pending for verification',
                  },
                ].map(item => (
                  <View
                    key={item.label}
                    className="flex-row justify-between py-1.5"
                  >
                    <Text className="text-xs text-gray-500">{item.label}</Text>
                    <Text
                      className="text-xs font-bold text-gray-800"
                      numberOfLines={1}
                      style={{ maxWidth: '58%' }}
                    >
                      {item.value}
                    </Text>
                  </View>
                ))}
              </View>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => onTabChange?.('Home')}
                className="w-full h-12 rounded-xl items-center justify-center flex-row gap-2 mt-5"
                style={{
                  backgroundColor: BRAND_ORANGE,
                  shadowColor: BRAND_ORANGE,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.22,
                  shadowRadius: 10,
                  elevation: 3,
                }}
              >
                <Home size={16} color="white" />
                <Text className="text-sm font-black text-white">
                  Back to Home
                </Text>
              </TouchableOpacity>
            </View>
          </FormCard>
        </>
      );
    }

    return (
      <>
        {/* Owner Summary Card */}
        <LinearGradient
          colors={['#FFF7ED', '#FFFBEB']}
          className="rounded-2xl mb-4 overflow-hidden"
          style={{
            borderWidth: 1,
            borderColor: '#FED7AA',
            shadowColor: BRAND_ORANGE,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 14,
            elevation: 3,
          }}
        >
          <View className="p-4">
            <View className="flex-row items-center gap-3">
              <LinearGradient
                colors={[BRAND_ORANGE, '#CC6A1A']}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text className="text-sm font-bold text-white">
                  {owner.fullName.charAt(0).toUpperCase() || '?'}
                </Text>
              </LinearGradient>
              <View className="flex-1">
                <View className="flex-row justify-between items-center gap-2">
                  <Text
                    className="flex-1 text-sm font-black text-gray-900"
                    numberOfLines={1}
                  >
                    {owner.title}. {owner.fullName}
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => setCurrentStep(1)}
                    className="flex-row items-center gap-1 px-3 py-1.5 rounded-lg border border-orange-200 bg-white"
                  >
                    <FileText size={10} color={BRAND_ORANGE} />
                    <Text className="text-[10px] font-bold text-orange-600">
                      Edit
                    </Text>
                  </TouchableOpacity>
                </View>
                <View className="gap-1 mt-2">
                  <View className="flex-row items-center gap-1.5">
                    <Mail size={10} color="#9CA3AF" />
                    <Text className="flex-1 text-[11px] text-gray-600">
                      {owner.email}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-1.5">
                    <Phone size={10} color="#9CA3AF" />
                    <Text className="text-[11px] text-gray-500">
                      {owner.phone}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Property Details */}
        <FormCard>
          <View className="p-4">
            <PropertySectionHeader
              icon={<Building2 size={12} color={BRAND_ORANGE} />}
              title="Property Details"
            />
            <View className="flex-row flex-wrap gap-3">
              <View className="flex-1" style={{ minWidth: '45%' }}>
                <CustomDropdown
                  label="Listing For"
                  value={property.listingFor}
                  options={LISTING_FOR}
                  onSelect={v => setProperty({ ...property, listingFor: v })}
                  placeholder="Sell / Rent"
                  required
                />
                <CustomDropdown
                  label="Property Type"
                  value={property.propertyType}
                  options={PROPERTY_TYPES}
                  onSelect={v => setProperty({ ...property, propertyType: v })}
                  placeholder="Select type"
                  required
                />
                <CustomDropdown
                  label="Bedrooms"
                  value={property.bedrooms}
                  options={BEDROOMS}
                  onSelect={v => setProperty({ ...property, bedrooms: v })}
                  placeholder="BHK"
                />
                <CustomDropdown
                  label="Balconies"
                  value={property.balconies}
                  options={BALCONIES}
                  onSelect={v => setProperty({ ...property, balconies: v })}
                  placeholder="Balconies"
                />
                <CustomDropdown
                  label="Furnishing"
                  value={property.furnishing}
                  options={FURNISHING}
                  onSelect={v => setProperty({ ...property, furnishing: v })}
                  placeholder="Furnishing"
                />
                <CustomDropdown
                  label="Parking Type"
                  value={property.parkingType}
                  options={PARKING_TYPES}
                  onSelect={v => setProperty({ ...property, parkingType: v })}
                  placeholder="Parking type"
                />
                <CustomDropdown
                  label="Unit Type"
                  value={property.unitType}
                  options={UNIT_TYPES}
                  onSelect={v => setProperty({ ...property, unitType: v })}
                  placeholder="Unit type"
                />
                <TextField
                  label="Wing"
                  placeholder="A / B"
                  value={property.wing}
                  onChangeText={v => setProperty({ ...property, wing: v })}
                />
                <CustomDropdown
                  label="Total Floors"
                  value={property.totalFloors}
                  options={TOTAL_FLOORS}
                  onSelect={v => setProperty({ ...property, totalFloors: v })}
                  placeholder="Total"
                />
                <CustomDropdown
                  label="Availability"
                  value={property.availability}
                  options={AVAILABILITY}
                  onSelect={v => setProperty({ ...property, availability: v })}
                  placeholder="Available from"
                />
              </View>
              <View className="flex-1" style={{ minWidth: '45%' }}>
                <CustomDropdown
                  label="Subtype"
                  value={property.subtype}
                  options={SUBTYPES}
                  onSelect={v => setProperty({ ...property, subtype: v })}
                  placeholder="Select subtype"
                  required
                />
                <CustomDropdown
                  label="Bathrooms"
                  value={property.bathrooms}
                  options={BATHROOMS}
                  onSelect={v => setProperty({ ...property, bathrooms: v })}
                  placeholder="Baths"
                />
                <CustomDropdown
                  label="Facing"
                  value={property.facing}
                  options={FACING}
                  onSelect={v => setProperty({ ...property, facing: v })}
                  placeholder="Facing"
                />
                <CustomDropdown
                  label="Parking Qty"
                  value={property.parkingQty}
                  options={PARKING_QTY}
                  onSelect={v => setProperty({ ...property, parkingQty: v })}
                  placeholder="Quantity"
                />
                <CustomDropdown
                  label="Status"
                  value={property.status}
                  options={STATUS}
                  onSelect={v => setProperty({ ...property, status: v })}
                  placeholder="Status"
                />
                <TextField
                  label="Unit No."
                  placeholder="304"
                  value={property.unitNo}
                  onChangeText={v => setProperty({ ...property, unitNo: v })}
                />
                <CustomDropdown
                  label="Floor"
                  value={property.floor}
                  options={FLOORS}
                  onSelect={v => setProperty({ ...property, floor: v })}
                  placeholder="Floor"
                />
                <CustomDropdown
                  label="Property Age"
                  value={property.propertyAge}
                  options={PROPERTY_AGE}
                  onSelect={v => setProperty({ ...property, propertyAge: v })}
                  placeholder="Age"
                />
              </View>
            </View>
          </View>
        </FormCard>

        {/* Location */}
        <FormCard>
          <View className="p-4">
            <PropertySectionHeader
              icon={<MapPin size={12} color={BRAND_ORANGE} />}
              title="Location"
            />
            <View className="flex-row flex-wrap gap-3">
              <View className="flex-1" style={{ minWidth: '45%' }}>
                <CustomDropdown
                  label="Society"
                  value={location.society}
                  options={SOCIETIES}
                  onSelect={v => setLocation({ ...location, society: v })}
                  placeholder="Society name"
                  required
                />
                <CustomDropdown
                  label="City"
                  value={location.city}
                  options={CITIES}
                  onSelect={v => setLocation({ ...location, city: v })}
                  placeholder="City"
                  required
                />
                <TextField
                  label="Landmark"
                  placeholder="Near mall / school / road"
                  value={location.landmark}
                  onChangeText={v => setLocation({ ...location, landmark: v })}
                />
              </View>
              <View className="flex-1" style={{ minWidth: '45%' }}>
                <CustomDropdown
                  label="Location"
                  value={location.location}
                  options={LOCATIONS}
                  onSelect={v => setLocation({ ...location, location: v })}
                  placeholder="Location"
                  required
                />
                <TextField
                  label="Pincode"
                  placeholder="411057"
                  value={location.pincode}
                  onChangeText={v => setLocation({ ...location, pincode: v })}
                  keyboardType="numeric"
                />
              </View>
            </View>
            <TextField
              label="Full Address"
              placeholder="Flat no, building, street, locality"
              value={location.fullAddress}
              onChangeText={v => setLocation({ ...location, fullAddress: v })}
              multiline
            />
          </View>
        </FormCard>

        {/* Area & Pricing */}
        <FormCard>
          <View className="p-4">
            <PropertySectionHeader
              icon={<DollarSign size={12} color={BRAND_ORANGE} />}
              title="Area & Pricing"
            />
            <View className="flex-row gap-3 mb-3">
              <View className="flex-1">
                <TextField
                  label="Carpet Area (sq.ft)"
                  placeholder="850"
                  value={pricing.carpetArea}
                  onChangeText={v => setPricing({ ...pricing, carpetArea: v })}
                  keyboardType="numeric"
                  required
                />
              </View>
              <View className="flex-1">
                <TextField
                  label="Builtup Area (sq.ft)"
                  placeholder="1050"
                  value={pricing.builtupArea}
                  onChangeText={v => setPricing({ ...pricing, builtupArea: v })}
                  keyboardType="numeric"
                />
              </View>
            </View>
            {property.listingFor !== 'Rent' && (
              <>
                <Text className="text-[11px] font-semibold uppercase tracking-wide text-gray-600 mb-1">
                  Expected Price (₹) <Text className="text-red-400">*</Text>
                </Text>
                <View className="p-3 rounded-xl border border-orange-100 bg-orange-50/40">
                  <Text className="text-xs font-bold text-gray-600 mb-2">
                    Amount (₹)
                  </Text>
                  <View className="flex-row items-center gap-2 mb-3">
                    <TextInput
                      value={pricing.price}
                      onChangeText={v =>
                        setPricing({ ...pricing, price: formatPrice(v) })
                      }
                      keyboardType="numeric"
                      placeholder="95,00,000"
                      placeholderTextColor="#9CA3AF"
                      className="border border-gray-200 px-3 h-11 rounded-lg text-sm flex-1 bg-white"
                    />
                    {pricing.price ? (
                      <View className="px-3 h-11 rounded-lg bg-green-50 border border-green-100 items-center justify-center">
                        <Text className="text-xs font-black text-green-700">
                          {(
                            parseInt(pricing.price.replace(/,/g, ''), 10) /
                            100000
                          ).toFixed(1)}
                          L
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  <View className="flex-row flex-wrap gap-2 mt-1">
                    {[
                      { label: 'Fixed Price', active: pricing.fixedPrice },
                      { label: 'Negotiable', active: pricing.negotiable },
                    ].map(option => (
                      <TouchableOpacity
                        key={option.label}
                        activeOpacity={0.85}
                        onPress={() =>
                          setPricing({
                            ...pricing,
                            fixedPrice: option.label === 'Fixed Price',
                            negotiable: option.label === 'Negotiable',
                          })
                        }
                        className="flex-row items-center gap-1.5 px-3 py-2 rounded-full border"
                        style={{
                          backgroundColor: option.active
                            ? BRAND_ORANGE
                            : 'white',
                          borderColor: option.active ? BRAND_ORANGE : '#E5E7EB',
                        }}
                      >
                        <CircleCheckBig
                          size={12}
                          color={option.active ? 'white' : '#9CA3AF'}
                        />
                        <Text
                          className="text-xs font-bold"
                          style={{
                            color: option.active ? 'white' : '#6B7280',
                          }}
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </>
            )}
            {property.listingFor !== 'Sell' && (
              <View className="flex-row flex-wrap gap-3 mt-3">
                <View className="flex-1" style={{ minWidth: '45%' }}>
                  <TextField
                    label="Expected Rent (₹/month)"
                    placeholder="35000"
                    value={pricing.rentExpected}
                    onChangeText={v =>
                      setPricing({ ...pricing, rentExpected: formatPrice(v) })
                    }
                    keyboardType="numeric"
                    required={property.listingFor !== 'Sell'}
                  />
                </View>
                <View className="flex-1" style={{ minWidth: '45%' }}>
                  <TextField
                    label="Deposit (₹)"
                    placeholder="100000"
                    value={pricing.deposit}
                    onChangeText={v =>
                      setPricing({ ...pricing, deposit: formatPrice(v) })
                    }
                    keyboardType="numeric"
                  />
                </View>
                <View className="flex-1" style={{ minWidth: '45%' }}>
                  <TextField
                    label="Maintenance (₹)"
                    placeholder="3500"
                    value={pricing.maintenance}
                    onChangeText={v =>
                      setPricing({ ...pricing, maintenance: formatPrice(v) })
                    }
                    keyboardType="numeric"
                  />
                </View>
              </View>
            )}
          </View>
        </FormCard>

        {/* Timeline & Rights */}
        <FormCard>
          <View className="p-4">
            <PropertySectionHeader
              icon={<Calendar size={12} color={BRAND_ORANGE} />}
              title="Timeline & Rights"
            />
            <View className="flex-row gap-2 mb-1">
              <View className="flex-1">
                <Text className="text-[11px] font-semibold uppercase tracking-wide text-gray-600 mb-1">
                  Purchase Year
                </Text>
                <CustomDropdown
                  label=""
                  value={timeline.purchaseYear}
                  options={YEARS}
                  onSelect={v => setTimeline({ ...timeline, purchaseYear: v })}
                  placeholder="Year"
                  showLabel={false}
                />
              </View>
              <View className="flex-1">
                <Text className="text-[11px] font-semibold uppercase tracking-wide text-gray-600 mb-1">
                  Purchase Month
                </Text>
                <CustomDropdown
                  label=""
                  value={timeline.purchaseMonth}
                  options={MONTHS}
                  onSelect={v => setTimeline({ ...timeline, purchaseMonth: v })}
                  placeholder="Month"
                  showLabel={false}
                />
              </View>
            </View>
            <View className="flex-row gap-2 mb-1">
              <View className="flex-1">
                <Text className="text-[11px] font-semibold uppercase tracking-wide text-gray-600 mb-1">
                  Possession Year
                </Text>
                <CustomDropdown
                  label=""
                  value={timeline.possessionYear}
                  options={YEARS}
                  onSelect={v =>
                    setTimeline({ ...timeline, possessionYear: v })
                  }
                  placeholder="Year"
                  showLabel={false}
                />
              </View>
              <View className="flex-1">
                <Text className="text-[11px] font-semibold uppercase tracking-wide text-gray-600 mb-1">
                  Possession Month
                </Text>
                <CustomDropdown
                  label=""
                  value={timeline.possessionMonth}
                  options={MONTHS}
                  onSelect={v =>
                    setTimeline({ ...timeline, possessionMonth: v })
                  }
                  placeholder="Month"
                  showLabel={false}
                />
              </View>
            </View>
            <CustomDropdown
              label="Selling Rights"
              value={timeline.sellingRights}
              options={SELLING_RIGHTS}
              onSelect={v => setTimeline({ ...timeline, sellingRights: v })}
              placeholder="Rights"
            />
            <CustomDropdown
              label="Selling Timeline"
              value={timeline.urgency}
              options={URGENCY}
              onSelect={v => setTimeline({ ...timeline, urgency: v })}
              placeholder="How soon?"
            />
          </View>
        </FormCard>

        {/* Legal & Support */}
        <FormCard>
          <View className="p-4">
            <PropertySectionHeader
              icon={<Shield size={12} color={BRAND_ORANGE} />}
              title="Legal & Support"
            />
            <View className="flex-row flex-wrap gap-3">
              <View className="flex-1" style={{ minWidth: '45%' }}>
                <CustomDropdown
                  label="Ownership Status"
                  value={legalDetails.ownershipStatus}
                  options={OWNERSHIP_STATUS}
                  onSelect={v =>
                    setLegalDetails({ ...legalDetails, ownershipStatus: v })
                  }
                  placeholder="Title status"
                />
              </View>
              <View className="flex-1" style={{ minWidth: '45%' }}>
                <CustomDropdown
                  label="Loan Status"
                  value={legalDetails.loanStatus}
                  options={LOAN_STATUS}
                  onSelect={v =>
                    setLegalDetails({ ...legalDetails, loanStatus: v })
                  }
                  placeholder="Loan details"
                />
              </View>
            </View>
            <View className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 mt-1">
              <View className="flex-row items-center justify-between py-1">
                <View className="flex-1 pr-3">
                  <Text className="text-xs font-bold text-gray-800">
                    Documents are ready
                  </Text>
                  <Text className="text-[11px] text-gray-500">
                    Sale deed, tax receipt, society NOC or ownership proof.
                  </Text>
                </View>
                <Switch
                  value={legalDetails.documentReady}
                  onValueChange={v =>
                    setLegalDetails({ ...legalDetails, documentReady: v })
                  }
                  trackColor={{ false: '#E5E7EB', true: '#FDBA74' }}
                  thumbColor={
                    legalDetails.documentReady ? BRAND_ORANGE : '#F9FAFB'
                  }
                />
              </View>
              <View className="flex-row items-center justify-between py-1 border-t border-gray-100 mt-2 pt-3">
                <View className="flex-1 pr-3">
                  <Text className="text-xs font-bold text-gray-800">
                    Need expert/legal support
                  </Text>
                  <Text className="text-[11px] text-gray-500">
                    Help with verification, loan assistance and agreement flow.
                  </Text>
                </View>
                <Switch
                  value={legalDetails.interestedInSupport}
                  onValueChange={v =>
                    setLegalDetails({ ...legalDetails, interestedInSupport: v })
                  }
                  trackColor={{ false: '#E5E7EB', true: '#FDBA74' }}
                  thumbColor={
                    legalDetails.interestedInSupport ? BRAND_ORANGE : '#F9FAFB'
                  }
                />
              </View>
            </View>
          </View>
        </FormCard>

        {/* Amenities & Furnishings */}
        <FormCard>
          <View className="p-4">
            <PropertySectionHeader
              icon={<CircleCheckBig size={12} color={BRAND_ORANGE} />}
              title="Amenities & Furnishings"
            />
            <Text className="text-[11px] font-semibold uppercase tracking-wide text-gray-600 mb-2">
              Amenities
            </Text>
            <View className="mb-4">
              {renderChoiceChips(AMENITIES_LIST, selectedAmenities, item =>
                toggleChip(item, selectedAmenities, setSelectedAmenities),
              )}
            </View>
            <Text className="text-[11px] font-semibold uppercase tracking-wide text-gray-600 mb-2">
              Furnishing Items
            </Text>
            {renderChoiceChips(
              FURNISHING_ITEMS_LIST,
              selectedFurnishingItems,
              item =>
                toggleChip(
                  item,
                  selectedFurnishingItems,
                  setSelectedFurnishingItems,
                ),
            )}
          </View>
        </FormCard>

        {/* Nearby Places */}
        <FormCard>
          <View className="p-4">
            <PropertySectionHeader
              icon={<MapPin size={12} color={BRAND_ORANGE} />}
              title="Nearby Places"
            />
            {nearbyPlaces.map(place => (
              <View
                key={place.id}
                className="flex-row items-center gap-3 mb-2 bg-gray-50 p-3 rounded-xl border border-gray-100"
              >
                <View className="flex-1">
                  <Text
                    className="text-sm font-bold text-gray-800"
                    numberOfLines={1}
                  >
                    {place.name}
                  </Text>
                  <Text className="text-xs text-gray-500 mt-0.5">
                    {place.distance}
                    {place.unit} • {place.type}
                  </Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => removeNearbyPlace(place.id)}
                >
                  <Trash2 size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}
            {nearbyPlaces.length === 0 && (
              <View className="border border-dashed border-gray-200 bg-gray-50 rounded-xl py-4 px-3 mb-3">
                <Text className="text-[11px] text-gray-400 text-center">
                  No nearby places added yet
                </Text>
              </View>
            )}
            <View className="mb-2">
              <TextInput
                placeholder="Place Name"
                value={newPlace.name}
                onChangeText={v => setNewPlace({ ...newPlace, name: v })}
                placeholderTextColor="#9CA3AF"
                className="w-full border border-gray-200 rounded-lg px-3 h-11 text-sm bg-white mb-2"
              />
              <View className="flex-row gap-2">
                <TextInput
                  placeholder="Distance"
                  value={newPlace.distance}
                  onChangeText={v => setNewPlace({ ...newPlace, distance: v })}
                  keyboardType="numeric"
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 border border-gray-200 rounded-lg px-3 h-11 text-sm bg-white"
                />
                <View style={{ width: 90 }}>
                  <CustomDropdown
                    label=""
                    value={newPlace.unit}
                    options={['km', 'm', 'min']}
                    onSelect={v => setNewPlace({ ...newPlace, unit: v })}
                    showLabel={false}
                  />
                </View>
              </View>
            </View>
            <View className="flex-row items-end gap-2">
              <View className="flex-1">
                <CustomDropdown
                  label="Place Type"
                  value={newPlace.type}
                  options={PLACE_TYPES}
                  onSelect={v => setNewPlace({ ...newPlace, type: v })}
                  placeholder="Type"
                />
              </View>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={addNearbyPlace}
                className="h-11 w-11 rounded-lg items-center justify-center mb-3"
                style={{ backgroundColor: '#16A34A' }}
              >
                <Plus size={16} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </FormCard>

        {/* Documents & Photos */}
        <FormCard>
          <View className="p-4">
            <PropertySectionHeader
              icon={<Camera size={12} color={BRAND_ORANGE} />}
              title="Documents & Photos"
            />
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={pickOwnershipDocument}
              className="border-2 border-dashed rounded-xl p-4 items-center mb-3 bg-gray-50"
              style={{
                borderColor: ownershipDoc ? BRAND_ORANGE : '#D1D5DB',
              }}
            >
              {ownershipDoc ? (
                <Image
                  source={{ uri: ownershipDoc.uri }}
                  style={{ width: 82, height: 82, borderRadius: 10 }}
                />
              ) : (
                <>
                  <FileText size={24} color="#9CA3AF" />
                  <Text className="text-xs font-bold text-gray-600 mt-2">
                    Upload ownership document
                  </Text>
                  <Text className="text-[10px] text-gray-400 mt-0.5">
                    JPG / PNG document photo
                  </Text>
                </>
              )}
            </TouchableOpacity>
            {ownershipDoc && (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setOwnershipDoc(null)}
                className="flex-row items-center gap-1 self-center mb-3"
              >
                <X size={12} color="#EF4444" />
                <Text className="text-xs text-red-500">Remove document</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={pickPropertyPhotos}
              className="border-2 border-dashed rounded-xl p-4 items-center mb-3 bg-gray-50"
              style={{ borderColor: '#D1D5DB' }}
            >
              <Camera size={24} color="#9CA3AF" />
              <Text className="text-xs font-bold text-gray-600 mt-2">
                Add property photos
              </Text>
              <Text className="text-[10px] text-gray-400 mt-0.5">
                Up to 10 photos
              </Text>
            </TouchableOpacity>
            {propertyPhotos.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2">
                  {propertyPhotos.map((photo, idx) => (
                    <View
                      key={`${photo.uri}-${idx}`}
                      style={{ position: 'relative' }}
                    >
                      <Image
                        source={{ uri: photo.uri }}
                        style={{ width: 82, height: 82, borderRadius: 10 }}
                      />
                      <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => removePhoto(photo.uri)}
                        style={{
                          position: 'absolute',
                          top: -6,
                          right: -6,
                          backgroundColor: '#EF4444',
                          borderRadius: 12,
                          padding: 4,
                        }}
                      >
                        <X size={10} color="white" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </ScrollView>
            )}
          </View>
        </FormCard>

        {/* Description */}
        <FormCard>
          <View className="p-4">
            <PropertySectionHeader
              icon={<FileText size={12} color={BRAND_ORANGE} />}
              title="Description"
            />
            <TextInput
              placeholder="Additional property details, features, highlights, nearby landmarks…"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
              textAlignVertical="top"
            />
          </View>
        </FormCard>

        {/* Navigation Buttons */}
        <View className="flex-row justify-between pt-2 mb-2">
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setCurrentStep(1)}
            className="h-12 px-5 rounded-xl border border-gray-200 bg-white justify-center flex-row items-center gap-2"
          >
            <ArrowLeft size={14} color="#6B7280" />
            <Text className="text-sm font-medium text-gray-600">Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleStep2Next}
            disabled={loading}
            className="h-12 px-5 rounded-xl items-center justify-center flex-row gap-2"
            style={{
              backgroundColor: loading ? '#FDB07A' : BRAND_ORANGE,
              shadowColor: BRAND_ORANGE,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.18,
              shadowRadius: 10,
              elevation: 4,
            }}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <CheckCircle2 size={14} color="white" />
                <Text className="text-sm font-bold text-white">Submit</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </>
    );
  };

  // ─────────────────────────────────────────────────────────
  // ── ROOT RENDER ──
  // ─────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#F8FAFC' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        className="flex-1 px-4 pt-4"
      >
        {currentStep === 1 ? (
          <>
            {renderStep1()}
            {renderHero()}
            {renderProcess()}
            {renderReachSection()}
            {renderWhyChooseUs()}
            {renderFAQ()}
            {renderReadyCta()}
          </>
        ) : (
          <>
            {renderHeader()}
            {currentStep === 2 && renderStep2()}
          </>
        )}
        <View className="-mx-4 mt-2">
          <Footer onTabChange={onTabChange} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default PostPropertyScreen;
