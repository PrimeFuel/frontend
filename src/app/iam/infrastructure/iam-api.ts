import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AuthenticatedUser,
  BackendUser,
  BuyerCompany,
  ProviderCompany,
} from '../domain/model/session.entity';

@Injectable({ providedIn: 'root' })
export class IamApi {
  private readonly http = inject(HttpClient);
  private readonly base = environment.serverBasePath;

  private options(token?: string): { headers?: HttpHeaders } {
    return token ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) } : {};
  }

  signIn(username: string, password: string): Observable<AuthenticatedUser> {
    return this.http.post<AuthenticatedUser>(`${this.base}${environment.iamSignInEndpointPath}`, {
      username,
      password,
    });
  }

  signUp(payload: {
    username: string;
    password: string;
    roles: string[];
    companyId: number | null;
    providerId: number | null;
  }): Observable<unknown> {
    return this.http.post(`${this.base}${environment.iamSignUpEndpointPath}`, payload);
  }

  createBuyerCompany(payload: Partial<BuyerCompany>): Observable<BuyerCompany> {
    return this.http.post<BuyerCompany>(`${this.base}${environment.iamBuyerCompaniesEndpointPath}`, payload);
  }

  createProviderCompany(payload: Partial<ProviderCompany>): Observable<ProviderCompany> {
    return this.http.post<ProviderCompany>(
      `${this.base}${environment.iamProviderCompaniesEndpointPath}`,
      payload,
    );
  }

  updateBuyerCompany(id: number, payload: Partial<BuyerCompany>): Observable<BuyerCompany> {
    return this.http.put<BuyerCompany>(
      `${this.base}${environment.iamBuyerCompaniesEndpointPath}/${id}`,
      payload,
    );
  }

  updateProviderCompany(id: number, payload: Partial<ProviderCompany>): Observable<ProviderCompany> {
    return this.http.put<ProviderCompany>(
      `${this.base}${environment.iamProviderCompaniesEndpointPath}/${id}`,
      payload,
    );
  }

  getBuyerCompanies(token?: string): Observable<BuyerCompany[]> {
    return this.http.get<BuyerCompany[]>(
      `${this.base}${environment.iamBuyerCompaniesEndpointPath}`,
      this.options(token),
    );
  }

  getBuyerCompany(id: number, token?: string): Observable<BuyerCompany> {
    return this.http.get<BuyerCompany>(
      `${this.base}${environment.iamBuyerCompaniesEndpointPath}/${id}`,
      this.options(token),
    );
  }

  getProviderCompanies(token?: string): Observable<ProviderCompany[]> {
    return this.http.get<ProviderCompany[]>(
      `${this.base}${environment.iamProviderCompaniesEndpointPath}`,
      this.options(token),
    );
  }

  getProviderCompany(id: number, token?: string): Observable<ProviderCompany> {
    return this.http.get<ProviderCompany>(
      `${this.base}${environment.iamProviderCompaniesEndpointPath}/${id}`,
      this.options(token),
    );
  }

  getUsers(token?: string): Observable<BackendUser[]> {
    return this.http.get<BackendUser[]>(
      `${this.base}${environment.iamUsersEndpointPath}`,
      this.options(token),
    );
  }
}
