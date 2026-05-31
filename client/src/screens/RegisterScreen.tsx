import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react-native';
import { authService } from '../services/api';

const RegisterScreen = ({ navigation, onRegistered, onLoginPress }: any) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'manager' | 'agent' | 'user'>('admin');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleRegister = async () => {
    if (!name || !email || !password) {
      shake();
      Alert.alert('Missing details', 'Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      shake();
      Alert.alert('Weak password', 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.register({ name, email, password, role });
      Alert.alert(
        'Account created! 🎉',
        response.data?.message || 'Registration successful',
        [{ text: 'Continue', onPress: () => onRegistered?.(response.data?.user) }]
      );
    } catch (error: any) {
      shake();
      Alert.alert('Registration failed', error?.response?.data?.message || 'Could not register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputBorderColor = (focused: boolean) => focused ? '#E6761D' : '#E2E8F0';
  const inputBg = (focused: boolean) => focused ? '#FFFBF7' : '#F8FAFC';

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={{ flex: 1, backgroundColor: '#F8FAFC' }}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Top gradient banner */}
        <LinearGradient
          colors={['#0c3854', '#1a5276', '#0c3854']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingTop: 60, paddingBottom: 60, paddingHorizontal: 24, alignItems: 'center' }}
        >
          <Image
            source={{ uri: 'https://resaleexpert.in/uploads/system/company_logo-1778756377340-827835566-Resale-Expert-Logo.png' }}
            style={{ width: 200, height: 50, marginBottom: 20 }}
            resizeMode="contain"
          />
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'rgba(230,118,29,0.18)',
            borderRadius: 24,
            paddingHorizontal: 14,
            paddingVertical: 6,
            marginBottom: 16,
          }}>
            <ShieldCheck size={14} color="#E6761D" />
            <Text style={{ color: '#E6761D', fontSize: 11, fontWeight: '700', marginLeft: 6, letterSpacing: 1 }}>
              CREATE ADMIN ACCOUNT
            </Text>
          </View>
          <Text style={{ color: '#FFFFFF', fontSize: 28, fontWeight: '900', textAlign: 'center', letterSpacing: -0.5 }}>
            Join ResaleExpert
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, textAlign: 'center', marginTop: 6 }}>
            Set up your dashboard administrator account
          </Text>
        </LinearGradient>

        {/* Card */}
        <Animated.View style={{
          transform: [{ translateX: shakeAnim }],
          marginHorizontal: 20,
          marginTop: -30,
          backgroundColor: '#FFFFFF',
          borderRadius: 24,
          padding: 24,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.1,
          shadowRadius: 24,
          elevation: 8,
          marginBottom: 30,
        }}>
          <Text style={{ fontSize: 20, fontWeight: '800', color: '#0c3854', marginBottom: 6 }}>
            Create Account
          </Text>
          <Text style={{ fontSize: 13, color: '#94A3B8', marginBottom: 20 }}>
            Fill in your details to register a new admin
          </Text>

          {/* Role Toggle */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 10, fontWeight: '700', color: '#64748B', letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' }}>
              Account Role
            </Text>
            <View style={{ flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 14, padding: 4 }}>
              {(['admin', 'manager', 'agent', 'user'] as const).map((item) => (
                <TouchableOpacity
                  key={item}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 11,
                    alignItems: 'center',
                    backgroundColor: role === item ? '#0c3854' : 'transparent',
                  }}
                  onPress={() => setRole(item)}
                  activeOpacity={0.8}
                >
                  <Text style={{
                    fontWeight: '700',
                    fontSize: 13,
                    textTransform: 'capitalize',
                    color: role === item ? '#FFFFFF' : '#64748B',
                  }}>
                    {item === 'admin' ? 'Admin' : item === 'manager' ? 'Manager' : item === 'agent' ? 'Agent' : 'User'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Name Field */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 10, fontWeight: '700', color: '#64748B', letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' }}>
              Full Name
            </Text>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: nameFocused ? 2 : 1,
              borderColor: inputBorderColor(nameFocused),
              borderRadius: 14,
              backgroundColor: inputBg(nameFocused),
              paddingHorizontal: 14,
              height: 52,
            }}>
              <User size={18} color={nameFocused ? '#E6761D' : '#94A3B8'} />
              <TextInput
                style={{ flex: 1, marginLeft: 10, fontSize: 15, color: '#1E293B', fontWeight: '500' }}
                placeholder="John Doe"
                placeholderTextColor="#CBD5E1"
                value={name}
                onChangeText={setName}
                onFocus={() => setNameFocused(true)}
                onBlur={() => setNameFocused(false)}
              />
            </View>
          </View>

          {/* Email Field */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 10, fontWeight: '700', color: '#64748B', letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' }}>
              Email Address
            </Text>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: emailFocused ? 2 : 1,
              borderColor: inputBorderColor(emailFocused),
              borderRadius: 14,
              backgroundColor: inputBg(emailFocused),
              paddingHorizontal: 14,
              height: 52,
            }}>
              <Mail size={18} color={emailFocused ? '#E6761D' : '#94A3B8'} />
              <TextInput
                style={{ flex: 1, marginLeft: 10, fontSize: 15, color: '#1E293B', fontWeight: '500' }}
                placeholder="admin@resaleexpert.in"
                placeholderTextColor="#CBD5E1"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
              />
            </View>
          </View>

          {/* Password Field */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 10, fontWeight: '700', color: '#64748B', letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' }}>
              Password
            </Text>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: passwordFocused ? 2 : 1,
              borderColor: inputBorderColor(passwordFocused),
              borderRadius: 14,
              backgroundColor: inputBg(passwordFocused),
              paddingHorizontal: 14,
              height: 52,
            }}>
              <Lock size={18} color={passwordFocused ? '#E6761D' : '#94A3B8'} />
              <TextInput
                style={{ flex: 1, marginLeft: 10, fontSize: 15, color: '#1E293B', fontWeight: '500' }}
                placeholder="Min. 6 characters"
                placeholderTextColor="#CBD5E1"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                {showPassword
                  ? <EyeOff size={18} color="#94A3B8" />
                  : <Eye size={18} color="#94A3B8" />
                }
              </TouchableOpacity>
            </View>
            {/* Password strength indicator */}
            {password.length > 0 && (
              <View style={{ flexDirection: 'row', gap: 4, marginTop: 8 }}>
                {[1, 2, 3, 4].map((level) => (
                  <View
                    key={level}
                    style={{
                      flex: 1,
                      height: 3,
                      borderRadius: 2,
                      backgroundColor: password.length >= level * 2
                        ? (password.length >= 8 ? '#22C55E' : password.length >= 5 ? '#F59E0B' : '#EF4444')
                        : '#E2E8F0',
                    }}
                  />
                ))}
              </View>
            )}
          </View>

          {/* Register Button */}
          <TouchableOpacity onPress={handleRegister} disabled={loading} activeOpacity={0.85}>
            <LinearGradient
              colors={loading ? ['#CBD5E1', '#CBD5E1'] : ['#E6761D', '#C95F0C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                height: 56,
                borderRadius: 16,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                shadowColor: '#E6761D',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: loading ? 0 : 0.35,
                shadowRadius: 12,
                elevation: 6,
              }}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16, letterSpacing: 0.3 }}>
                    Create Account
                  </Text>
                  <ArrowRight size={18} color="#fff" style={{ marginLeft: 8 }} />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Divider */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 20 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: '#F1F5F9' }} />
            <Text style={{ color: '#CBD5E1', fontSize: 12, marginHorizontal: 12 }}>ALREADY REGISTERED?</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: '#F1F5F9' }} />
          </View>

          {/* Login Link */}
          <TouchableOpacity
            style={{
              borderWidth: 1.5,
              borderColor: '#0c3854',
              height: 52,
              borderRadius: 16,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={() => onLoginPress ? onLoginPress() : navigation?.navigate('Login')}
            activeOpacity={0.8}
          >
            <Text style={{ color: '#0c3854', fontWeight: '700', fontSize: 15 }}>
              Sign In Instead
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;
