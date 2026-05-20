import { api, unwrap } from './client';
import type { LegalDocumentType } from './legal';

export type ProfileType = 'broker' | 'tenant' | 'admin';

export interface AuthResponse {
  access_token: string;
  user: { id: string; email: string; email_verified: boolean };
  profile_type: ProfileType;
  profile_id: string;
}

export interface MeResponse {
  user: {
    id: string;
    email: string;
    email_verified: boolean;
    phone?: string | null;
  };
  profile_type: ProfileType;
  profile: Record<string, unknown>;
}

export interface TenantSignupConsent {
  document_type: LegalDocumentType;
  version: string;
  hash: string;
}

export interface TenantSignupBody {
  email: string;
  password: string;
  /** Mandatory — tenants can only sign up via a broker invitation link. */
  link_token: string;
  /** All 3 legal documents must be accepted (privacy, data, terms). */
  consents: TenantSignupConsent[];
  /** Browser fingerprint metadata (optional) — extra audit evidence. */
  consent_metadata?: Record<string, unknown>;
}

export const authApi = {
  tenantSignup(body: TenantSignupBody) {
    return unwrap<AuthResponse>(api.post('/auth/tenant/signup', body));
  },
  tenantLogin(body: { email: string; password: string }) {
    return unwrap<AuthResponse>(api.post('/auth/tenant/login', body));
  },
  forgotPassword(email: string) {
    return unwrap<{ sent: true }>(api.post('/auth/forgot-password', { email }));
  },
  me() {
    return unwrap<MeResponse>(api.get('/me'));
  },
};
