import { api, unwrap } from './client';

export type ProfileType = 'broker' | 'tenant';

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

export const authApi = {
  tenantSignup(body: {
    email: string;
    password: string;
    first_name: string;
    apellido_paterno: string;
    apellido_materno?: string;
    phone?: string;
    link_token?: string;
  }) {
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
