import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  RefreshControl,
} from 'react-native';
import {
  BarChart3,
  BookOpen,
  Building2,
  Inbox,
  LogOut,
  Plus,
  RefreshCw,
  ShieldCheck,
  Users,
  Trash2,
  FileText,
  Phone,
  TrendingUp,
} from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import { adminService, blogService, contactService, propertyService, userService } from '../services/api';

type AdminPanel = 'overview' | 'property' | 'blog' | 'leads' | 'users';

type AdminDashboardProps = {
  user?: any;
  onLogout?: () => void;
};

const emptyPropertyForm = {
  title: '',
  propertyCode: '',
  propertyType: 'Residential',
  unitType: '2BHK',
  subtype: 'Apartment',
  city: 'Pune',
  location: '',
  price: '',
  carpetArea: '',
  bedrooms: '2',
  bathrooms: '2',
  parking: '1',
  imageUrl: '',
  description: '',
  amenities: 'Parking, Security, Elevator',
  featured: false,
};

const emptyBlogForm = {
  title: '',
  excerpt: '',
  content: '',
  author: 'Kamlesh Shah',
  readTime: '5 min read',
  category: 'Real Estate',
  tags: 'real estate, property',
  imageUrl: '',
  featured: false,
};

const currency = (value: any) => {
  const number = Number(value || 0);
  if (!number) return 'On Request';
  if (number >= 10000000) return `₹${(number / 10000000).toFixed(2).replace(/\.00$/, '')}Cr`;
  if (number >= 100000) return `₹${(number / 100000).toFixed(2).replace(/\.00$/, '')}L`;
  return `₹${number.toLocaleString('en-IN')}`;
};

// ─── Reusable Field ────────────────────────────────────────────────────────────
const Field = ({ label, value, onChangeText, placeholder, multiline, keyboardType }: any) => (
  <View style={{ marginBottom: 12 }}>
    <Text style={{ fontSize: 10, fontWeight: '700', color: '#64748B', letterSpacing: 1, marginBottom: 6, textTransform: 'uppercase' }}>
      {label}
    </Text>
    <TextInput
      style={{
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: multiline ? 12 : 0,
        color: '#1E293B',
        backgroundColor: '#F8FAFC',
        height: multiline ? undefined : 46,
        minHeight: multiline ? 90 : undefined,
        fontSize: 14,
        fontWeight: '500',
      }}
      placeholder={placeholder}
      placeholderTextColor="#CBD5E1"
      value={value}
      onChangeText={onChangeText}
      multiline={multiline}
      keyboardType={keyboardType}
      textAlignVertical={multiline ? 'top' : 'center'}
    />
  </View>
);

// ─── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, bgColor, iconColor }: any) => (
  <View style={{
    flex: 1,
    minWidth: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  }}>
    <View style={{
      width: 42,
      height: 42,
      borderRadius: 12,
      backgroundColor: bgColor,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    }}>
      <Icon size={20} color={iconColor} />
    </View>
    <Text style={{ fontSize: 26, fontWeight: '900', color: '#0c3854', letterSpacing: -0.5 }}>{value ?? 0}</Text>
    <Text style={{ fontSize: 12, color: '#94A3B8', marginTop: 2, fontWeight: '500' }}>{label}</Text>
  </View>
);

// ─── Tab Button ────────────────────────────────────────────────────────────────
const TabBtn = ({ label, icon: Icon, active, onPress }: any) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8}
    style={{
      flex: 1,
      alignItems: 'center',
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: active ? '#0c3854' : 'transparent',
    }}
  >
    <Icon size={18} color={active ? '#E6761D' : '#94A3B8'} />
    <Text style={{
      fontSize: 10,
      fontWeight: '700',
      color: active ? '#FFFFFF' : '#94A3B8',
      marginTop: 3,
      letterSpacing: 0.3,
    }}>
      {label}
    </Text>
  </TouchableOpacity>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const AdminDashboardScreen = ({ user, onLogout }: AdminDashboardProps) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activePanel, setActivePanel] = useState<AdminPanel>('overview');
  const [summary, setSummary] = useState<any>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [propertyForm, setPropertyForm] = useState(emptyPropertyForm);
  const [blogForm, setBlogForm] = useState(emptyBlogForm);

  const stats = summary?.stats || {};
  const recent = summary?.recent || {};

  const loadSummary = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await adminService.getSummary();
      setSummary(response.data);
    } catch (error: any) {
      Alert.alert('Dashboard unavailable', error?.response?.data?.message || 'Could not load admin data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadLeads = async () => {
    setLeadsLoading(true);
    try {
      const response = await contactService.getAll();
      const data = response.data?.data ?? response.data;
      setLeads(Array.isArray(data) ? data : []);
    } catch {
      setLeads([]);
    } finally {
      setLeadsLoading(false);
    }
  };

  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const response = await userService.getAll();
      const data = response.data?.data ?? response.data;
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  useEffect(() => {
    if (activePanel === 'leads') loadLeads();
    if (activePanel === 'users') loadUsers();
  }, [activePanel]);

  const onRefresh = () => {
    setRefreshing(true);
    loadSummary(true);
    if (activePanel === 'leads') loadLeads();
    if (activePanel === 'users') loadUsers();
  };

  const completion = useMemo(() => {
    const fields = [propertyForm.title, propertyForm.location, propertyForm.price, propertyForm.carpetArea, propertyForm.imageUrl];
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  }, [propertyForm]);

  const createProperty = async () => {
    if (!propertyForm.title || !propertyForm.location || !propertyForm.price) {
      Alert.alert('Required fields', 'Property title, location and price are required.');
      return;
    }
    setSaving(true);
    try {
      await propertyService.create({
        ...propertyForm,
        price: Number(propertyForm.price),
        carpetArea: Number(propertyForm.carpetArea),
        bedrooms: Number(propertyForm.bedrooms),
        bathrooms: Number(propertyForm.bathrooms),
        parking: Number(propertyForm.parking),
        amenities: propertyForm.amenities.split(',').map((i) => i.trim()).filter(Boolean),
      });
      Alert.alert('✅ Property Added', 'New property saved to database.');
      setPropertyForm(emptyPropertyForm);
      setActivePanel('overview');
      loadSummary(true);
    } catch (error: any) {
      Alert.alert('Save failed', error?.response?.data?.message || 'Could not add property.');
    } finally {
      setSaving(false);
    }
  };

  const createBlog = async () => {
    if (!blogForm.title || !blogForm.author || !blogForm.content) {
      Alert.alert('Required fields', 'Blog title, author and content are required.');
      return;
    }
    setSaving(true);
    try {
      await blogService.create({
        ...blogForm,
        tags: blogForm.tags.split(',').map((i) => i.trim()).filter(Boolean),
      });
      Alert.alert('✅ Blog Published', 'New blog saved to database.');
      setBlogForm(emptyBlogForm);
      setActivePanel('overview');
      loadSummary(true);
    } catch (error: any) {
      Alert.alert('Save failed', error?.response?.data?.message || 'Could not add blog.');
    } finally {
      setSaving(false);
    }
  };

  const deleteProperty = (id: string) => {
    Alert.alert('Delete Property', 'Remove this property from database?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await propertyService.delete(id);
            loadSummary(true);
          } catch {
            Alert.alert('Delete failed', 'Could not delete property.');
          }
        },
      },
    ]);
  };

  const deleteBlog = (id: string | number) => {
    Alert.alert('Delete Blog', 'Remove this blog from database?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await blogService.delete(id);
            loadSummary(true);
          } catch {
            Alert.alert('Delete failed', 'Could not delete blog.');
          }
        },
      },
    ]);
  };

  const deleteUser = (id: string | number) => {
    Alert.alert('Delete User', 'Remove this user account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await userService.delete(id);
            loadUsers();
          } catch {
            Alert.alert('Delete failed', 'Could not delete user.');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#E6761D" />
        <Text style={{ color: '#94A3B8', marginTop: 12, fontWeight: '500' }}>Loading admin dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#E6761D" />}
      >
        {/* Header Card */}
        <LinearGradient
          colors={['#0c3854', '#1a5276']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ margin: 16, borderRadius: 22, padding: 20 }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <ShieldCheck size={16} color="#E6761D" />
                <Text style={{ color: '#E6761D', fontSize: 11, fontWeight: '700', marginLeft: 6, letterSpacing: 1 }}>
                  ADMIN CONSOLE
                </Text>
              </View>
              <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: '900', letterSpacing: -0.3 }}>
                Welcome, {user?.name?.split(' ')[0] || 'Admin'} 👋
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 6 }}>
                Manage listings, content, leads & team from one place
              </Text>
            </View>
            <TouchableOpacity
              style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: 12, borderRadius: 14 }}
              onPress={() => Alert.alert('Logout', 'Are you sure you want to logout?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Logout', style: 'destructive', onPress: onLogout },
              ])}
            >
              <LogOut size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Quick Stats */}
          <View style={{ flexDirection: 'row', marginTop: 20, gap: 10 }}>
            {[
              { label: 'Properties', value: stats.properties ?? 0 },
              { label: 'Blogs', value: stats.blogs ?? 0 },
              { label: 'Leads', value: stats.contacts ?? 0 },
              { label: 'Users', value: stats.users ?? 0 },
            ].map((item) => (
              <View
                key={item.label}
                style={{
                  flex: 1,
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderRadius: 12,
                  padding: 10,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '900' }}>{item.value}</Text>
                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: '600', marginTop: 2 }}>{item.label}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* Tab Navigation */}
        <View style={{
          flexDirection: 'row',
          marginHorizontal: 16,
          marginBottom: 16,
          backgroundColor: '#EFF3F8',
          borderRadius: 16,
          padding: 4,
        }}>
          <TabBtn label="Overview" icon={BarChart3} active={activePanel === 'overview'} onPress={() => setActivePanel('overview')} />
          <TabBtn label="Property" icon={Building2} active={activePanel === 'property'} onPress={() => setActivePanel('property')} />
          <TabBtn label="Blog" icon={BookOpen} active={activePanel === 'blog'} onPress={() => setActivePanel('blog')} />
          <TabBtn label="Leads" icon={Inbox} active={activePanel === 'leads'} onPress={() => setActivePanel('leads')} />
          <TabBtn label="Users" icon={Users} active={activePanel === 'users'} onPress={() => setActivePanel('users')} />
        </View>

        <View style={{ paddingHorizontal: 16, paddingBottom: 40 }}>

          {/* ── OVERVIEW ─────────────────────────────────────── */}
          {activePanel === 'overview' && (
            <>
              {/* Stat cards */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                <StatCard label="Total Properties" value={stats.properties} icon={Building2} bgColor="#EBF5FF" iconColor="#0c3854" />
                <StatCard label="Total Blogs" value={stats.blogs} icon={BookOpen} bgColor="#FFF4EB" iconColor="#E6761D" />
                <StatCard label="Total Leads" value={stats.contacts} icon={Inbox} bgColor="#F0FDF4" iconColor="#22C55E" />
                <StatCard label="Total Users" value={stats.users} icon={Users} bgColor="#FAF5FF" iconColor="#A855F7" />
              </View>

              {/* Business snapshot */}
              <View style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 18,
                padding: 18,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: '#F1F5F9',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.04,
                shadowRadius: 8,
                elevation: 2,
              }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TrendingUp size={18} color="#0c3854" />
                    <Text style={{ color: '#0c3854', fontWeight: '800', fontSize: 15, marginLeft: 8 }}>Business Snapshot</Text>
                  </View>
                  <TouchableOpacity
                    style={{ backgroundColor: '#F1F5F9', borderRadius: 10, padding: 8 }}
                    onPress={() => loadSummary(true)}
                  >
                    <RefreshCw size={14} color="#0c3854" />
                  </TouchableOpacity>
                </View>
                {[
                  { label: 'Available Properties', value: stats.availableProperties ?? 0 },
                  { label: 'Featured Properties', value: stats.featuredProperties ?? 0 },
                ].map((row) => (
                  <View key={row.label} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' }}>
                    <Text style={{ color: '#64748B', fontSize: 14 }}>{row.label}</Text>
                    <Text style={{ color: '#0c3854', fontWeight: '800', fontSize: 14 }}>{row.value}</Text>
                  </View>
                ))}
              </View>

              {/* Recent Properties */}
              <SectionCard title="Recent Properties" icon={Building2}>
                {(recent.properties || []).length === 0 ? (
                  <Text style={{ color: '#CBD5E1', textAlign: 'center', padding: 16 }}>No properties yet</Text>
                ) : (recent.properties || []).map((item: any) => (
                  <View key={item.property_code || item.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' }}>
                    <View style={{ flex: 1, paddingRight: 12 }}>
                      <Text style={{ color: '#1E293B', fontWeight: '700', fontSize: 14 }} numberOfLines={1}>{item.title}</Text>
                      <Text style={{ color: '#94A3B8', fontSize: 12, marginTop: 2 }}>{item.location} · {currency(item.price)}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => deleteProperty(item.property_code || item.id)}
                      style={{ backgroundColor: '#FEF2F2', borderRadius: 8, padding: 8 }}
                    >
                      <Trash2 size={14} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </SectionCard>

              {/* Recent Blogs */}
              <SectionCard title="Recent Blogs" icon={BookOpen}>
                {(recent.blogs || []).length === 0 ? (
                  <Text style={{ color: '#CBD5E1', textAlign: 'center', padding: 16 }}>No blogs yet</Text>
                ) : (recent.blogs || []).map((item: any) => (
                  <View key={item.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' }}>
                    <View style={{ flex: 1, paddingRight: 12 }}>
                      <Text style={{ color: '#1E293B', fontWeight: '700', fontSize: 14 }} numberOfLines={1}>{item.title}</Text>
                      <Text style={{ color: '#94A3B8', fontSize: 12, marginTop: 2 }}>{item.category} · {item.author}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => deleteBlog(item.id)}
                      style={{ backgroundColor: '#FEF2F2', borderRadius: 8, padding: 8 }}
                    >
                      <Trash2 size={14} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </SectionCard>

              {/* Recent Leads */}
              <SectionCard title="Latest Leads" icon={Inbox}>
                {(recent.contacts || []).length === 0 ? (
                  <Text style={{ color: '#CBD5E1', textAlign: 'center', padding: 16 }}>No leads yet</Text>
                ) : (recent.contacts || []).map((item: any) => (
                  <View key={item.id} style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' }}>
                    <Text style={{ color: '#1E293B', fontWeight: '700', fontSize: 14 }}>{item.name}</Text>
                    <Text style={{ color: '#94A3B8', fontSize: 12, marginTop: 2 }}>{item.email}</Text>
                    {item.subject && <Text style={{ color: '#64748B', fontSize: 12, marginTop: 2 }}>{item.subject}</Text>}
                    {(item.property_type || item.budget) && (
                      <Text style={{ color: '#94A3B8', fontSize: 12, marginTop: 2 }}>
                        {[item.property_type, item.budget].filter(Boolean).join(' · ')}
                      </Text>
                    )}
                  </View>
                ))}
              </SectionCard>
            </>
          )}

          {/* ── ADD PROPERTY ─────────────────────────────────── */}
          {activePanel === 'property' && (
            <View style={{ backgroundColor: '#FFFFFF', borderRadius: 18, padding: 18, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <Text style={{ color: '#0c3854', fontWeight: '800', fontSize: 18 }}>Add Property</Text>
                <View style={{ backgroundColor: completion >= 80 ? '#F0FDF4' : '#FFF4EB', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 }}>
                  <Text style={{ color: completion >= 80 ? '#22C55E' : '#E6761D', fontWeight: '700', fontSize: 12 }}>{completion}% ready</Text>
                </View>
              </View>

              {/* Progress bar */}
              <View style={{ height: 4, backgroundColor: '#F1F5F9', borderRadius: 2, marginBottom: 20 }}>
                <View style={{ height: 4, borderRadius: 2, backgroundColor: completion >= 80 ? '#22C55E' : '#E6761D', width: `${completion}%` }} />
              </View>

              <Field label="Title" value={propertyForm.title} placeholder="Residential 2BHK Apartment" onChangeText={(t: string) => setPropertyForm({ ...propertyForm, title: t })} />
              <Field label="Property Code" value={propertyForm.propertyCode} placeholder="REX0069" onChangeText={(t: string) => setPropertyForm({ ...propertyForm, propertyCode: t })} />
              <Field label="Location" value={propertyForm.location} placeholder="Wakad, Pune" onChangeText={(t: string) => setPropertyForm({ ...propertyForm, location: t })} />

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Field label="Price (₹)" value={propertyForm.price} placeholder="8500000" keyboardType="numeric" onChangeText={(t: string) => setPropertyForm({ ...propertyForm, price: t })} />
                </View>
                <View style={{ flex: 1 }}>
                  <Field label="Area (sqft)" value={propertyForm.carpetArea} placeholder="760" keyboardType="numeric" onChangeText={(t: string) => setPropertyForm({ ...propertyForm, carpetArea: t })} />
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Field label="Unit Type" value={propertyForm.unitType} onChangeText={(t: string) => setPropertyForm({ ...propertyForm, unitType: t })} />
                </View>
                <View style={{ flex: 1 }}>
                  <Field label="Subtype" value={propertyForm.subtype} onChangeText={(t: string) => setPropertyForm({ ...propertyForm, subtype: t })} />
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Field label="Beds" value={propertyForm.bedrooms} keyboardType="numeric" onChangeText={(t: string) => setPropertyForm({ ...propertyForm, bedrooms: t })} />
                </View>
                <View style={{ flex: 1 }}>
                  <Field label="Baths" value={propertyForm.bathrooms} keyboardType="numeric" onChangeText={(t: string) => setPropertyForm({ ...propertyForm, bathrooms: t })} />
                </View>
                <View style={{ flex: 1 }}>
                  <Field label="Parking" value={propertyForm.parking} keyboardType="numeric" onChangeText={(t: string) => setPropertyForm({ ...propertyForm, parking: t })} />
                </View>
              </View>

              <Field label="Image URL" value={propertyForm.imageUrl} placeholder="https://..." onChangeText={(t: string) => setPropertyForm({ ...propertyForm, imageUrl: t })} />
              <Field label="Amenities (comma separated)" value={propertyForm.amenities} placeholder="CCTV, Elevator, Parking" onChangeText={(t: string) => setPropertyForm({ ...propertyForm, amenities: t })} />
              <Field label="Description" value={propertyForm.description} multiline onChangeText={(t: string) => setPropertyForm({ ...propertyForm, description: t })} />

              <TouchableOpacity onPress={createProperty} disabled={saving} activeOpacity={0.85}>
                <LinearGradient
                  colors={saving ? ['#CBD5E1', '#CBD5E1'] : ['#E6761D', '#C95F0C']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', marginTop: 8 }}
                >
                  {saving ? <ActivityIndicator color="#fff" /> : (
                    <>
                      <Plus size={18} color="#fff" />
                      <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15, marginLeft: 8 }}>Save Property</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* ── ADD BLOG ──────────────────────────────────────── */}
          {activePanel === 'blog' && (
            <View style={{ backgroundColor: '#FFFFFF', borderRadius: 18, padding: 18, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
              <Text style={{ color: '#0c3854', fontWeight: '800', fontSize: 18, marginBottom: 18 }}>Publish Blog</Text>

              <Field label="Title" value={blogForm.title} placeholder="Real estate market update 2025" onChangeText={(t: string) => setBlogForm({ ...blogForm, title: t })} />
              <Field label="Excerpt" value={blogForm.excerpt} multiline placeholder="Short summary of the blog..." onChangeText={(t: string) => setBlogForm({ ...blogForm, excerpt: t })} />
              <Field label="Content" value={blogForm.content} multiline placeholder="Full blog content..." onChangeText={(t: string) => setBlogForm({ ...blogForm, content: t })} />

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Field label="Author" value={blogForm.author} onChangeText={(t: string) => setBlogForm({ ...blogForm, author: t })} />
                </View>
                <View style={{ flex: 1 }}>
                  <Field label="Category" value={blogForm.category} onChangeText={(t: string) => setBlogForm({ ...blogForm, category: t })} />
                </View>
              </View>

              <Field label="Image URL" value={blogForm.imageUrl} placeholder="https://..." onChangeText={(t: string) => setBlogForm({ ...blogForm, imageUrl: t })} />
              <Field label="Tags (comma separated)" value={blogForm.tags} placeholder="Legal, Finance, Pune" onChangeText={(t: string) => setBlogForm({ ...blogForm, tags: t })} />

              <TouchableOpacity onPress={createBlog} disabled={saving} activeOpacity={0.85}>
                <LinearGradient
                  colors={saving ? ['#CBD5E1', '#CBD5E1'] : ['#E6761D', '#C95F0C']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', marginTop: 8 }}
                >
                  {saving ? <ActivityIndicator color="#fff" /> : (
                    <>
                      <FileText size={18} color="#fff" />
                      <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15, marginLeft: 8 }}>Publish Blog</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* ── LEADS ─────────────────────────────────────────── */}
          {activePanel === 'leads' && (
            <SectionCard title={`All Leads (${leads.length})`} icon={Phone}>
              {leadsLoading ? (
                <ActivityIndicator color="#E6761D" style={{ padding: 20 }} />
              ) : leads.length === 0 ? (
                <Text style={{ color: '#CBD5E1', textAlign: 'center', padding: 20 }}>No leads found</Text>
              ) : leads.map((item: any) => (
                <View key={item.id} style={{ paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1, paddingRight: 10 }}>
                      <Text style={{ color: '#1E293B', fontWeight: '700', fontSize: 14 }}>{item.name}</Text>
                      <Text style={{ color: '#64748B', fontSize: 12, marginTop: 2 }}>{item.email}</Text>
                      {item.phone && <Text style={{ color: '#94A3B8', fontSize: 12, marginTop: 1 }}>{item.phone}</Text>}
                      {item.subject && (
                        <View style={{ backgroundColor: '#F8FAFC', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, marginTop: 6, alignSelf: 'flex-start' }}>
                          <Text style={{ color: '#64748B', fontSize: 11, fontWeight: '600' }}>{item.subject}</Text>
                        </View>
                      )}
                      {(item.property_type || item.budget) && (
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                          {item.property_type && (
                            <View style={{ backgroundColor: '#EBF5FF', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}>
                              <Text style={{ color: '#0c3854', fontSize: 11, fontWeight: '700' }}>{item.property_type}</Text>
                            </View>
                          )}
                          {item.budget && (
                            <View style={{ backgroundColor: '#FFF4EB', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}>
                              <Text style={{ color: '#E6761D', fontSize: 11, fontWeight: '700' }}>{item.budget}</Text>
                            </View>
                          )}
                        </View>
                      )}
                    </View>
                    <Text style={{ color: '#CBD5E1', fontSize: 11 }}>
                      {item.created_at ? new Date(item.created_at).toLocaleDateString('en-IN') : ''}
                    </Text>
                  </View>
                  {item.message && (
                    <Text style={{ color: '#94A3B8', fontSize: 12, marginTop: 6, lineHeight: 18 }} numberOfLines={2}>
                      {item.message}
                    </Text>
                  )}
                </View>
              ))}
            </SectionCard>
          )}

          {/* ── USERS ─────────────────────────────────────────── */}
          {activePanel === 'users' && (
            <SectionCard title={`All Users (${users.length})`} icon={Users}>
              {usersLoading ? (
                <ActivityIndicator color="#E6761D" style={{ padding: 20 }} />
              ) : users.length === 0 ? (
                <Text style={{ color: '#CBD5E1', textAlign: 'center', padding: 20 }}>No users found</Text>
              ) : users.map((item: any) => (
                <View key={item.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 10 }}>
                    <View style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      backgroundColor: item.role === 'admin' ? '#EBF5FF' : '#F1F5F9',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                    }}>
                      <Text style={{ fontSize: 16, fontWeight: '800', color: item.role === 'admin' ? '#0c3854' : '#94A3B8' }}>
                        {(item.name || 'U').charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={{ color: '#1E293B', fontWeight: '700', fontSize: 14 }} numberOfLines={1}>{item.name}</Text>
                        {item.role === 'admin' && (
                          <View style={{ backgroundColor: '#EBF5FF', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 }}>
                            <Text style={{ color: '#0c3854', fontSize: 10, fontWeight: '700' }}>ADMIN</Text>
                          </View>
                        )}
                      </View>
                      <Text style={{ color: '#94A3B8', fontSize: 12, marginTop: 2 }}>{item.email}</Text>
                    </View>
                  </View>
                  {item.id !== user?.id && (
                    <TouchableOpacity
                      onPress={() => deleteUser(item.id)}
                      style={{ backgroundColor: '#FEF2F2', borderRadius: 8, padding: 8 }}
                    >
                      <Trash2 size={14} color="#EF4444" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </SectionCard>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

// ─── Section Card Helper ──────────────────────────────────────────────────────
const SectionCard = ({ title, icon: Icon, children }: any) => (
  <View style={{
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
      <Icon size={18} color="#0c3854" />
      <Text style={{ color: '#0c3854', fontWeight: '800', fontSize: 15, marginLeft: 8 }}>{title}</Text>
    </View>
    {children}
  </View>
);

export default AdminDashboardScreen;
