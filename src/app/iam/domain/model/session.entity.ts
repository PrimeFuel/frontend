export type UserRole = 'BUYER' | 'PROVIDER';

export class Session {
  token: string;
  role: UserRole | null;
  userId: string | null;
  companyId: number | null;
  providerId: number | null;
  displayName: string;
  companyName: string;
  email: string;
  ruc: string;
  phone: string;

  constructor(params: {
    token?: string;
    role?: UserRole | null;
    userId?: string | null;
    companyId?: number | null;
    providerId?: number | null;
    displayName?: string;
    companyName?: string;
    email?: string;
    ruc?: string;
    phone?: string;
  } = {}) {
    this.token = params.token ?? '';
    this.role = params.role ?? null;
    this.userId = params.userId ?? null;
    this.companyId = params.companyId ?? null;
    this.providerId = params.providerId ?? null;
    this.displayName = params.displayName ?? '';
    this.companyName = params.companyName ?? '';
    this.email = params.email ?? '';
    this.ruc = params.ruc ?? '';
    this.phone = params.phone ?? '';
  }

  get isAuthenticated(): boolean {
    return !!this.token && (this.role === 'BUYER' || this.role === 'PROVIDER');
  }
}

export interface AuthenticatedUser {
  id: number;
  username: string;
  token: string;
}

export interface BackendUser {
  id: number;
  username: string;
  roles: string[];
  companyId: number | null;
  providerId: number | null;
}

export interface BuyerCompany {
  id: number;
  name: string;
  ruc: string;
  sector: string;
  address: string;
  contactEmail: string;
  phone: string;
}

export interface ProviderCompany {
  id: number;
  name: string;
  ruc: string;
  rating: number;
  address: string;
  phone: string;
  fuelTypesOffered: string[];
  description: string;
}

export interface AuthForm {
  role: UserRole;
  companyName: string;
  ruc: string;
  phone: string;
  email: string;
  password: string;
  /** Provider-only: shown on the provider's catalog card detail. */
  description?: string;
  /** Provider-only: company location/address. */
  address?: string;
}
