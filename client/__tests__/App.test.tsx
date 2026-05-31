/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

jest.mock('react-native', () => {
  return {
    AccessibilityInfo: {
      addEventListener: jest.fn(() => ({remove: jest.fn()})),
      isReduceMotionEnabled: jest.fn(() => Promise.resolve(false)),
    },
    ActivityIndicator: 'ActivityIndicator',
    Appearance: {
      addChangeListener: jest.fn(() => ({remove: jest.fn()})),
      getColorScheme: jest.fn(() => 'light'),
    },
    AppState: {
      addEventListener: jest.fn(() => ({remove: jest.fn()})),
      currentState: 'active',
    },
    Dimensions: {
      addEventListener: jest.fn(() => ({remove: jest.fn()})),
      get: jest.fn(() => ({fontScale: 1, height: 800, scale: 1, width: 400})),
    },
    Linking: {openURL: jest.fn()},
    NativeModules: {SourceCode: {scriptURL: 'http://localhost:8081/index.bundle'}},
    Platform: {select: (options: any) => options.default || options.ios},
    Text: 'Text',
    TouchableOpacity: 'TouchableOpacity',
    View: 'View',
  };
});

jest.mock('../src/navigation/AppNavigator', () => {
  return function MockAppNavigator() {
    return null;
  };
});

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({children}: {children: React.ReactNode}) => <>{children}</>,
}));

beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({
    json: jest.fn().mockResolvedValue({data: {maintenanceMode: false}}),
  }) as any;
});

test('renders correctly', async () => {
  await ReactTestRenderer.act(async () => {
    ReactTestRenderer.create(<App />);
  });
});
