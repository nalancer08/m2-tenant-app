import { api, unwrap } from './client';

/**
 * What the unauthenticated landing page can see about a deal when the
 * tenant opens the broker's invitation link. Mirrors GET /public/deals/:linkToken
 * on the API. No sensitive data — folio, address, products, total, broker
 * first name. Used to render the "Metro Cuadrado · te invito" landing.
 */
export interface PublicDealResponse {
  deal: {
    id: string;
    folio: string;
    status: 'draft' | 'pending_tenant' | 'in_progress' | 'ready' | 'cancelled';
    rent_amount_cents: string | number | null;
    currency: string;
    use_kind: string | null;
    contract_start_date: string | null;
    principal_tenant_name: string | null;
    /** UUID del user del principal una vez que firmó. Null si aún
     *  nadie tomó la liga. El frontend lo usa para detectar "este link
     *  es mío" comparándolo contra el JWT user. */
    principal_tenant_user_id: string | null;
  };
  property: {
    id: string;
    street: string;
    exterior_number: string | null;
    interior_number: string | null;
    neighborhood: string | null;
    municipality: string | null;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  } | null;
  line_items: Array<{
    id: string;
    product_id: string;
    product: {
      id: string;
      slug: string;
      name: string;
      description: string | null;
      price_cents: string | number;
      currency: string;
    } | null;
    quantity: number;
    unit_price_cents: number;
    subtotal_cents: number;
    currency: string;
  }>;
  total_cents: number;
  broker: {
    id: string;
    first_name: string;
    last_name: string;
    work_type: string;
    email: string | null;
  } | null;
}

export const publicDealApi = {
  get(linkToken: string) {
    return unwrap<PublicDealResponse>(api.get(`/public/deals/${linkToken}`));
  },
};
