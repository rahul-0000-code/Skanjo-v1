export interface ApiKeyRequest {
  email: string;
  adminUsername: string;
  adminPassword: string;
}

export interface ApiKeyResponse {
  api_key: string;
  message?: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  company_name: string;
  position: string;
  password: string;
}

export interface RegisterResponse {
  id: number;
  name: string;
  email: string;
  phone: string;
  company_name: string;
  position: string;
  api_key: string;
  is_active: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  id: number;
  name: string;
  email: string;
  phone: string;
  company_name: string;
  position: string;
  api_key: string;
  is_active: boolean;
}

export interface UpdateUserProfileRequest {
  industry: string;
  company_size: string;
  country: string;
  job_title: string;
  website: string;
  linkedin_url: string;
  how_did_you_hear: string;
  interested_features: string;
  marketing_opt_in: boolean;
}

export interface UpdateUserProfileResponse {
  success: boolean;
  message?: string;
}

export interface UserAnalyticsItem {
  endpoint: string;
  request_data: string;
  response_data: string;
  status_code: number;
  timestamp: string;
}

export interface CreateFeatureKeyRequest {
  scopes: string[];
}

export interface CreateFeatureKeyResponse {
  feature_key: string;
  message?: string;
}

export interface SubscriptionRequest {
  plan: string; // 'free', 'pro', or 'enterprise'
}

export interface PaymentOrderResponse {
  order_id: string;
  payment_url?: string;
  order_amount: number;
  order_currency: string;
  payment_session_id?: string;
  message?: string;
  skip_payment?: boolean;
  subscription_id?: number;
  key_id?: string; 
}

export interface PaymentStatusResponse {
  order_id: string;
  status: string; // 'pending', 'success', 'failed', 'cancelled'
  amount: number;
  plan: string;
  payment_id?: string;
  created_at: string;
  updated_at?: string;
}

export interface SubscriptionResponse {
  plan: string;
  status: string;
  start_date: string;
  end_date: string;
  usage_summary: Record<string, any>;
}

const API_BASE_URL = "https://screening-api.skanjo.com";
const LOCAL_API_BASE_URL = "http://localhost:8000";

export const createApiKey = async ({
  email,
  adminUsername,
  adminPassword,
}: ApiKeyRequest): Promise<ApiKeyResponse> => {
  const authString = btoa(`${adminUsername}:${adminPassword}`);

  const response = await fetch(`${API_BASE_URL}/add-client`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${authString}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ client_email: email }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "API key creation failed");
  }

  return data;
};

export async function registerUser(
  data: RegisterRequest
): Promise<RegisterResponse> {
  const response = await fetch(`${LOCAL_API_BASE_URL}/api/v1/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Registration failed");
  }
  return result;
}

export async function loginUser(data: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${LOCAL_API_BASE_URL}/api/v1/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Login failed");
  }
  return result;
}

export async function updateUserProfile(
  apiKey: string,
  data: UpdateUserProfileRequest
): Promise<UpdateUserProfileResponse> {
  const response = await fetch(`${LOCAL_API_BASE_URL}/api/v1/users/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Profile update failed");
  }
  return result;
}

export async function getUserAnalytics(
  apiKey: string
): Promise<UserAnalyticsItem[]> {
  const response = await fetch(`${LOCAL_API_BASE_URL}/api/v1/users/analytics`, {
    headers: {
      "x-api-key": apiKey,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch analytics");
  }
  return await response.json();
}

export async function createFeatureKey(
  apiKey: string, 
  scopes?: string[], 
  plan: string = 'free'
): Promise<CreateFeatureKeyResponse> {
  const envScopes = typeof import.meta !== 'undefined' && import.meta.env.VITE_FEATURE_KEY_SCOPES
    ? JSON.parse(import.meta.env.VITE_FEATURE_KEY_SCOPES)
    : ["enhance_jd", "extract_and_match_jd_cv"];
  const bodyScopes = scopes || envScopes;
  const url = `${LOCAL_API_BASE_URL}/api/v1/users/feature-key?plan=${encodeURIComponent(plan)}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ scopes: bodyScopes }),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Feature key creation failed');
  }
  return result;
}

export async function getSubscription(apiKey: string): Promise<SubscriptionResponse> {
  const response = await fetch(`${LOCAL_API_BASE_URL}/api/v1/users/subscription`, {
    method: 'GET',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
    },
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.detail || 'Failed to get subscription');
  }
  return result;
}

export async function createSubscription(
  apiKey: string,
  plan: string
): Promise<PaymentOrderResponse> {
  const response = await fetch(`${LOCAL_API_BASE_URL}/api/v1/users/create-order`, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ plan: plan.toLowerCase() }),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.detail || 'Subscription creation failed');
  }
  return {
    order_id: result.order_id,
    order_amount: result.amount,
    order_currency: result.currency,
    key_id: result.key_id,
    skip_payment: result.skip_payment,
    message: result.message,
    subscription_id: result.subscription_id,
  };
}

export async function getPaymentStatus(
  apiKey: string,
  orderId: string
): Promise<PaymentStatusResponse> {
  const response = await fetch(`${LOCAL_API_BASE_URL}/api/v1/users/payment-status/${orderId}`, {
    method: 'GET',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
    },
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.detail || 'Failed to get payment status');
  }
  return result;
}

export async function cancelPayment(
  apiKey: string,
  orderId: string
): Promise<{ success: boolean; message?: string }> {
  const response = await fetch(`${LOCAL_API_BASE_URL}/api/v1/users/cancel-payment/${orderId}`, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
    },
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.detail || 'Failed to cancel payment');
  }
  return result;
}