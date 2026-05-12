import { api, unwrap } from './client';

export interface PublicDealResponse {
  deal: { id: string; folio: string; status: string };
  property: {
    id: string;
    street: string;
    exterior_number: string | null;
    interior_number: string | null;
    neighborhood: string | null;
    city: string;
    state: string;
    postal_code: string;
    type: string;
    bedrooms: number | null;
    bathrooms: number | null;
    rent_amount_cents: string | number;
    currency: string;
  } | null;
  product: {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    price_cents: string | number;
    currency: string;
    includes: string[];
  } | null;
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
