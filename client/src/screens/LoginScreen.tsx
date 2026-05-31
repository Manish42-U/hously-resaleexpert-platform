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
import { Eye, EyeOff, Mail, Lock, ShieldCheck, ArrowRight } from 'lucide-react-native';
import { authService } from '../services/api';

const LoginScreen = ({ onLogin }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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

  const handleLogin = async () => {
    if (!email || !password) {
      shake();
      Alert.alert('Missing details', 'Please enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.login({ email, password });
      const user = response.data?.user;

      if (!['admin', 'manager', 'agent'].includes(user?.role)) {
        shake();
        Alert.alert('Access required', 'This panel is for admin, manager and agent accounts only.');
        return;
      }

      onLogin?.(user);
    } catch (error: any) {
      shake();
      Alert.alert('Login failed', error?.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
              ADMIN ACCESS ONLY
            </Text>
          </View>
          <Text style={{ color: '#FFFFFF', fontSize: 28, fontWeight: '900', textAlign: 'center', letterSpacing: -0.5 }}>
            Welcome Back
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, textAlign: 'center', marginTop: 6 }}>
            Sign in to manage your ResaleExpert dashboard
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
            Admin Login
          </Text>
          <Text style={{ fontSize: 13, color: '#94A3B8', marginBottom: 24 }}>
            Manage properties, blogs, leads and users
          </Text>

          {/* Email Field */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 10, fontWeight: '700', color: '#64748B', letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' }}>
              Email Address
            </Text>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: emailFocused ? 2 : 1,
              borderColor: emailFocused ? '#E6761D' : '#E2E8F0',
              borderRadius: 14,
              backgroundColor: emailFocused ? '#FFFBF7' : '#F8FAFC',
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
              borderColor: passwordFocused ? '#E6761D' : '#E2E8F0',
              borderRadius: 14,
              backgroundColor: passwordFocused ? '#FFFBF7' : '#F8FAFC',
              paddingHorizontal: 14,
              height: 52,
            }}>
              <Lock size={18} color={passwordFocused ? '#E6761D' : '#94A3B8'} />
              <TextInput
                style={{ flex: 1, marginLeft: 10, fontSize: 15, color: '#1E293B', fontWeight: '500' }}
                placeholder="••••••••"
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
          </View>

          {/* Login Button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
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
                    Sign In to Dashboard
                  </Text>
                  <ArrowRight size={18} color="#fff" style={{ marginLeft: 8 }} />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Footer note */}
          <Text style={{ textAlign: 'center', color: '#CBD5E1', fontSize: 12, marginTop: 20, lineHeight: 18 }}>
            Protected by ResaleExpert Security.{'\n'}Unauthorized access is prohibited.
          </Text>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
