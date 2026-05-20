import { api, unwrap } from './client';

// ─── Enums (mirror backend) ──────────────────────────────────────────

export type RegimenFiscal = 'fisica' | 'moral';
export type Gender = 'masculino' | 'femenino' | 'no_binario' | 'prefiero_no_decir';
export type EducationLevel =
  | 'sin_estudios'
  | 'primaria'
  | 'secundaria'
  | 'preparatoria'
  | 'tecnica'
  | 'licenciatura'
  | 'maestria'
  | 'doctorado';
export type CivilStatus =
  | 'soltero'
  | 'casado'
  | 'union_libre'
  | 'divorciado'
  | 'viudo';
export type LivingSituation = 'rentado' | 'propio' | 'familiar' | 'otro';
export type EmploymentStatus =
  | 'empleado'
  | 'dueno_negocio'
  | 'independiente'
  | 'jubilado'
  | 'desempleado'
  | 'estudiante';
export type IncomeSource =
  | 'nomina'
  | 'mixto'
  | 'honorarios'
  | 'dividendos'
  | 'efectivo'
  | 'ayuda_familiar'
  | 'pension_retiro'
  | 'rentas'
  | 'otro';

// ─── Row shapes (mirror backend entities, only fields we read) ────────

export interface TenantRow {
  id: string;
  user_id: string;
  first_name?: string | null;
  apellido_paterno?: string | null;
  apellido_materno?: string | null;
  regimen_fiscal?: RegimenFiscal | null;
  nationality?: string | null;
  place_of_birth_state?: string | null;
  place_of_birth_country?: string | null;
  gender?: Gender | null;
  curp?: string | null;
  rfc?: string | null;
  passport_number?: string | null;
  ssn_or_foreign_id?: string | null;
  date_of_birth?: string | null;
  education_level?: EducationLevel | null;
  civil_status?: CivilStatus | null;
  minor_children_count?: number | null;
  has_pets: boolean;
  pets_detail?: string | null;
  is_smoker: boolean;
  prior_eviction_disclosed: boolean;
  prior_legal_issues_disclosed: boolean;
  wizard_step: number;
  wizard_completed: boolean;
}

export interface TenantAddressRow {
  id: string;
  street: string;
  exterior_number?: string | null;
  interior_number?: string | null;
  neighborhood?: string | null;
  municipality?: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  living_situation?: LivingSituation | null;
  time_at_address_months?: number | null;
  current_landlord_name?: string | null;
  current_landlord_phone?: string | null;
}

export interface TenantEmploymentRow {
  id: string;
  regime?: string | null;
  employment_status?: EmploymentStatus | null;
  industry?: string | null;
  occupation?: string | null;
  company_name?: string | null;
  position?: string | null;
  company_website?: string | null;
  work_address?: string | null;
  tenure_months?: number | null;
  income_source?: IncomeSource | null;
  income_source_other?: string | null;
  monthly_net_income_cents?: string | number | null;
  hr_contact_name?: string | null;
  hr_phone?: string | null;
  hr_email?: string | null;
  buro_consent: boolean;
  buro_consent_at?: string | null;
}

export interface TenantReferenceRow {
  id: string;
  full_name: string;
  phone: string;
  relation?: string | null;
  kind: string;
}

export interface TenantRoommateRow {
  id: string;
  deal_id: string;
  full_name: string;
  phone: string;
  invited: boolean;
}

export interface DealRowForTenant {
  id: string;
  folio: string;
  status: string;
  link_token: string;
  property: {
    id: string;
    street: string;
    exterior_number?: string | null;
    interior_number?: string | null;
    neighborhood?: string | null;
    municipality?: string | null;
    city: string;
    state: string;
    postal_code: string;
  } | null;
}

export type DocumentType =
  | 'ine_front'
  | 'ine_back'
  | 'selfie'
  | 'passport'
  | 'payslip'
  | 'bank_statement'
  | 'proof_of_address'
  | 'tax_return'
  | 'acta_constitutiva'
  | 'poder_notarial'
  | 'constancia_fiscal'
  | 'opinion_cumplimiento'
  | 'additional'
  | 'other';

export interface TenantDocumentRow {
  id: string;
  tenant_id: string;
  type: DocumentType;
  file_name: string;
  file_url: string;
  file_size?: number | null;
  mime_type?: string | null;
  has_password: boolean;
  notes?: string | null;
  verified: boolean;
  created_at: string;
}

export interface FullTenantResponse {
  tenant: TenantRow;
  current_address: TenantAddressRow | null;
  current_employment: TenantEmploymentRow | null;
  references: TenantReferenceRow[];
  consents: unknown[];
  documents: TenantDocumentRow[];
  roommates: TenantRoommateRow[];
  deals: DealRowForTenant[];
}

// ─── Patch / replace payloads ────────────────────────────────────────

export interface ProfilePatchBody {
  regimen_fiscal?: RegimenFiscal;
  first_name?: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  nationality?: string;
  place_of_birth_state?: string;
  place_of_birth_country?: string;
  gender?: Gender;
  curp?: string;
  rfc?: string;
  passport_number?: string;
  ssn_or_foreign_id?: string;
  date_of_birth?: string;
  education_level?: EducationLevel;
  civil_status?: CivilStatus;
  minor_children_count?: number;
  has_pets?: boolean;
  pets_detail?: string;
  is_smoker?: boolean;
  prior_eviction_disclosed?: boolean;
  prior_legal_issues_disclosed?: boolean;
  wizard_step?: number;
  wizard_completed?: boolean;
}

export interface AddressPatchBody {
  street?: string;
  exterior_number?: string;
  interior_number?: string;
  neighborhood?: string;
  municipality?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  living_situation?: LivingSituation;
  time_at_address_months?: number;
  current_landlord_name?: string;
  current_landlord_phone?: string;
}

export interface EmploymentPatchBody {
  employment_status?: EmploymentStatus;
  industry?: string;
  occupation?: string;
  company_name?: string;
  position?: string;
  company_website?: string;
  work_address?: string;
  tenure_months?: number;
  income_source?: IncomeSource;
  income_source_other?: string;
  monthly_net_income_cents?: number;
  hr_contact_name?: string;
  hr_phone?: string;
  hr_email?: string;
  buro_consent?: boolean;
}

export interface ReferencesReplaceBody {
  references: { full_name: string; phone: string; relation?: string }[];
}

export interface RoommatesReplaceBody {
  deal_id: string;
  roommates: { full_name: string; phone: string }[];
}

// ─── Client ──────────────────────────────────────────────────────────

export interface DocumentUploadParams {
  file: File;
  type: DocumentType;
  /**
   * Flag-only signal that the PDF is password-protected. We deliberately
   * never send / store the password itself — the investigation team
   * contacts the tenant out-of-band when they need to open the file.
   */
  has_password?: boolean;
  notes?: string;
  onProgress?: (loadedRatio: number) => void;
}

export interface DocumentPatchBody {
  has_password?: boolean;
  notes?: string;
}

export const tenantMeApi = {
  full: () => unwrap<FullTenantResponse>(api.get('/tenant/me/full')),
  patchProfile: (body: ProfilePatchBody) =>
    unwrap<TenantRow>(api.patch('/tenant/me/profile', body)),
  patchAddress: (body: AddressPatchBody) =>
    unwrap<TenantAddressRow>(api.patch('/tenant/me/address', body)),
  patchEmployment: (body: EmploymentPatchBody) =>
    unwrap<TenantEmploymentRow>(api.patch('/tenant/me/employment', body)),
  replaceReferences: (body: ReferencesReplaceBody) =>
    unwrap<TenantReferenceRow[]>(api.put('/tenant/me/references', body)),
  replaceRoommates: (body: RoommatesReplaceBody) =>
    unwrap<TenantRoommateRow[]>(api.put('/tenant/me/roommates', body)),

  /**
   * Multipart upload of a single document. Builds the FormData explicitly
   * so axios sets the right boundary + emits progress events the wizard
   * can show in real time.
   */
  uploadDocument({
    file,
    type,
    has_password,
    notes,
    onProgress,
  }: DocumentUploadParams): Promise<TenantDocumentRow> {
    const form = new FormData();
    form.append('file', file);
    form.append('type', type);
    if (has_password) form.append('has_password', 'true');
    if (notes) form.append('notes', notes);
    return unwrap<TenantDocumentRow>(
      api.post('/tenant/me/documents', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (onProgress && e.total) onProgress(e.loaded / e.total);
        },
      }),
    );
  },
  deleteDocument: (id: string) =>
    unwrap<{ deleted: true }>(api.delete(`/tenant/me/documents/${id}`)),
  patchDocument: (id: string, body: DocumentPatchBody) =>
    unwrap<TenantDocumentRow>(api.patch(`/tenant/me/documents/${id}`, body)),
};
