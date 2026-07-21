export interface RazorpayConfig {
  keyId?: string;
  keySecret?: string;
  enabled: boolean;
  mode: 'mock' | 'live';
}

export const getRazorpayConfig = (): RazorpayConfig => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const enabled = Boolean(keyId && keySecret);

  return {
    keyId,
    keySecret,
    enabled,
    mode: enabled ? 'live' : 'mock'
  };
};
