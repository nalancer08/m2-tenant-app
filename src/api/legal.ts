import { api, unwrap } from './client';

export type LegalDocumentType =
  | 'privacy_notice'
  | 'data_processing'
  | 'terms_conditions';

export interface LegalDocument {
  type: LegalDocumentType;
  version: string;
  title: string;
  effective_from: string;
  content: string;
  hash: string;
}

export type LegalCurrentResponse = Record<LegalDocumentType, LegalDocument>;

export const legalApi = {
  /**
   * Fetch the currently-active version of every legal document the tenant
   * must accept at signup. The frontend renders these texts in the consent
   * gate; on submit, each document's version + hash is sent back to
   * /auth/tenant/signup as proof of what the user saw.
   */
  current() {
    return unwrap<LegalCurrentResponse>(api.get('/legal/current'));
  },
};
