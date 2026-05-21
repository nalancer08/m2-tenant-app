import type {
  CivilStatus,
  EducationLevel,
  EmploymentStatus,
  FullTenantResponse,
  Gender,
  IncomeSource,
  LivingSituation,
  RegimenFiscal,
  TenantDocumentRow,
} from '../../api/tenant-me';

/**
 * Tenant wizard state machine. Single in-memory source of truth for the
 * form. Persistence is the WizardShell's job — it PATCHes the relevant
 * server endpoint on every "Siguiente". HYDRATE seeds from
 * /tenant/me/full so a tenant can resume where they left off.
 *
 * Why one big state vs per-step state: the dependencies between steps
 * are real (nationality_kind in step 3 drives which fields are required;
 * living_situation in step 6 drives whether landlord contact shows; etc.).
 * Centralizing keeps validation in `canAdvance` simple.
 */

export type NationalityKind = 'mexicana' | 'otra';
export type HasCurp = 'si' | 'no';

export interface RoommateInput {
  full_name: string;
  phone: string;
}

export interface ReferenceInput {
  full_name: string;
  phone: string;
  relation: string;
}

export interface AddressInput {
  street: string;
  exterior_number: string;
  interior_number: string;
  neighborhood: string;
  municipality: string;
  city: string;
  state: string;
  postal_code: string;
}

export interface WizardState {
  step: number; // 1..7
  // Linked deal — the wizard always runs in the context of one deal
  // (the one the broker invited us into). Captured at hydrate time.
  deal_id: string | null;

  // Step 1 — Régimen fiscal
  regimen_fiscal: RegimenFiscal | null;

  // Step 2 — Roomies
  divides_rent: boolean | null;
  roommates: RoommateInput[];

  // Step 3 — Datos personales (con bifurcación mex/ext)
  nationality_kind: NationalityKind | null;
  has_curp: HasCurp | null;
  first_name: string;
  apellido_paterno: string;
  apellido_materno: string;
  date_of_birth: string; // YYYY-MM-DD
  place_of_birth_state: string; // estado MX o ""
  place_of_birth_country: string;
  nationality: string;
  gender: Gender | null;
  curp: string;
  rfc: string;
  passport_number: string;
  ssn_or_foreign_id: string;

  // Step 4 — Referencias
  references: ReferenceInput[];

  // Step 5 — Historial + auto-declaración
  education_level: EducationLevel | null;
  civil_status: CivilStatus | null;
  minor_children_count: number | null;
  has_pets: boolean;
  pets_detail: string;
  is_smoker: boolean;
  prior_eviction_disclosed: boolean;
  prior_legal_issues_disclosed: boolean;

  // Step 6 — Domicilio actual
  living_situation: LivingSituation | null;
  address: AddressInput;
  time_at_address_months: number | null;
  current_landlord_name: string;
  current_landlord_phone: string;

  // Step 7 — Trabajo + ingresos + buró
  employment_status: EmploymentStatus | null;
  industry: string;
  occupation: string;
  company_name: string;
  position: string;
  company_website: string;
  work_address: string;
  tenure_months: number | null;
  income_source: IncomeSource | null;
  income_source_other: string;
  monthly_net_income_cents: number | null;
  hr_contact_name: string;
  hr_phone: string;
  buro_consent: boolean;

  // Step 8 — Documentos
  documents: TenantDocumentRow[];
  document_notes: string;
}

export const TOTAL_STEPS = 9;

export const initialState: WizardState = {
  step: 1,
  deal_id: null,
  regimen_fiscal: null,
  divides_rent: null,
  roommates: [],
  nationality_kind: null,
  has_curp: null,
  first_name: '',
  apellido_paterno: '',
  apellido_materno: '',
  date_of_birth: '',
  place_of_birth_state: '',
  place_of_birth_country: '',
  nationality: '',
  gender: null,
  curp: '',
  rfc: '',
  passport_number: '',
  ssn_or_foreign_id: '',
  references: [],
  education_level: null,
  civil_status: null,
  minor_children_count: null,
  has_pets: false,
  pets_detail: '',
  is_smoker: false,
  prior_eviction_disclosed: false,
  prior_legal_issues_disclosed: false,
  living_situation: null,
  address: {
    street: '',
    exterior_number: '',
    interior_number: '',
    neighborhood: '',
    municipality: '',
    city: '',
    state: '',
    postal_code: '',
  },
  time_at_address_months: null,
  current_landlord_name: '',
  current_landlord_phone: '',
  employment_status: null,
  industry: '',
  occupation: '',
  company_name: '',
  position: '',
  company_website: '',
  work_address: '',
  tenure_months: null,
  income_source: null,
  income_source_other: '',
  monthly_net_income_cents: null,
  hr_contact_name: '',
  hr_phone: '',
  buro_consent: false,
  documents: [],
  document_notes: '',
};

export type Action =
  | { type: 'HYDRATE'; data: FullTenantResponse }
  | { type: 'GOTO'; step: number }
  | { type: 'NEXT' }
  | { type: 'BACK' }
  | { type: 'SET'; patch: Partial<WizardState> };

export function reducer(state: WizardState, action: Action): WizardState {
  switch (action.type) {
    case 'HYDRATE':
      return hydrateFromServer(state, action.data);
    case 'GOTO':
      return { ...state, step: clampStep(action.step) };
    case 'NEXT':
      return { ...state, step: clampStep(state.step + 1) };
    case 'BACK':
      return { ...state, step: clampStep(state.step - 1) };
    case 'SET':
      return { ...state, ...action.patch };
    default:
      return state;
  }
}

function clampStep(n: number): number {
  return Math.max(1, Math.min(TOTAL_STEPS, n));
}

/**
 * Hydrate the wizard state from /tenant/me/full. Maps each row back to
 * the in-memory shape so the user can resume from where they left off
 * with all their previous answers pre-filled.
 */
function hydrateFromServer(_state: WizardState, data: FullTenantResponse): WizardState {
  const { tenant, current_address, current_employment, references, roommates, deals, documents } = data;
  const deal = deals.find((d) => d.status !== 'cancelled') ?? deals[0] ?? null;

  // Infer nationality_kind + has_curp from whatever data the user already
  // saved. Default to null so the user makes the choice in Step 3.
  let nationality_kind: NationalityKind | null = null;
  let has_curp: HasCurp | null = null;
  if (tenant.curp) {
    nationality_kind = 'mexicana';
    has_curp = 'si';
  } else if (tenant.passport_number || tenant.ssn_or_foreign_id) {
    nationality_kind = 'otra';
    has_curp = 'no';
  }

  return {
    ...initialState,
    step: clampStep(tenant.wizard_step || 1),
    deal_id: deal?.id ?? null,

    regimen_fiscal: tenant.regimen_fiscal ?? null,

    divides_rent: roommates.length > 0 ? true : null,
    roommates: roommates.map((r) => ({ full_name: r.full_name, phone: r.phone })),

    nationality_kind,
    has_curp,
    first_name: tenant.first_name ?? '',
    apellido_paterno: tenant.apellido_paterno ?? '',
    apellido_materno: tenant.apellido_materno ?? '',
    date_of_birth: tenant.date_of_birth ?? '',
    place_of_birth_state: tenant.place_of_birth_state ?? '',
    place_of_birth_country: tenant.place_of_birth_country ?? '',
    nationality: tenant.nationality ?? '',
    gender: tenant.gender ?? null,
    curp: tenant.curp ?? '',
    rfc: tenant.rfc ?? '',
    passport_number: tenant.passport_number ?? '',
    ssn_or_foreign_id: tenant.ssn_or_foreign_id ?? '',

    references: references.map((r) => ({
      full_name: r.full_name,
      phone: r.phone,
      relation: r.relation ?? '',
    })),

    education_level: tenant.education_level ?? null,
    civil_status: tenant.civil_status ?? null,
    minor_children_count: tenant.minor_children_count ?? null,
    has_pets: tenant.has_pets,
    pets_detail: tenant.pets_detail ?? '',
    is_smoker: tenant.is_smoker,
    prior_eviction_disclosed: tenant.prior_eviction_disclosed,
    prior_legal_issues_disclosed: tenant.prior_legal_issues_disclosed,

    living_situation: current_address?.living_situation ?? null,
    address: {
      street: current_address?.street ?? '',
      exterior_number: current_address?.exterior_number ?? '',
      interior_number: current_address?.interior_number ?? '',
      neighborhood: current_address?.neighborhood ?? '',
      municipality: current_address?.municipality ?? '',
      city: current_address?.city ?? '',
      state: current_address?.state ?? '',
      postal_code: current_address?.postal_code ?? '',
    },
    time_at_address_months: current_address?.time_at_address_months ?? null,
    current_landlord_name: current_address?.current_landlord_name ?? '',
    current_landlord_phone: current_address?.current_landlord_phone ?? '',

    employment_status: current_employment?.employment_status ?? null,
    industry: current_employment?.industry ?? '',
    occupation: current_employment?.occupation ?? '',
    company_name: current_employment?.company_name ?? '',
    position: current_employment?.position ?? '',
    company_website: current_employment?.company_website ?? '',
    work_address: current_employment?.work_address ?? '',
    tenure_months: current_employment?.tenure_months ?? null,
    income_source: current_employment?.income_source ?? null,
    income_source_other: current_employment?.income_source_other ?? '',
    monthly_net_income_cents: current_employment?.monthly_net_income_cents
      ? Number(current_employment.monthly_net_income_cents)
      : null,
    hr_contact_name: current_employment?.hr_contact_name ?? '',
    hr_phone: current_employment?.hr_phone ?? '',
    buro_consent: current_employment?.buro_consent ?? false,
    documents: documents ?? [],
    document_notes: '',
  };
}

/**
 * Per-step validation. Returns true when the user can advance to the
 * next step. WizardShell consults this to enable / disable Siguiente.
 */
export function canAdvance(state: WizardState): boolean {
  switch (state.step) {
    case 1:
      return state.regimen_fiscal !== null;
    case 2:
      if (state.divides_rent === null) return false;
      if (state.divides_rent === false) return true;
      // dividing → each declared roommate needs name + phone
      return (
        state.roommates.length > 0 &&
        state.roommates.every((r) => r.full_name.trim() && r.phone.trim())
      );
    case 3: {
      if (state.nationality_kind === null) return false;
      const baseNames =
        state.first_name.trim().length > 0 && state.apellido_paterno.trim().length > 0;
      if (!baseNames) return false;
      if (!state.date_of_birth) return false;
      if (!state.gender) return false;
      if (state.nationality_kind === 'mexicana') {
        return state.rfc.trim().length >= 12 && !!state.place_of_birth_state;
      }
      // extranjero
      if (state.has_curp === null) return false;
      if (state.has_curp === 'si') {
        return state.curp.trim().length === 18;
      }
      // sin CURP → pasaporte + país nacimiento + nacionalidad
      return (
        state.passport_number.trim().length > 0 &&
        state.nationality.trim().length > 0 &&
        state.place_of_birth_country.trim().length > 0
      );
    }
    case 4:
      return (
        state.references.length >= 2 &&
        state.references.every((r) => r.full_name.trim() && r.phone.trim())
      );
    case 5:
      return state.education_level !== null && state.civil_status !== null;
    case 6: {
      // Solo dirección + situación son obligatorias. Arrendador (nombre +
      // teléfono) es opcional: si lo dan, mejor para la investigación;
      // si no, el equipo se las arregla con las otras referencias.
      if (state.living_situation === null) return false;
      const a = state.address;
      const addrOk =
        a.street.trim() && a.city.trim() && a.state && a.postal_code.trim();
      return Boolean(addrOk);
    }
    case 7: {
      if (state.employment_status === null) return false;
      if (state.income_source === null) return false;
      if (state.monthly_net_income_cents === null || state.monthly_net_income_cents <= 0) {
        return false;
      }
      if (state.income_source === 'otro' && !state.income_source_other.trim()) return false;
      // buró: required (it's the consent for the credit check)
      return state.buro_consent === true;
    }
    case 8: {
      // Required: INE front + INE back + at least 1 payslip. Additional
      // docs and notes are optional.
      const hasIneFront = state.documents.some((d) => d.type === 'ine_front');
      const hasIneBack = state.documents.some((d) => d.type === 'ine_back');
      const hasPayslip = state.documents.some((d) => d.type === 'payslip');
      return hasIneFront && hasIneBack && hasPayslip;
    }
    case 9:
      // Payment step renders its own CTA — Siguiente is always "ready"
      // (the actual gate is whether Stripe returns a session URL).
      return true;
    default:
      return false;
  }
}

export const STEP_TITLES: Record<number, string> = {
  1: 'Régimen fiscal',
  2: 'Vas a dividir renta?',
  3: 'Datos personales',
  4: 'Referencias',
  5: 'Historial',
  6: 'Domicilio actual',
  7: 'Trabajo e ingresos',
  8: 'Documentos',
  9: 'Pago',
};
