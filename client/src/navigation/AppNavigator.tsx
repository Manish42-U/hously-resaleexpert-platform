import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import LandingPage from '../screens/LandingPage';
import RealEstate from '../screens/RealEstate';

export type RootStackParamList = {
  Landing: undefined;
  RealEstate: { initialTab?: string } | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const initialTabByPath: Record<string, string> = {
    '/home': 'Home',
    '/properties': 'Properties',
    '/services': 'Services',
    '/about': 'About',
    '/blogs': 'Blogs',
    '/contact': 'Contact',
    '/post-property': 'PostProperty',
  };
  const pathname = (globalThis as any)?.location?.pathname || '/';
  const initialTab = initialTabByPath[pathname.toLowerCase()];
  const initialRouteName: keyof RootStackParamList = initialTab ? 'RealEstate' : 'Landing';

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName={initialRouteName}
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#FFFFFF' }
        }}
      >
        <Stack.Screen name="Landing" component={LandingPage} />
        <Stack.Screen name="RealEstate" component={RealEstate} initialParams={{ initialTab }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
