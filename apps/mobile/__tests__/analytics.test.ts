import { __resetAnalyticsForTests, identify, track, trackScreen } from '@/lib/analytics';

describe('analytics wrapper', () => {
  beforeEach(() => {
    jest.resetModules();
    __resetAnalyticsForTests();
  });

  test('is a silent no-op when the native Firebase module is unavailable (Expo Go)', () => {
    jest.doMock('@react-native-firebase/analytics', () => {
      throw new Error('Native module RNFBAppModule not found');
    });
    expect(() => {
      track('login', { method: 'password' });
      trackScreen('wallet');
      identify('user-1');
    }).not.toThrow();
  });

  test('forwards events, screen views and the user id to Firebase', () => {
    const logEvent = jest.fn().mockResolvedValue(undefined);
    const setUserId = jest.fn().mockResolvedValue(undefined);
    jest.doMock('@react-native-firebase/analytics', () => ({
      getAnalytics: () => 'instance',
      logEvent,
      setUserId,
    }));
    track('purchase', { currency: 'INR', value: 525 });
    trackScreen('history');
    identify('user-1');
    identify(null);
    expect(logEvent).toHaveBeenCalledWith('instance', 'purchase', { currency: 'INR', value: 525 });
    expect(logEvent).toHaveBeenCalledWith('instance', 'screen_view', { screen_name: 'history', screen_class: 'history' });
    expect(setUserId).toHaveBeenNthCalledWith(1, 'instance', 'user-1');
    expect(setUserId).toHaveBeenNthCalledWith(2, 'instance', null);
  });

  test('a rejected Firebase call never surfaces as an unhandled rejection', async () => {
    jest.doMock('@react-native-firebase/analytics', () => ({
      getAnalytics: () => 'instance',
      logEvent: jest.fn().mockRejectedValue(new Error('network')),
      setUserId: jest.fn(),
    }));
    expect(() => track('x')).not.toThrow();
    await new Promise((r) => setTimeout(r, 0));
  });
});
