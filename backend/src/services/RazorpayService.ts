export interface RazorpayConfig {
  keyId?: string;
  keySecret?: string;
  enabled: boolean;
  mode: 'test' | 'live' | 'mock';
  isTestMode: boolean;
  isProductionMode: boolean;
}

export const getRazorpayConfig = (): RazorpayConfig => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const enabled = Boolean(keyId && keySecret);

  const isTestKey = Boolean(keyId && keyId.startsWith('rzp_test_'));
  const isLiveKey = Boolean(keyId && keyId.startsWith('rzp_live_'));

  let mode: RazorpayConfig['mode'] = 'mock';
  if (enabled) {
    mode = isTestKey ? 'test' : isLiveKey ? 'live' : 'test';
  }

  return {
    keyId,
    keySecret,
    enabled,
    mode,
    isTestMode: mode === 'test',
    isProductionMode: mode === 'live'
  };
};
