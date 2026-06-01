// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   ScrollView,
//   Image,
//   Dimensions,
// } from 'react-native';
// import LinearGradient from 'react-native-linear-gradient';
// import {
//   Home,
//   Building,
//   CreditCard,
//   FileText,
//   Shield,
//   TrendingUp,
//   Sparkles,
//   CircleCheckBig,
//   ChevronDown,
//   Star,
//   Crown,
//   Calculator,
//   Eye,
//   Search,
//   HandHeart,
//   Award,
//   Briefcase,
//   Users,
//   ThumbsUp,
// } from 'lucide-react-native';
// import Footer from '../components/RealEstate/Footer';

// const { width } = Dimensions.get('window');
// const isTablet = width >= 768;

// // ---------- TYPES & INTERFACES ----------
// interface SectionHeaderProps {
//   label: string;
//   title: string;
//   description: string;
// }

// interface CoreService {
//   title: string;
//   subtitle: string;
//   description: string;
//   icon: React.ReactNode;
//   bgColor: string;
//   features: string[];
//   steps: string[];
//   pricing: string;
//   duration: string;
//   success: string;
// }

// interface AdditionalService {
//   title: string;
//   description: string;
//   price: string;
//   icon: React.ReactNode;
//   gradient: string[];
// }

// interface Testimonial {
//   name: string;
//   location: string;
//   comment: string;
//   image: string;
// }

// interface FAQ {
//   q: string;
//   a: string;
// }

// // ---------- Helper: Section Header ----------
// const SectionHeader = ({ label, title, description }: SectionHeaderProps) => (
//   <View className="items-center mb-8">
//     <View className="flex-row items-center bg-orange-100 px-4 py-1.5 rounded-full mb-3">
//       <Sparkles size={14} color="#E6761D" />
//       <Text className="text-[#E6761D] text-xs font-bold ml-2 uppercase tracking-wider">
//         {label}
//       </Text>
//     </View>
//     <Text className="text-2xl font-black text-gray-900 text-center mb-2">{title}</Text>
//     <View className="w-20 h-1 bg-[#E6761D] rounded-full mb-3" />
//     <Text className="text-gray-500 text-sm text-center px-6">{description}</Text>
//   </View>
// );

// // ---------- Core Service Card (exact HTML copy) ----------
// const CoreServiceCard = ({ service }: { service: CoreService }) => {
//   return (
//     <View className="bg-white rounded-2xl shadow-md border border-orange-300 p-5 mb-6 transition-all hover:border-orange-500 hover:shadow-xl">
//       <View className="flex-row items-start mb-4">
//         <View style={{ backgroundColor: service.bgColor }} className="p-3 rounded-xl">
//           {service.icon}
//         </View>
//         <View className="ml-4 flex-1">
//           <Text className="text-lg font-bold text-gray-900 mb-0.5">{service.title}</Text>
//           <Text style={{ color: service.bgColor }} className="text-xs font-semibold mb-1">
//             {service.subtitle}
//           </Text>
//           <Text className="text-gray-600 text-xs leading-5">{service.description}</Text>
//         </View>
//       </View>

//       {/* Key Features & Process Steps - 2 columns */}
//       <View className="flex-row flex-wrap mb-4">
//         <View className="w-1/2 pr-2">
//           <Text className="font-semibold text-gray-900 text-xs mb-2">Key Features</Text>
//           {service.features.map((feature, idx) => (
//             <View key={idx} className="flex-row items-center mb-1.5">
//               <CircleCheckBig size={12} color={service.bgColor} />
//               <Text className="text-gray-600 text-[11px] ml-2 flex-1">{feature}</Text>
//             </View>
//           ))}
//         </View>
//         <View className="w-1/2 pl-2">
//           <Text className="font-semibold text-gray-900 text-xs mb-2">Process Steps</Text>
//           {service.steps.map((step, idx) => (
//             <View key={idx} className="flex-row items-center mb-1.5">
//               <View className="w-4 h-4 bg-blue-100 rounded-full items-center justify-center mr-2">
//                 <Text className="text-blue-700 text-[9px] font-bold">{idx + 1}</Text>
//               </View>
//               <Text className="text-gray-600 text-[11px] flex-1">{step}</Text>
//             </View>
//           ))}
//         </View>
//       </View>

//       {/* Pricing / Duration / Success badges */}
//       <View className="flex-row justify-between mb-5">
//         <View className="items-center flex-1 bg-blue-50/50 py-2 rounded-xl mr-2">
//           <Text style={{ color: service.bgColor }} className="text-[10px] font-black">
//             {service.pricing}
//           </Text>
//           <Text className="text-gray-400 text-[9px] uppercase">Pricing</Text>
//         </View>
//         <View className="items-center flex-1 bg-blue-50/50 py-2 rounded-xl mr-2">
//           <Text style={{ color: service.bgColor }} className="text-[10px] font-black">
//             {service.duration}
//           </Text>
//           <Text className="text-gray-400 text-[9px] uppercase">Duration</Text>
//         </View>
//         <View className="items-center flex-1 bg-blue-50/50 py-2 rounded-xl">
//           <Text style={{ color: service.bgColor }} className="text-[10px] font-black">
//             {service.success}
//           </Text>
//           <Text className="text-gray-400 text-[9px] uppercase">Success</Text>
//         </View>
//       </View>

//       <TouchableOpacity
//         style={{ backgroundColor: service.bgColor }}
//         className="py-3 rounded-xl items-center shadow-md"
//       >
//         <Text className="text-white font-bold text-sm">Get Started</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// // ---------- Additional Service Card (2 columns) ----------
// const AdditionalServiceCard = ({ item }: { item: AdditionalService }) => (
//   <View className="bg-white border border-orange-300 rounded-2xl p-4 shadow-sm mb-4 transition-all hover:border-orange-500 hover:shadow-lg w-[48%]">
//     <LinearGradient
//       colors={item.gradient}
//       className="w-12 h-12 rounded-xl items-center justify-center mx-auto mb-3"
//     >
//       {item.icon}
//     </LinearGradient>
//     <Text className="text-gray-900 font-bold text-sm text-center mb-1">{item.title}</Text>
//     <Text className="text-gray-500 text-[11px] text-center leading-4 mb-2">
//       {item.description}
//     </Text>
//     <Text className="text-blue-600 font-semibold text-[10px] text-center mb-3">
//       {item.price}
//     </Text>
//     <TouchableOpacity className="bg-gray-50 border border-orange-200 py-2 rounded-lg items-center">
//       <Text className="text-gray-700 text-[10px] font-medium">Learn More</Text>
//     </TouchableOpacity>
//   </View>
// );

// // ---------- Testimonial Card ----------
// const TestimonialCard = ({ item }: { item: Testimonial }) => (
//   <View className="bg-white rounded-2xl p-5 shadow-md mb-6 border border-orange-300 transition-all hover:border-orange-500 hover:shadow-xl">
//     <View className="flex-row gap-1 mb-3">
//       {[...Array(5)].map((_, i) => (
//         <Star key={i} size={14} color="#fbbf24" fill="#fbbf24" />
//       ))}
//     </View>
//     <Text className="text-gray-700 text-xs italic leading-5 mb-4">
//       "{item.comment}"
//     </Text>
//     <View className="flex-row items-center gap-3">
//       <Image source={{ uri: item.image }} className="w-10 h-10 rounded-full" />
//       <View>
//         <Text className="font-semibold text-gray-900 text-sm">{item.name}</Text>
//         <Text className="text-gray-500 text-[11px]">{item.location}</Text>
//       </View>
//     </View>
//   </View>
// );

// // ---------- FAQ Accordion ----------
// const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
//   const [open, setOpen] = useState(false);
//   return (
//     <View className="bg-white rounded-xl shadow-sm border border-orange-300 mb-3 transition-all hover:border-orange-500 hover:shadow-lg">
//       <TouchableOpacity
//         onPress={() => setOpen(!open)}
//         className="flex-row justify-between items-center p-4"
//       >
//         <Text className="text-gray-900 font-semibold text-sm flex-1 mr-4">
//           {question}
//         </Text>
//         <ChevronDown
//           size={18}
//           color="#6b7280"
//           style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}
//         />
//       </TouchableOpacity>
//       {open && (
//         <View className="px-4 pb-4">
//           <Text className="text-gray-600 text-xs leading-5">{answer}</Text>
//         </View>
//       )}
//     </View>
//   );
// };

// // ---------- MAIN SCREEN ----------
// const ServicesScreen = ({ onScroll }: { onScroll?: (event: any) => void }) => {
//   // Core Services Data (6 services exactly as HTML)
//   const coreServices = [
//     {
//       title: 'Property Buying',
//       subtitle: 'Find Your Dream Home',
//       description: 'Comprehensive assistance in finding and purchasing your perfect property with expert guidance and verified listings.',
//       icon: <Home size={20} color="white" />,
//       bgColor: '#3b82f6',
//       features: ['AI-powered property matching', 'Verified property listings', 'Expert property evaluation', 'Negotiation support', 'Legal documentation assistance', 'Post-purchase support'],
//       steps: ['Requirement Analysis', 'Property Shortlisting', 'Site Visits & Evaluation', 'Price Negotiation', 'Legal Verification', 'Registration & Handover'],
//       pricing: 'No Hidden Charges',
//       duration: '15-30 days',
//       success: '95%',
//     },
//     {
//       title: 'Property Selling',
//       subtitle: 'Maximize Your Returns',
//       description: 'End-to-end selling support with premium marketing, verified buyers, and transparent pricing to get the best value.',
//       icon: <Building size={20} color="white" />,
//       bgColor: '#22c55e',
//       features: ['Professional photography', 'Multi-channel marketing', 'Verified buyer database', 'Price optimization', 'Legal documentation', 'Hassle-free transaction'],
//       steps: ['Property Valuation', 'Documentation Review', 'Marketing & Promotion', 'Buyer Screening', 'Negotiation & Closure', 'Registration Support'],
//       pricing: '2% Commission',
//       duration: '30-60 days',
//       success: '92%',
//     },
//     {
//       title: 'Home Loan Assistance',
//       subtitle: 'Best Rates Guaranteed',
//       description: 'Get the best home loan deals with our banking partnerships and expert assistance throughout the process.',
//       icon: <CreditCard size={20} color="white" />,
//       bgColor: '#a855f7',
//       features: ['Multiple bank partnerships', 'Competitive interest rates', 'Quick approval', 'Documentation support', 'EMI tools', 'Processing assistance'],
//       steps: ['Eligibility Assessment', 'Bank Selection', 'Application Submission', 'Documentation Support', 'Loan Approval', 'Disbursement'],
//       pricing: 'Free Service',
//       duration: '3-15 days',
//       success: '99%',
//     },
//     {
//       title: 'Legal Services',
//       subtitle: 'Complete Documentation',
//       description: 'Expert legal services for all property transactions with experienced lawyers and transparent pricing.',
//       icon: <FileText size={20} color="white" />,
//       bgColor: '#f97316',
//       features: ['Title verification', 'Document preparation', 'Due diligence', 'Registration assistance', 'Dispute resolution', 'Compliance support'],
//       steps: ['Document Review', 'Title Verification', 'Legal Opinion', 'Agreement Drafting', 'Registration Support', 'Post-transaction Support'],
//       pricing: '₹10,000 onwards',
//       duration: '5-10 days',
//       success: '99%',
//     },
//     {
//       title: 'Property Management',
//       subtitle: 'Hassle-Free Rentals',
//       description: 'Complete property management services including tenant screening, rent collection, and maintenance.',
//       icon: <Shield size={20} color="white" />,
//       bgColor: '#6366f1',
//       features: ['Tenant screening', 'Rent collection', 'Maintenance', 'Legal compliance', 'Regular inspections', '24/7 support'],
//       steps: ['Property Assessment', 'Tenant Sourcing', 'Agreement Execution', 'Move-in Support', 'Ongoing Management', 'Renewal/Exit Support'],
//       pricing: '8% of rental income',
//       duration: 'Ongoing',
//       success: '96%',
//     },
//     {
//       title: 'Investment Advisory',
//       subtitle: 'Smart Investment Decisions',
//       description: 'Data-driven investment advice with market analysis and portfolio recommendations for maximum returns.',
//       icon: <TrendingUp size={20} color="white" />,
//       bgColor: '#ec4899',
//       features: ['Market trend analysis', 'Opportunity identification', 'ROI calculations', 'Risk assessment', 'Portfolio diversification', 'Exit strategy'],
//       steps: ['Investment Goal Analysis', 'Market Research', 'Opportunity Identification', 'Risk Assessment', 'Investment Execution', 'Performance Monitoring'],
//       pricing: '₹25,000 consultation',
//       duration: '30-45 days',
//       success: '85%',
//     },
//   ];

//   const additionalServices = [
//     { title: 'Property Valuation', description: 'Professional property valuation for accurate market pricing', price: 'Contact for Pricing', icon: <Calculator size={16} color="white" />, gradient: ['#3b82f6', '#2563eb'] },
//     { title: 'Virtual Property Tours', description: '360° virtual tours for remote property viewing', price: 'Contact for Pricing', icon: <Eye size={16} color="white" />, gradient: ['#a855f7', '#7e22ce'] },
//     { title: 'Market Research Reports', description: 'Detailed market analysis and trends for specific areas', price: 'Contact for Pricing', icon: <Search size={16} color="white" />, gradient: ['#22c55e', '#15803d'] },
//     { title: 'Interior Design Consultation', description: 'Expert interior design advice for home staging', price: 'Contact for Pricing', icon: <HandHeart size={16} color="white" />, gradient: ['#f97316', '#ea580c'] },
//   ];

//   const testimonials = [
//     { name: 'Rajesh Kumar', location: 'Property Buying • Mumbai', comment: 'ResaleExpert helped me find my dream home within my budget. Their AI matching is incredible!', image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200' },
//     { name: 'Priya Sharma', location: 'Property Selling • Pune', comment: 'Sold my property 20% above market rate with their expert marketing strategies.', image: 'https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg?auto=compress&cs=tinysrgb&w=200' },
//     { name: 'Amit Patel', location: 'Home Loan • Delhi', comment: 'Got the best interest rate and quick approval. Saved ₹5L in total interest!', image: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=200' },
//   ];

//   const faqs = [
//     { q: 'What makes ResaleExpert different from other platforms?', a: 'We offer 100% verified properties, AI-powered matching, and end-to-end support with transparent pricing. Our expert team ensures a smooth experience from search to registration.' },
//     { q: 'How do you verify properties?', a: 'Our verification process includes legal document checks, physical property inspection, ownership verification, and compliance checks to ensure authenticity and legal clarity.' },
//     { q: 'What are your fees for selling a property?', a: 'We charge a transparent 2% commission only after successful sale. No hidden fees, no upfront charges. You pay only when we deliver results.' },
//     { q: 'How long does it typically take to sell a property?', a: 'On average, properties sell within 30-60 days with our marketing strategies. Premium locations and well-priced properties often sell faster.' },
//     { q: 'Do you provide legal support?', a: 'Yes, we have experienced legal partners who assist with documentation, title verification, registration, and ensure all transactions are legally compliant.' },
//   ];

//   return (
//     <ScrollView
//       className="flex-1 bg-gray-50"
//       showsVerticalScrollIndicator={false}
//       onScroll={onScroll}
//       scrollEventThrottle={16}
//     >
//       {/* HERO SECTION */}
//       <LinearGradient colors={['#0b3856', '#0c3854']} className="py-16 px-6 items-center">
//         <Text className="text-white text-3xl font-black text-center mb-3">
//           Complete Real Estate Solutions
//         </Text>
//         <Text className="text-blue-100 text-base text-center leading-6 max-w-xs mb-8">
//           From property search to final registration, we provide end-to-end real estate services with expert guidance and transparent pricing
//         </Text>
//         <TouchableOpacity className="bg-[#E6761D] px-8 py-4 rounded-xl shadow-lg">
//           <Text className="text-white font-bold text-base">Get Free Consultation</Text>
//         </TouchableOpacity>
//       </LinearGradient>

//       {/* OUR CORE SERVICES */}
//       <View className="py-12 px-4">
//         <SectionHeader
//           label="What We Offer"
//           title="Our Core Services"
//           description="Comprehensive real estate solutions tailored to your specific needs"
//         />
//         {coreServices.map((service, idx) => (
//           <CoreServiceCard key={idx} service={service} />
//         ))}
//       </View>

//       {/* ADDITIONAL SERVICES (Value Added) */}
//       <View className="py-12 px-4 bg-white">
//         <SectionHeader
//           label="Value Added"
//           title="Additional Services"
//           description="Specialized services to enhance your property experience"
//         />
//         <View className="flex-row flex-wrap justify-between">
//           {additionalServices.map((item, idx) => (
//             <AdditionalServiceCard key={idx} item={item} />
//           ))}
//         </View>
//       </View>

//       {/* WHY CHOOSE RESALEEXPERT */}
//       <View className="py-12 px-4 relative overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50">
//         <SectionHeader
//           label="Why Trust Us"
//           title="Why Choose ResaleExpert?"
//           description="Excellence backed by experience and innovation"
//         />
//         <View className="flex-row flex-wrap justify-between">
//           {[
//             { value: '12+', label: 'Years of Excellence', desc: 'Decades of expertise in real estate', icon: <Award size={20} color="white" />, gradient: ['#3b82f6', '#2563eb'] },
//             { value: '100%', label: 'Verified Properties', desc: '100% legal and verified listings', icon: <Shield size={20} color="white" />, gradient: ['#22c55e', '#15803d'] },
//             { value: '50+', label: 'Expert Team', desc: 'Certified real estate professionals', icon: <Briefcase size={20} color="white" />, gradient: ['#f97316', '#ea580c'] },
//             { value: '98%', label: 'Customer Satisfaction', desc: 'Happy customers across India', icon: <Users size={20} color="white" />, gradient: ['#a855f7', '#7e22ce'] },
//           ].map((item, idx) => (
//             <View key={idx} className="w-full sm:w-[48%] lg:w-[23%] bg-white rounded-2xl p-5 shadow-sm border border-orange-300 mb-4 transition-all hover:border-orange-500 hover:shadow-lg">
//               <LinearGradient colors={item.gradient} className="w-14 h-14 rounded-xl items-center justify-center mb-3">
//                 {item.icon}
//               </LinearGradient>
//               <Text className="text-2xl font-black text-gray-800">{item.value}</Text>
//               <Text className="font-bold text-gray-900 text-sm mt-1">{item.label}</Text>
//               <Text className="text-gray-500 text-xs mt-1">{item.desc}</Text>
//             </View>
//           ))}
//         </View>
//         <View className="flex-row flex-wrap justify-center gap-4 mt-6 bg-white/60 rounded-2xl px-6 py-3 mx-auto">
//           <View className="flex-row items-center gap-2"><Shield size={16} color="#16a34a" /><Text className="text-gray-700 text-xs">100% Legal Compliance</Text></View>
//           <View className="flex-row items-center gap-2"><ThumbsUp size={16} color="#2563eb" /><Text className="text-gray-700 text-xs">No Hidden Charges</Text></View>
//           <View className="flex-row items-center gap-2"><Sparkles size={16} color="#ea580c" /><Text className="text-gray-700 text-xs">AI-Powered Matching</Text></View>
//         </View>
//       </View>

//       {/* OUR SERVICE PROCESS */}
//       <View className="py-12 px-4 bg-white">
//         <SectionHeader
//           label="How We Work"
//           title="Our Service Process"
//           description="Simple, transparent, and efficient workflow"
//         />
//         <View className="flex-row flex-wrap justify-between">
//           {[
//             { step: '1', title: 'Consultation', desc: 'Free consultation to understand your requirements' },
//             { step: '2', title: 'Planning', desc: 'Detailed planning and strategy development' },
//             { step: '3', title: 'Execution', desc: 'Professional execution with regular updates' },
//             { step: '4', title: 'Completion', desc: 'Successful completion with post-service support' },
//           ].map((item, idx) => (
//             <View key={idx} className="w-[48%] items-center text-center mb-6">
//               <LinearGradient colors={['#E6761D', '#F59E0B']} className="w-12 h-12 rounded-full items-center justify-center mb-3 shadow-md">
//                 <Text className="text-white font-bold text-base">{item.step}</Text>
//               </LinearGradient>
//               <Text className="font-bold text-gray-900 text-sm mb-1">{item.title}</Text>
//               <Text className="text-gray-500 text-xs text-center">{item.desc}</Text>
//             </View>
//           ))}
//         </View>
//       </View>

//       {/* TESTIMONIALS */}
//       <View className="py-12 px-4 bg-gray-50">
//         <SectionHeader
//           label="Testimonials"
//           title="Client Success Stories"
//           description="What our clients say about our services"
//         />
//         <View className="flex-row flex-wrap justify-between">
//           {testimonials.map((item, idx) => (
//             <View key={idx} className="w-full md:w-[48%] lg:w-[32%] mb-6">
//               <TestimonialCard item={item} />
//             </View>
//           ))}
//         </View>
//       </View>

//       {/* PRICING PLANS */}
//       <View className="py-12 px-4 bg-white">
//         <SectionHeader
//           label="Plans & Pricing"
//           title="Transparent Pricing"
//           description="Choose the plan that works best for you"
//         />
//         <View className="flex-row flex-wrap justify-between gap-4">
//           {/* Basic Plan */}
//           <View className="w-full md:w-[32%] bg-white border-2 border-orange-300 rounded-2xl p-6 items-center transition-all hover:border-orange-500 hover:shadow-xl">
//             <Text className="text-2xl font-bold text-gray-900 mb-1">Basic</Text>
//             <Text className="text-4xl font-black text-blue-600 mb-1">Free</Text>
//             <Text className="text-gray-500 text-xs mb-4">Perfect for first-time users</Text>
//             <View className="self-start mb-6">
//               {['Property search & listings', 'Basic property details', 'Contact property owners', 'Basic market insights'].map((feature, i) => (
//                 <View key={i} className="flex-row items-center mb-2">
//                   <CircleCheckBig size={12} color="#22c55e" />
//                   <Text className="text-gray-700 text-xs ml-2">{feature}</Text>
//                 </View>
//               ))}
//             </View>
//             <TouchableOpacity className="bg-gray-100 py-3 px-6 rounded-xl w-full">
//               <Text className="text-gray-700 font-semibold text-center text-sm">Get Started</Text>
//             </TouchableOpacity>
//           </View>

//           {/* Premium Plan (Highlighted) */}
//           <LinearGradient colors={['#2563eb', '#7e22ce']} className="w-full md:w-[32%] rounded-2xl p-6 items-center shadow-xl">
//             <View className="flex-row items-center mb-1">
//               <Crown size={18} color="#fbbf24" />
//               <Text className="text-white font-bold text-xl ml-1">Premium</Text>
//             </View>
//             <Text className="text-3xl font-black text-white mb-1">₹2,999</Text>
//             <Text className="text-blue-200 text-xs mb-4">Most popular choice</Text>
//             <View className="self-start mb-6">
//               {['Everything in Basic', 'Expert consultation', 'Site visit assistance', 'Legal verification', 'Loan assistance'].map((feature, i) => (
//                 <View key={i} className="flex-row items-center mb-2">
//                   <CircleCheckBig size={12} color="#bbf7d0" />
//                   <Text className="text-white text-xs ml-2">{feature}</Text>
//                 </View>
//               ))}
//             </View>
//             <TouchableOpacity className="bg-white py-3 px-6 rounded-xl w-full">
//               <Text className="text-blue-600 font-semibold text-center text-sm">Choose Premium</Text>
//             </TouchableOpacity>
//           </LinearGradient>

//           {/* Enterprise Plan */}
//           <View className="w-full md:w-[32%] bg-white border-2 border-orange-300 rounded-2xl p-6 items-center transition-all hover:border-orange-500 hover:shadow-xl">
//             <Text className="text-2xl font-bold text-gray-900 mb-1">Enterprise</Text>
//             <Text className="text-4xl font-black text-purple-600 mb-1">Custom</Text>
//             <Text className="text-gray-500 text-xs mb-4">For large portfolios</Text>
//             <View className="self-start mb-6">
//               {['Everything in Premium', 'Dedicated relationship manager', 'Priority support', 'Custom solutions'].map((feature, i) => (
//                 <View key={i} className="flex-row items-center mb-2">
//                   <CircleCheckBig size={12} color="#22c55e" />
//                   <Text className="text-gray-700 text-xs ml-2">{feature}</Text>
//                 </View>
//               ))}
//             </View>
//             <TouchableOpacity className="bg-purple-600 py-3 px-6 rounded-xl w-full">
//               <Text className="text-white font-semibold text-center text-sm">Contact Sales</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>

//       {/* FAQ SECTION */}
//       <View className="py-12 px-4 bg-gray-50">
//         <SectionHeader
//           label="FAQ"
//           title="Frequently Asked Questions"
//           description="Get answers to common questions about our services"
//         />
//         {faqs.map((faq, idx) => (
//           <FAQItem key={idx} question={faq.q} answer={faq.a} />
//         ))}
//       </View>

//       {/* FINAL CTA */}
//       <LinearGradient colors={['#0b3856', '#0c3854']} className="py-12 px-4 items-center">
//         <Text className="text-white text-2xl font-bold text-center mb-3">Ready to Get Started?</Text>
//         <Text className="text-blue-100 text-sm text-center mb-6 px-4">
//           Let our experts help you with your real estate needs. Get a free consultation today!
//         </Text>
//         <View className="flex-row flex-wrap justify-center gap-4">
//           <TouchableOpacity className="bg-[#E6761D] px-6 py-3 rounded-xl shadow-lg">
//             <Text className="text-white font-semibold text-sm">Get Free Consultation</Text>
//           </TouchableOpacity>
//           <TouchableOpacity className="bg-transparent border-2 border-white px-6 py-3 rounded-xl">
//             <Text className="text-white font-semibold text-sm">Call Now: +91 9637 00 9639</Text>
//           </TouchableOpacity>
//         </View>
//       </LinearGradient>

//       <Footer />
//     </ScrollView>
//   );
// };

// export default ServicesScreen;

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  Linking,
  Alert,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  Home,
  Building,
  CreditCard,
  FileText,
  Shield,
  TrendingUp,
  Sparkles,
  CircleCheckBig,
  ChevronDown,
  Star,
  Crown,
  Calculator,
  Eye,
  Search,
  HandHeart,
  Award,
  Briefcase,
  Users,
  ThumbsUp,
  Phone,
  MessageCircle,
  X,
  Clock,
} from 'lucide-react-native';
import Footer from '../components/RealEstate/Footer';
import { useCmsContent } from '../hooks/useCmsContent';
import { paymentService } from '../services/api';

const botIconUrl = 'https://resaleexpert.in/assets/png/RE-C-KQu9TZ.png';
const serviceIcons = [Home, Building, CreditCard, FileText, Shield, TrendingUp];
const additionalIcons = [Calculator, Eye, Search, HandHeart];
const servicesFallback = {
  heroTitle: 'Complete Real Estate Solutions',
  heroSubtitle:
    'From property search to final registration, we provide end-to-end real estate services with expert guidance and transparent pricing',
  ctaText: 'Get Free Consultation',
  coreServices: [],
  additionalServices: [],
  testimonials: [],
  faqs: [],
};

// ---------- TYPES & INTERFACES ----------
interface SectionHeaderProps {
  label: string;
  title: string;
  description: string;
}

interface CoreService {
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  bgColor: string;
  features: string[];
  steps: string[];
  pricing: string;
  duration: string;
  success: string;
}

interface AdditionalService {
  title: string;
  description: string;
  price: string;
  icon: React.ReactNode;
  gradient: string[];
}

interface Testimonial {
  name: string;
  location: string;
  comment: string;
  image?: string;
}

const parseMetricValue = (value: string | number) => {
  const raw = String(value ?? '0').trim();
  const match = raw.match(/^([\d,.]+)\s*([KkMm])?(\+|%)?(.*)$/);

  if (!match) {
    return { target: 0, compactSuffix: '', trailing: raw, decimals: 0 };
  }

  const numericText = match[1].replace(/,/g, '');
  return {
    target: Number(numericText) || 0,
    compactSuffix: (match[2] || '').toUpperCase(),
    trailing: `${match[3] || ''}${match[4] || ''}`,
    decimals: numericText.includes('.') ? numericText.split('.')[1].length : 0,
  };
};

const CountUpMetric = ({
  value,
  className,
  style,
}: {
  value: string | number;
  className?: string;
  style?: any;
}) => {
  const { target, compactSuffix, trailing, decimals } = useMemo(
    () => parseMetricValue(value),
    [value],
  );
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const duration = 1200;
    const startedAt = Date.now();
    setCurrent(0);

    const timer = setInterval(() => {
      const progress = Math.min((Date.now() - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(target * eased);

      if (progress >= 1) {
        clearInterval(timer);
        setCurrent(target);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [target]);

  const formatted =
    decimals > 0 ? current.toFixed(decimals) : Math.round(current).toString();

  return (
    <Text className={className} style={style}>
      {formatted}
      {compactSuffix}
      {trailing}
    </Text>
  );
};

// ---------- Helper: Section Header ----------
const SectionHeader = ({ label, title, description }: SectionHeaderProps) => (
  <View className="items-center mb-8">
    <View className="flex-row items-center bg-orange-100 px-4 py-1.5 rounded-full mb-3">
      <Sparkles size={14} color="#E6761D" />
      <Text className="text-[#E6761D] text-xs font-bold ml-2 uppercase tracking-wider">
        {label}
      </Text>
    </View>
    <Text className="text-2xl font-black text-gray-900 text-center mb-2">
      {title}
    </Text>
    <View className="w-20 h-1 bg-[#E6761D] rounded-full mb-3" />
    <Text className="text-gray-500 text-sm text-center px-6">
      {description}
    </Text>
  </View>
);

const HoverPressCard = ({
  children,
  style,
  contentStyle,
  pressableStyle,
  activeBorderColor = '#F97316',
}: {
  children: React.ReactNode | ((active: boolean) => React.ReactNode);
  style?: any;
  contentStyle?: any;
  pressableStyle?: any;
  activeBorderColor?: string;
}) => {
  const [active, setActive] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setHover = (next: boolean) => {
    if (timer.current) clearTimeout(timer.current);
    setActive(next);
    Animated.timing(anim, {
      toValue: next ? 1 : 0,
      duration: next ? 190 : 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const release = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setHover(false), 650);
  };

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -6],
  });
  const scale = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.018],
  });

  return (
    <Pressable
      style={pressableStyle}
      onHoverIn={() => setHover(true)}
      onHoverOut={() => setHover(false)}
      onPressIn={() => setHover(true)}
      onPressOut={release}
    >
      <Animated.View
        style={[
          {
            transform: [{ translateY }, { scale }],
            shadowColor: active ? activeBorderColor : '#0F172A',
            shadowOffset: { width: 0, height: active ? 14 : 5 },
            shadowOpacity: active ? 0.18 : 0.08,
            shadowRadius: active ? 18 : 9,
            elevation: active ? 10 : 4,
          },
          style,
        ]}
      >
        <View
          style={[
            {
              borderColor: active ? activeBorderColor : '#FDBA74',
            },
            contentStyle,
          ]}
        >
          {typeof children === 'function' ? children(active) : children}
        </View>
      </Animated.View>
    </Pressable>
  );
};

// ---------- Expert Contact Modal ----------
const ExpertModal = ({
  visible,
  onClose,
  serviceName,
  phoneNumber,
}: {
  visible: boolean;
  onClose: () => void;
  serviceName: string;
  phoneNumber?: string;
}) => {
  const message = `Hi team, I'm interested in "${serviceName}". Please guide me.`;
  const contactNumber = phoneNumber || '15556465764';
  const whatsappUrl = `https://wa.me/${contactNumber}?text=${encodeURIComponent(
    message,
  )}`;
  const telUrl = `tel:${contactNumber}`;
  const displayPhone = '+1 555 646 5764';

  const openWhatsApp = () => {
    Linking.openURL(whatsappUrl).catch(() =>
      Alert.alert('Error', 'Could not open WhatsApp'),
    );
  };

  const makeCall = () => {
    Linking.openURL(telUrl).catch(() =>
      Alert.alert('Error', 'Could not open phone dialer'),
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={{
          flex: 1,
          justifyContent: 'flex-end',
          backgroundColor: 'rgba(7, 15, 25, 0.62)',
        }}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={e => e.stopPropagation()}
          style={{
            width: '100%',
            backgroundColor: 'white',
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            overflow: 'hidden',
            position: 'relative',
            paddingBottom: 24,
          }}
        >
          <LinearGradient
            colors={['#F8FAFC', '#FFFFFF', '#FFF7ED']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />

          {/* Header Section */}
          <View
            style={{
              position: 'relative',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 18,
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: '#F1F5F9',
              backgroundColor: 'rgba(255, 255, 255, 0.92)',
            }}
          >
            <View className="flex-row items-center gap-3 flex-1">
              <View
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 23,
                  backgroundColor: 'white',
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: '#0B3856',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.12,
                  shadowRadius: 8,
                  elevation: 3,
                  borderWidth: 1,
                  borderColor: '#E2E8F0',
                }}
              >
                <Image
                  source={{ uri: botIconUrl }}
                  style={{ width: 34, height: 34 }}
                  resizeMode="contain"
                />
              </View>
              <View className="flex-1">
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: '900',
                    color: '#0B3856',
                    textTransform: 'uppercase',
                  }}
                >
                  Talk to an Expert
                </Text>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: '700',
                    color: '#E6761D',
                    marginTop: 2,
                  }}
                  numberOfLines={1}
                >
                  {serviceName}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="p-2 rounded-full bg-gray-100/80"
            >
              <X size={18} color="#1F2937" />
            </TouchableOpacity>
          </View>

          {/* Body Section */}
          <View
            style={{
              position: 'relative',
              paddingHorizontal: 16,
              paddingVertical: 16,
            }}
          >
            {/* Inquiry Message Box */}
            <View
              style={{
                borderRadius: 14,
                borderWidth: 1,
                borderColor: '#FED7AA',
                backgroundColor: 'rgba(255, 247, 237, 0.9)',
                paddingHorizontal: 14,
                paddingVertical: 12,
                marginBottom: 16,
              }}
            >
              <Text style={{ fontSize: 12, color: '#475569', lineHeight: 18 }}>
                Hi team, I'm interested in "{serviceName}". Please guide me.
              </Text>
            </View>

            {/* Action Buttons Grid (Two Columns) */}
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
              <TouchableOpacity
                onPress={openWhatsApp}
                activeOpacity={0.9}
                style={{ flex: 1 }}
              >
                <LinearGradient
                  colors={['#22C55E', '#16A34A']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    borderRadius: 10,
                    paddingVertical: 10,
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowColor: '#22C55E',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                >
                  <MessageCircle
                    size={18}
                    color="white"
                    style={{ marginBottom: 2 }}
                  />
                  <Text
                    style={{ color: 'white', fontSize: 11, fontWeight: '700' }}
                  >
                    WhatsApp
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={makeCall}
                activeOpacity={0.9}
                style={{ flex: 1 }}
              >
                <LinearGradient
                  colors={['#3B82F6', '#2563EB']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    borderRadius: 10,
                    paddingVertical: 10,
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowColor: '#3B82F6',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                >
                  <Phone size={18} color="white" style={{ marginBottom: 2 }} />
                  <Text
                    style={{ color: 'white', fontSize: 11, fontWeight: '700' }}
                  >
                    Call Now
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Info Text (Now below buttons) */}
            <Text
              style={{
                fontSize: 12,
                color: '#475569',
                lineHeight: 18,
                textAlign: 'center',
                marginBottom: 16,
                paddingHorizontal: 10,
              }}
            >
              Choose WhatsApp for quick help or call directly. Our team will
              guide you with real availability, pricing, and next steps.
            </Text>

            {/* Phone Number Section */}
            <View style={{ alignItems: 'center', marginBottom: 16 }}>
              <TouchableOpacity onPress={makeCall}>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: '900',
                    color: '#0B3856',
                    letterSpacing: 0.2,
                  }}
                >
                  {displayPhone}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Availability Box */}
            <LinearGradient
              colors={['#EFF6FF', '#FFF7ED']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                paddingHorizontal: 12,
                paddingVertical: 10,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#DBEAFE',
              }}
            >
              <Clock size={14} color="#0B3856" />
              <Text
                style={{ fontSize: 11, fontWeight: '700', color: '#334155' }}
              >
                Available 9:00 AM – 9:00 PM (IST)
              </Text>
            </LinearGradient>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

// ---------- Core Service Card ----------
const CoreServiceCard = ({
  service,
  onGetStarted,
}: {
  service: CoreService;
  onGetStarted: (name: string) => void;
}) => {
  return (
    <HoverPressCard
      style={{ marginBottom: 24 }}
      activeBorderColor={service.bgColor}
      contentStyle={{
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1.5,
        padding: 20,
      }}
    >
      <View className="flex-row items-start mb-4">
        <View
          style={{ backgroundColor: service.bgColor }}
          className="p-3 rounded-xl"
        >
          {service.icon}
        </View>
        <View className="ml-4 flex-1">
          <Text className="text-lg font-bold text-gray-900 mb-0.5">
            {service.title}
          </Text>
          <Text
            style={{ color: service.bgColor }}
            className="text-xs font-semibold mb-1"
          >
            {service.subtitle}
          </Text>
          <Text className="text-gray-600 text-xs leading-5">
            {service.description}
          </Text>
        </View>
      </View>

      <View className="flex-row flex-wrap mb-4">
        <View className="w-1/2 pr-2">
          <Text className="font-semibold text-gray-900 text-xs mb-2">
            Key Features
          </Text>
          {service.features.map((feature, idx) => (
            <View key={idx} className="flex-row items-center mb-1.5">
              <CircleCheckBig size={12} color={service.bgColor} />
              <Text className="text-gray-600 text-[11px] ml-2 flex-1">
                {feature}
              </Text>
            </View>
          ))}
        </View>
        <View className="w-1/2 pl-2">
          <Text className="font-semibold text-gray-900 text-xs mb-2">
            Process Steps
          </Text>
          {service.steps.map((step, idx) => (
            <View key={idx} className="flex-row items-center mb-1.5">
              <View className="w-4 h-4 bg-blue-100 rounded-full items-center justify-center mr-2">
                <Text className="text-blue-700 text-[9px] font-bold">
                  {idx + 1}
                </Text>
              </View>
              <Text className="text-gray-600 text-[11px] flex-1">{step}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className="flex-row justify-between mb-5">
        <View className="items-center flex-1 bg-blue-50/50 py-2 rounded-xl mr-2">
          <Text
            style={{ color: service.bgColor }}
            className="text-[10px] font-black"
          >
            {service.pricing}
          </Text>
          <Text className="text-gray-400 text-[9px] uppercase">Pricing</Text>
        </View>
        <View className="items-center flex-1 bg-blue-50/50 py-2 rounded-xl mr-2">
          <Text
            style={{ color: service.bgColor }}
            className="text-[10px] font-black"
          >
            {service.duration}
          </Text>
          <Text className="text-gray-400 text-[9px] uppercase">Duration</Text>
        </View>
        <View className="items-center flex-1 bg-blue-50/50 py-2 rounded-xl">
          <CountUpMetric
            value={service.success}
            style={{ color: service.bgColor }}
            className="text-[10px] font-black"
          />
          <Text className="text-gray-400 text-[9px] uppercase">Success</Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => onGetStarted(service.title)}
        style={{ backgroundColor: service.bgColor }}
        className="py-3 rounded-xl items-center shadow-md"
      >
        <Text className="text-white font-bold text-sm">Get Started</Text>
      </TouchableOpacity>
    </HoverPressCard>
  );
};

// ---------- Additional Service Card ----------
const AdditionalServiceCard = ({
  item,
  onLearnMore,
}: {
  item: AdditionalService;
  onLearnMore: (name: string) => void;
}) => (
  <HoverPressCard
    pressableStyle={{ width: '48%', marginBottom: 16 }}
    contentStyle={{
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      borderWidth: 1.5,
      padding: 16,
    }}
  >
    {active => (
      <>
        <Animated.View
          style={{
            transform: [{ scale: active ? 1.08 : 1 }],
          }}
        >
          <LinearGradient
            colors={item.gradient}
            className="w-12 h-12 rounded-xl items-center justify-center mx-auto mb-3"
          >
            {item.icon}
          </LinearGradient>
        </Animated.View>
        <Text className="text-gray-900 font-bold text-sm text-center mb-1">
          {item.title}
        </Text>
        <Text className="text-gray-500 text-[11px] text-center leading-4 mb-2">
          {item.description}
        </Text>
        <Text className="text-blue-600 font-semibold text-[10px] text-center mb-3">
          {item.price}
        </Text>
        <TouchableOpacity
          onPress={() => onLearnMore(item.title)}
          className="bg-gray-50 border border-orange-200 py-2 rounded-lg items-center"
        >
          <Text className="text-gray-700 text-[10px] font-medium">Learn More</Text>
        </TouchableOpacity>
      </>
    )}
  </HoverPressCard>
);

// ---------- Testimonial Card ----------
const TestimonialCard = ({ item }: { item: Testimonial }) => (
  <HoverPressCard
    style={{ marginBottom: 24 }}
    contentStyle={{
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      borderWidth: 1.5,
      padding: 20,
    }}
  >
    {active => (
      <>
        <Animated.View
          style={{ transform: [{ translateY: active ? -2 : 0 }] }}
          className="flex-row gap-1 mb-3"
        >
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={14} color="#fbbf24" fill="#fbbf24" />
          ))}
        </Animated.View>
        <Text className="text-gray-700 text-xs italic leading-5 mb-4">
          "{item.comment}"
        </Text>
        <View className="flex-row items-center gap-3">
          {item.image ? (
            <Image
              source={{ uri: item.image }}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <Animated.View
              style={{ transform: [{ scale: active ? 1.08 : 1 }] }}
              className="w-10 h-10 rounded-full bg-[#0b3856] items-center justify-center"
            >
              <Text className="text-white text-xs font-black">
                {item.name?.charAt(0) || 'R'}
              </Text>
            </Animated.View>
          )}
          <View>
            <Text className="font-semibold text-gray-900 text-sm">{item.name}</Text>
            <Text className="text-gray-500 text-[11px]">{item.location}</Text>
          </View>
        </View>
      </>
    )}
  </HoverPressCard>
);

// ---------- FAQ Accordion ----------
const FAQItem = ({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <HoverPressCard
      style={{ marginBottom: 12 }}
      contentStyle={{
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1.5,
      }}
    >
      <TouchableOpacity
        onPress={() => setOpen(!open)}
        className="flex-row justify-between items-center p-4"
      >
        <Text className="text-gray-900 font-semibold text-sm flex-1 mr-4">
          {question}
        </Text>
        <ChevronDown
          size={18}
          color="#6b7280"
          style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}
        />
      </TouchableOpacity>
      {open && (
        <View className="px-4 pb-4">
          <Text className="text-gray-600 text-xs leading-5">{answer}</Text>
        </View>
      )}
    </HoverPressCard>
  );
};

// ---------- MAIN SCREEN ----------
const ServicesScreen = ({
  onScroll,
  onTabChange,
}: {
  onScroll?: (event: any) => void;
  onTabChange?: (tab: string) => void;
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedService, setSelectedService] = useState('');
  const [paymentPlanLoading, setPaymentPlanLoading] = useState<string | null>(
    null,
  );
  const cms = useCmsContent('services', servicesFallback);

  const openExpertModal = (serviceName: string) => {
    console.log('--- Expert Modal Opening ---');
    console.log('Service:', serviceName);
    setSelectedService(serviceName);
    setModalVisible(true);
  };

  const openPaymentUrl = (url: string) => {
    const webWindow = (globalThis as any)?.window;
    if (webWindow?.open) {
      const opened = webWindow.open(url, '_blank', 'noopener,noreferrer');
      if (opened) return;
    }

    if ((globalThis as any)?.location) {
      (globalThis as any).location.href = url;
      return;
    }

    Linking.openURL(url).catch(() =>
      Alert.alert('Payment unavailable', 'Could not open Razorpay payment.'),
    );
  };

  const handlePlanPayment = async (
    plan: 'premium' | 'enterprise',
    amount: number,
    label: string,
  ) => {
    if (paymentPlanLoading) return;

    setPaymentPlanLoading(plan);
    try {
      const response = await paymentService.createRazorpayPaymentLink({
        plan,
        amount,
        label,
        propertyCode: 'services',
      });
      const url = response.data?.data?.url;
      if (!url) throw new Error('Payment link missing');
      openPaymentUrl(url);
    } catch (error: any) {
      Alert.alert(
        'Payment unavailable',
        error?.response?.data?.message || 'Could not start Razorpay payment.',
      );
    } finally {
      setPaymentPlanLoading(null);
    }
  };

  const fallbackCoreServices: CoreService[] = [
    {
      title: 'Property Buying',
      subtitle: 'Find Your Dream Home',
      description:
        'Comprehensive assistance in finding and purchasing your perfect property with expert guidance and verified listings.',
      icon: <Home size={20} color="white" />,
      bgColor: '#3b82f6',
      features: [
        'AI-powered property matching',
        'Verified property listings',
        'Expert property evaluation',
        'Negotiation support',
        'Legal documentation assistance',
        'Post-purchase support',
      ],
      steps: [
        'Requirement Analysis',
        'Property Shortlisting',
        'Site Visits & Evaluation',
        'Price Negotiation',
        'Legal Verification',
        'Registration & Handover',
      ],
      pricing: 'No Hidden Charges',
      duration: '15-30 days',
      success: '95%',
    },
    {
      title: 'Property Selling',
      subtitle: 'Maximize Your Returns',
      description:
        'End-to-end selling support with premium marketing, verified buyers, and transparent pricing to get the best value.',
      icon: <Building size={20} color="white" />,
      bgColor: '#22c55e',
      features: [
        'Professional photography',
        'Multi-channel marketing',
        'Verified buyer database',
        'Price optimization',
        'Legal documentation',
        'Hassle-free transaction',
      ],
      steps: [
        'Property Valuation',
        'Documentation Review',
        'Marketing & Promotion',
        'Buyer Screening',
        'Negotiation & Closure',
        'Registration Support',
      ],
      pricing: '2% Commission',
      duration: '30-60 days',
      success: '92%',
    },
    {
      title: 'Home Loan Assistance',
      subtitle: 'Best Rates Guaranteed',
      description:
        'Get the best home loan deals with our banking partnerships and expert assistance throughout the process.',
      icon: <CreditCard size={20} color="white" />,
      bgColor: '#a855f7',
      features: [
        'Multiple bank partnerships',
        'Competitive interest rates',
        'Quick approval',
        'Documentation support',
        'EMI tools',
        'Processing assistance',
      ],
      steps: [
        'Eligibility Assessment',
        'Bank Selection',
        'Application Submission',
        'Documentation Support',
        'Loan Approval',
        'Disbursement',
      ],
      pricing: 'Free Service',
      duration: '3-15 days',
      success: '99%',
    },
    {
      title: 'Legal Services',
      subtitle: 'Complete Documentation',
      description:
        'Expert legal services for all property transactions with experienced lawyers and transparent pricing.',
      icon: <FileText size={20} color="white" />,
      bgColor: '#f97316',
      features: [
        'Title verification',
        'Document preparation',
        'Due diligence',
        'Registration assistance',
        'Dispute resolution',
        'Compliance support',
      ],
      steps: [
        'Document Review',
        'Title Verification',
        'Legal Opinion',
        'Agreement Drafting',
        'Registration Support',
        'Post-transaction Support',
      ],
      pricing: '₹10,000 onwards',
      duration: '5-10 days',
      success: '99%',
    },
    {
      title: 'Property Management',
      subtitle: 'Hassle-Free Rentals',
      description:
        'Complete property management services including tenant screening, rent collection, and maintenance.',
      icon: <Shield size={20} color="white" />,
      bgColor: '#6366f1',
      features: [
        'Tenant screening',
        'Rent collection',
        'Maintenance',
        'Legal compliance',
        'Regular inspections',
        '24/7 support',
      ],
      steps: [
        'Property Assessment',
        'Tenant Sourcing',
        'Agreement Execution',
        'Move-in Support',
        'Ongoing Management',
        'Renewal/Exit Support',
      ],
      pricing: '8% of rental income',
      duration: 'Ongoing',
      success: '96%',
    },
    {
      title: 'Investment Advisory',
      subtitle: 'Smart Investment Decisions',
      description:
        'Data-driven investment advice with market analysis and portfolio recommendations for maximum returns.',
      icon: <TrendingUp size={20} color="white" />,
      bgColor: '#ec4899',
      features: [
        'Market trend analysis',
        'Opportunity identification',
        'ROI calculations',
        'Risk assessment',
        'Portfolio diversification',
        'Exit strategy',
      ],
      steps: [
        'Investment Goal Analysis',
        'Market Research',
        'Opportunity Identification',
        'Risk Assessment',
        'Investment Execution',
        'Performance Monitoring',
      ],
      pricing: '₹25,000 consultation',
      duration: '30-45 days',
      success: '85%',
    },
  ];

  const fallbackAdditionalServices: AdditionalService[] = [
    {
      title: 'Property Valuation',
      description:
        'Professional property valuation for accurate market pricing',
      price: 'Contact for Pricing',
      icon: <Calculator size={16} color="white" />,
      gradient: ['#3b82f6', '#2563eb'],
    },
    {
      title: 'Virtual Property Tours',
      description: '360° virtual tours for remote property viewing',
      price: 'Contact for Pricing',
      icon: <Eye size={16} color="white" />,
      gradient: ['#a855f7', '#7e22ce'],
    },
    {
      title: 'Market Research Reports',
      description: 'Detailed market analysis and trends for specific areas',
      price: 'Contact for Pricing',
      icon: <Search size={16} color="white" />,
      gradient: ['#22c55e', '#15803d'],
    },
    {
      title: 'Interior Design Consultation',
      description: 'Expert interior design advice for home staging',
      price: 'Contact for Pricing',
      icon: <HandHeart size={16} color="white" />,
      gradient: ['#f97316', '#ea580c'],
    },
  ];

  const fallbackFaqs = [
    {
      q: 'What makes ResaleExpert different from other platforms?',
      a: 'We offer 100% verified properties, AI-powered matching, and end-to-end support with transparent pricing. Our expert team ensures a smooth experience from search to registration.',
    },
    {
      q: 'How do you verify properties?',
      a: 'Our verification process includes legal document checks, physical property inspection, ownership verification, and compliance checks to ensure authenticity and legal clarity.',
    },
    {
      q: 'What are your fees for selling a property?',
      a: 'We charge a transparent 2% commission only after successful sale. No hidden fees, no upfront charges. You pay only when we deliver results.',
    },
    {
      q: 'How long does it typically take to sell a property?',
      a: 'On average, properties sell within 30-60 days with our marketing strategies. Premium locations and well-priced properties often sell faster.',
    },
    {
      q: 'Do you provide legal support?',
      a: 'Yes, we have experienced legal partners who assist with documentation, title verification, registration, and ensure all transactions are legally compliant.',
    },
    {
      q: 'Can I get a free property evaluation before selling?',
      a: 'Yes, our team can evaluate your property using recent market trends, location demand, amenities, and comparable resale values before you decide the selling price.',
    },
    {
      q: 'Do you help with home loans and documentation?',
      a: 'Yes, we assist with loan eligibility checks, bank coordination, document preparation, and transaction paperwork so the buying or selling process stays smooth.',
    },
    {
      q: 'Can ResaleExpert manage visits for outstation owners?',
      a: 'Yes, we can coordinate buyer calls, property visits, shortlisting, and updates for owners who are not available locally.',
    },
  ];

  const fallbackTestimonials: Testimonial[] = [
    {
      name: 'Rajesh Kumar',
      location: 'Property Buying • Mumbai',
      comment:
        'ResaleExpert helped me find my dream home within my budget. Their AI matching is incredible!',
      image:
        'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200',
    },
    {
      name: 'Priya Sharma',
      location: 'Property Selling • Pune',
      comment:
        'Their valuation and buyer screening helped me sell faster with complete confidence.',
      image:
        'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200',
    },
    {
      name: 'Amit Patel',
      location: 'Home Loan • PCMC',
      comment:
        'The team handled site visits, documents and loan guidance smoothly from start to finish.',
      image:
        'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200',
    },
  ];

  const coreServices: CoreService[] = (
    cms.coreServices?.length ? cms.coreServices : fallbackCoreServices
  ).map((service: any, index: number) => {
    const Icon = serviceIcons[index] || Home;
    return {
      ...service,
      icon: <Icon size={20} color="white" />,
      features: service.features || [],
      steps: service.steps || [],
    };
  });
  const additionalServices: AdditionalService[] = (
    cms.additionalServices?.length
      ? cms.additionalServices
      : fallbackAdditionalServices
  ).map((service: any, index: number) => {
    const Icon = additionalIcons[index] || Calculator;
    return {
      ...service,
      icon: <Icon size={16} color="white" />,
      gradient: service.gradient || ['#3b82f6', '#2563eb'],
    };
  });
  const faqs = [
    ...(cms.faqs?.length ? cms.faqs : []),
    ...fallbackFaqs.filter(
      fallback =>
        !(cms.faqs || []).some((faq: { q?: string }) => faq.q === fallback.q),
    ),
  ].slice(0, Math.max(5, cms.faqs?.length || 0));
  const testimonials: Testimonial[] = cms.testimonials?.length
    ? cms.testimonials
    : fallbackTestimonials;

  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1 bg-gray-50"
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {/* HERO SECTION */}
        <LinearGradient
          colors={['#0b3856', '#0c3854']}
          className="py-16 px-6 items-center"
        >
          <Text className="text-white text-3xl font-black text-center mb-3">
            {cms.heroTitle}
          </Text>
          <Text className="text-blue-100 text-base text-center leading-6 max-w-xs mb-8">
            {cms.heroSubtitle}
          </Text>
          <TouchableOpacity
            onPress={() => openExpertModal('Free Consultation')}
            className="bg-[#E6761D] px-8 py-4 rounded-xl shadow-lg"
          >
            <Text className="text-white font-bold text-base">
              {cms.ctaText}
            </Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* OUR CORE SERVICES */}
        <View className="py-12 px-4">
          <SectionHeader
            label="What We Offer"
            title="Our Core Services"
            description="Comprehensive real estate solutions tailored to your specific needs"
          />
          {coreServices.map((service, idx) => (
            <CoreServiceCard
              key={idx}
              service={service}
              onGetStarted={openExpertModal}
            />
          ))}
        </View>

        {/* ADDITIONAL SERVICES */}
        <View className="py-12 px-4 bg-white">
          <SectionHeader
            label="Value Added"
            title="Additional Services"
            description="Specialized services to enhance your property experience"
          />
          <View className="flex-row flex-wrap justify-between">
            {additionalServices.map((item, idx) => (
              <AdditionalServiceCard
                key={idx}
                item={item}
                onLearnMore={openExpertModal}
              />
            ))}
          </View>
        </View>

        {/* WHY CHOOSE RESALEEXPERT */}
        <View className="py-12 px-4 relative overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50">
          <SectionHeader
            label="Why Trust Us"
            title="Why Choose ResaleExpert?"
            description="Excellence backed by experience and innovation"
          />
          <View className="flex-row flex-wrap justify-between">
            {[
              {
                value: '12+',
                label: 'Years of Excellence',
                desc: 'Decades of expertise in real estate',
                icon: <Award size={20} color="white" />,
                gradient: ['#3b82f6', '#2563eb'],
              },
              {
                value: '100%',
                label: 'Verified Properties',
                desc: '100% legal and verified listings',
                icon: <Shield size={20} color="white" />,
                gradient: ['#22c55e', '#15803d'],
              },
              {
                value: '50+',
                label: 'Expert Team',
                desc: 'Certified real estate professionals',
                icon: <Briefcase size={20} color="white" />,
                gradient: ['#f97316', '#ea580c'],
              },
              {
                value: '98%',
                label: 'Customer Satisfaction',
                desc: 'Happy customers across India',
                icon: <Users size={20} color="white" />,
                gradient: ['#a855f7', '#7e22ce'],
              },
            ].map((item, idx) => (
              <HoverPressCard
                key={idx}
                style={{ width: '100%', marginBottom: 16 }}
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 16,
                  borderWidth: 1.5,
                  padding: 20,
                }}
              >
                {active => (
                  <>
                    <Animated.View
                      style={{ transform: [{ scale: active ? 1.08 : 1 }] }}
                    >
                      <LinearGradient
                        colors={item.gradient}
                        className="w-14 h-14 rounded-xl items-center justify-center mb-3"
                      >
                        {item.icon}
                      </LinearGradient>
                    </Animated.View>
                    <CountUpMetric
                      value={item.value}
                      className="text-2xl font-black text-gray-800"
                    />
                    <Text className="font-bold text-gray-900 text-sm mt-1">
                      {item.label}
                    </Text>
                    <Text className="text-gray-500 text-xs mt-1">{item.desc}</Text>
                  </>
                )}
              </HoverPressCard>
            ))}
          </View>
          <View className="flex-row flex-wrap justify-center gap-4 mt-6 bg-white/60 rounded-2xl px-6 py-3 mx-auto">
            <View className="flex-row items-center gap-2">
              <Shield size={16} color="#16a34a" />
              <Text className="text-gray-700 text-xs">
                100% Legal Compliance
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <ThumbsUp size={16} color="#2563eb" />
              <Text className="text-gray-700 text-xs">No Hidden Charges</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Sparkles size={16} color="#ea580c" />
              <Text className="text-gray-700 text-xs">AI-Powered Matching</Text>
            </View>
          </View>
        </View>

        {/* OUR SERVICE PROCESS */}
        <View className="py-12 px-4 bg-white">
          <SectionHeader
            label="How We Work"
            title="Our Service Process"
            description="Simple, transparent, and efficient workflow"
          />
          <View className="flex-row flex-wrap justify-between">
            {[
              {
                step: '1',
                title: 'Consultation',
                desc: 'Free consultation to understand your requirements',
              },
              {
                step: '2',
                title: 'Planning',
                desc: 'Detailed planning and strategy development',
              },
              {
                step: '3',
                title: 'Execution',
                desc: 'Professional execution with regular updates',
              },
              {
                step: '4',
                title: 'Completion',
                desc: 'Successful completion with post-service support',
              },
            ].map((item, idx) => (
              <View key={idx} className="w-[48%] items-center text-center mb-6">
                <LinearGradient
                  colors={['#E6761D', '#F59E0B']}
                  className="w-12 h-12 rounded-full items-center justify-center mb-3 shadow-md"
                >
                  <Text className="text-white font-bold text-base">
                    {item.step}
                  </Text>
                </LinearGradient>
                <Text className="font-bold text-gray-900 text-sm mb-1">
                  {item.title}
                </Text>
                <Text className="text-gray-500 text-xs text-center">
                  {item.desc}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* TESTIMONIALS */}
        {testimonials.length > 0 && (
          <View className="py-12 px-4 bg-gray-50">
            <SectionHeader
              label="Testimonials"
              title="Client Success Stories"
              description="What our clients say about our services"
            />
            <View className="flex-row flex-wrap justify-between">
              {testimonials.map((item, idx) => (
                <View key={idx} className="w-full md:w-[48%] lg:w-[32%] mb-6">
                  <TestimonialCard item={item} />
                </View>
              ))}
            </View>
          </View>
        )}

        {/* PRICING PLANS */}
        <View className="py-12 px-4 bg-white">
          <SectionHeader
            label="Plans & Pricing"
            title="Transparent Pricing"
            description="Choose the plan that works best for you"
          />
          <View className="flex-row flex-wrap justify-between gap-4">
            {/* Basic Plan */}
            <View className="w-full md:w-[32%] bg-white border-2 border-orange-300 rounded-2xl p-6 items-center transition-all hover:border-orange-500 hover:shadow-xl">
              <Text className="text-2xl font-bold text-gray-900 mb-1">
                Basic
              </Text>
              <Text className="text-4xl font-black text-blue-600 mb-1">
                Free
              </Text>
              <Text className="text-gray-500 text-xs mb-4">
                Perfect for first-time users
              </Text>
              <View className="self-start mb-6">
                {[
                  'Property search & listings',
                  'Basic property details',
                  'Contact property owners',
                  'Basic market insights',
                ].map((feature, i) => (
                  <View key={i} className="flex-row items-center mb-2">
                    <CircleCheckBig size={12} color="#22c55e" />
                    <Text className="text-gray-700 text-xs ml-2">
                      {feature}
                    </Text>
                  </View>
                ))}
              </View>
              <TouchableOpacity
                onPress={() => openExpertModal('Basic Plan')}
                className="bg-gray-100 py-3 px-6 rounded-xl w-full"
              >
                <Text className="text-gray-700 font-semibold text-center text-sm">
                  Get Started
                </Text>
              </TouchableOpacity>
            </View>

            {/* Premium Plan */}
            <LinearGradient
              colors={['#2563eb', '#7e22ce']}
              className="w-full md:w-[32%] rounded-2xl p-6 items-center shadow-xl"
            >
              <View className="flex-row items-center mb-1">
                <Crown size={18} color="#fbbf24" />
                <Text className="text-white font-bold text-xl ml-1">
                  Premium
                </Text>
              </View>
              <Text className="text-3xl font-black text-white mb-1">
                ₹2,999
              </Text>
              <Text className="text-blue-200 text-xs mb-4">
                Most popular choice
              </Text>
              <View className="self-start mb-6">
                {[
                  'Everything in Basic',
                  'Expert consultation',
                  'Site visit assistance',
                  'Legal verification',
                  'Loan assistance',
                ].map((feature, i) => (
                  <View key={i} className="flex-row items-center mb-2">
                    <CircleCheckBig size={12} color="#bbf7d0" />
                    <Text className="text-white text-xs ml-2">{feature}</Text>
                  </View>
                ))}
              </View>
              <TouchableOpacity
                onPress={() =>
                  handlePlanPayment('premium', 2999, 'Premium Plan')
                }
                disabled={paymentPlanLoading !== null}
                className="bg-white py-3 px-6 rounded-xl w-full"
              >
                {paymentPlanLoading === 'premium' ? (
                  <ActivityIndicator color="#2563eb" size="small" />
                ) : (
                  <Text className="text-blue-600 font-semibold text-center text-sm">
                    Choose Premium
                  </Text>
                )}
              </TouchableOpacity>
            </LinearGradient>

            {/* Enterprise Plan */}
            <View className="w-full md:w-[32%] bg-white border-2 border-orange-300 rounded-2xl p-6 items-center transition-all hover:border-orange-500 hover:shadow-xl">
              <Text className="text-2xl font-bold text-gray-900 mb-1">
                Enterprise
              </Text>
              <Text className="text-4xl font-black text-purple-600 mb-1">
                Custom
              </Text>
              <Text className="text-gray-500 text-xs mb-4">
                For large portfolios
              </Text>
              <View className="self-start mb-6">
                {[
                  'Everything in Premium',
                  'Dedicated relationship manager',
                  'Priority support',
                  'Custom solutions',
                ].map((feature, i) => (
                  <View key={i} className="flex-row items-center mb-2">
                    <CircleCheckBig size={12} color="#22c55e" />
                    <Text className="text-gray-700 text-xs ml-2">
                      {feature}
                    </Text>
                  </View>
                ))}
              </View>
              <TouchableOpacity
                onPress={() =>
                  handlePlanPayment('enterprise', 49999, 'Enterprise Plan')
                }
                disabled={paymentPlanLoading !== null}
                className="bg-purple-600 py-3 px-6 rounded-xl w-full"
              >
                {paymentPlanLoading === 'enterprise' ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text className="text-white font-semibold text-center text-sm">
                    Contact Sales
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* FAQ SECTION */}
        <View className="py-12 px-4 bg-gray-50">
          <SectionHeader
            label="FAQ"
            title="Frequently Asked Questions"
            description="Get answers to common questions about our services"
          />
          {faqs.map((faq, idx) => (
            <FAQItem key={idx} question={faq.q} answer={faq.a} />
          ))}
        </View>

        {/* FINAL CTA */}
        <LinearGradient
          colors={['#0b3856', '#0c3854']}
          className="py-12 px-4 items-center"
        >
          <Text className="text-white text-2xl font-bold text-center mb-3">
            Ready to Get Started?
          </Text>
          <Text className="text-blue-100 text-sm text-center mb-6 px-4">
            Let our experts help you with your real estate needs. Get a free
            consultation today!
          </Text>
          <View className="flex-row flex-wrap justify-center gap-4">
            <TouchableOpacity
              onPress={() => openExpertModal('Free Consultation')}
              className="bg-[#E6761D] px-6 py-3 rounded-xl shadow-lg"
            >
              <Text className="text-white font-semibold text-sm">
                Get Free Consultation
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => Linking.openURL('tel:+919637009639')}
              className="bg-transparent border-2 border-white px-6 py-3 rounded-xl"
            >
              <Text className="text-white font-semibold text-sm">
                Call Now: +91 9637 00 9639
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <Footer onTabChange={onTabChange} />
      </ScrollView>

      {/* Expert Contact Modal - Moved outside ScrollView for better visibility */}
      <ExpertModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        serviceName={selectedService}
        phoneNumber=""
      />
    </View>
  );
};

export default ServicesScreen;
