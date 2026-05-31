import React, { useEffect, useState } from 'react';
import './global.css';
import AppNavigator from './src/navigation/AppNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ActivityIndicator, Linking, Text, TouchableOpacity, View } from 'react-native';
import { API_URL, subscribeToMaintenance } from './src/services/api';
import { COLORS } from './src/styles/theme';

type PlatformStatus = {
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  companyName?: string;
  supportEmail?: string;
  supportPhone?: string;
};

const MaintenanceScreen = ({ status, onRetry }: { status: PlatformStatus; onRetry: () => void }) => {
  const supportPhone = status.supportPhone?.replace(/\s/g, '');
  const supportEmail = status.supportEmail;

  return (
    <View style={{ flex: 1, backgroundColor: '#071F2F', justifyContent: 'center', padding: 22 }}>
      <View style={{ position: 'absolute', top: -70, right: -60, width: 190, height: 190, borderRadius: 95, backgroundColor: 'rgba(230,118,29,0.22)' }} />
      <View style={{ position: 'absolute', bottom: -80, left: -70, width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(34,197,94,0.13)' }} />

      <View style={{ width: '100%', maxWidth: 480, alignSelf: 'center', backgroundColor: '#FFFFFF', borderRadius: 28, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}>
        <View style={{ backgroundColor: COLORS.primary, padding: 22 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: '900' }}>
                {status.companyName || 'Hously Finntech Realty'}
              </Text>
              <Text style={{ color: '#CBE7F5', fontSize: 12, fontWeight: '800', marginTop: 5, letterSpacing: 0.8, textTransform: 'uppercase' }}>
                Platform service window
              </Text>
            </View>
            <View style={{ width: 54, height: 54, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 4, borderColor: '#E6761D' }} />
            </View>
          </View>
        </View>

        <View style={{ padding: 24 }}>
          <View style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FFF7ED', borderColor: '#FED7AA', borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#E6761D' }} />
            <Text style={{ color: '#C2410C', fontSize: 11, fontWeight: '900', textTransform: 'uppercase' }}>Maintenance active</Text>
          </View>

          <Text style={{ color: COLORS.primary, fontSize: 28, fontWeight: '900', lineHeight: 34, marginTop: 18 }}>
            App abhi upgrade ho raha hai.
          </Text>
          <Text style={{ color: COLORS.textSecondary, fontSize: 14, lineHeight: 23, marginTop: 12 }}>
            {status.maintenanceMessage || 'We are improving listings, CRM and dashboard services. Please try again shortly.'}
          </Text>

          <View style={{ marginTop: 18, borderRadius: 18, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', padding: 14 }}>
            <Text style={{ color: '#64748B', fontSize: 11, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.6 }}>What still works</Text>
            <Text style={{ color: '#0F172A', fontSize: 13, lineHeight: 21, marginTop: 7, fontWeight: '700' }}>
              Admin team backend se maintenance off karegi, fir app automatically open ho jayega.
            </Text>
          </View>

          <TouchableOpacity onPress={onRetry} activeOpacity={0.85} style={{ backgroundColor: COLORS.primary, borderRadius: 16, paddingVertical: 14, marginTop: 22 }}>
            <Text style={{ color: '#FFFFFF', fontWeight: '900', textAlign: 'center' }}>Check Again</Text>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
            {!!supportPhone && (
              <TouchableOpacity onPress={() => Linking.openURL(`tel:${supportPhone}`)} style={{ flex: 1, paddingVertical: 12, borderRadius: 14, backgroundColor: '#F1F5F9' }}>
                <Text style={{ color: COLORS.primary, fontWeight: '900', textAlign: 'center', fontSize: 12 }}>Call Support</Text>
              </TouchableOpacity>
            )}
            {!!supportEmail && (
              <TouchableOpacity onPress={() => Linking.openURL(`mailto:${supportEmail}`)} style={{ flex: 1, paddingVertical: 12, borderRadius: 14, backgroundColor: '#F1F5F9' }}>
                <Text style={{ color: COLORS.primary, fontWeight: '900', textAlign: 'center', fontSize: 12 }}>Email Support</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

export default function App() {
  const [status, setStatus] = useState<PlatformStatus | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);

  const checkPlatformStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/status`);
      const json = await response.json();
      setStatus(json.data || { maintenanceMode: false });
    } catch {
      setStatus({ maintenanceMode: false });
    } finally {
      setCheckingStatus(false);
    }
  };

  useEffect(() => {
    const unsubscribe = subscribeToMaintenance((nextStatus) => {
      setStatus((current) => ({ ...current, ...nextStatus, maintenanceMode: true }));
      setCheckingStatus(false);
    });

    checkPlatformStatus().finally(() => setCheckingStatus(false));
    const interval = process.env.NODE_ENV === 'test'
      ? undefined
      : setInterval(checkPlatformStatus, 15000);

    return () => {
      unsubscribe();
      if (interval) clearInterval(interval);
    };
  }, []);

  if (checkingStatus) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC' }}>
          <ActivityIndicator color={COLORS.secondary} />
        </View>
      </SafeAreaProvider>
    );
  }

  if (status?.maintenanceMode) {
    return (
      <SafeAreaProvider>
        <MaintenanceScreen status={status} onRetry={checkPlatformStatus} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  );
}
