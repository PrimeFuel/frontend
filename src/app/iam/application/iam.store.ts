import { Injectable, signal, computed, inject } from '@angular/core';
import { Observable, map, switchMap, tap } from 'rxjs';
import { IamApi } from '../infrastructure/iam-api';
import {
  AuthForm,
  AuthenticatedUser,
  BackendUser,
  BuyerCompany,
  ProviderCompany,
  Session,
  UserRole,
} from '../domain/model/session.entity';

const STORAGE_KEY = 'fulltank.session';

function loadSession(): Session {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Session(JSON.parse(raw)) : new Session();
  } catch {
    return new Session();
  }
}

@Injectable({ providedIn: 'root' })
export class IamStore {
  private readonly api = inject(IamApi);

  private readonly _session = signal<Session>(loadSession());
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string>('');

  readonly session = this._session.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly role = computed<UserRole | null>(() => this._session().role);
  readonly isAuthenticated = computed(() => this._session().isAuthenticated);
  readonly isBuyer = computed(() => this._session().role === 'BUYER');
  readonly isProvider = computed(() => this._session().role === 'PROVIDER');
  readonly currentCompanyId = computed(() => this._session().companyId);
  readonly currentProviderId = computed(() => this._session().providerId);
  readonly displayName = computed(() => this._session().displayName);
  readonly companyName = computed(() => this._session().companyName);
  readonly userId = computed(() => this._session().userId);

  private persist(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this._session()));
  }

  login(email: string, password: string): Observable<Session> {
    this._loading.set(true);
    this._error.set('');
    return this.api.signIn(email, password).pipe(
      switchMap((auth) => this.buildSession(auth)),
      tap({
        next: (session) => {
          this._session.set(session);
          this.persist();
          this._loading.set(false);
        },
        error: () => {
          this._error.set('No se pudo iniciar sesion. Verifica tus credenciales.');
          this._loading.set(false);
        },
      }),
    );
  }

  register(form: AuthForm): Observable<Session> {
    this._loading.set(true);
    this._error.set('');
    const companyRequest: Observable<BuyerCompany | ProviderCompany> =
      form.role === 'BUYER'
        ? this.api.createBuyerCompany({
            name: form.companyName,
            ruc: form.ruc,
            sector: 'General',
            address: '',
            contactEmail: form.email,
            phone: form.phone,
          })
        : this.api.createProviderCompany({
            name: form.companyName,
            ruc: form.ruc,
            rating: 0,
            address: form.address ?? '',
            phone: form.phone,
            fuelTypesOffered: [],
            description: form.description ?? '',
          });

    return companyRequest.pipe(
      switchMap((company) => {
        const payload = {
          username: form.email,
          password: form.password,
          roles: [form.role === 'BUYER' ? 'ROLE_BUYER' : 'ROLE_PROVIDER'],
          companyId: form.role === 'BUYER' ? company.id : null,
          providerId: form.role === 'PROVIDER' ? company.id : null,
        };
        return this.api.signUp(payload);
      }),
      switchMap(() => this.login(form.email, form.password)),
      tap({
        error: () => {
          this._error.set('No se pudo completar el registro.');
          this._loading.set(false);
        },
      }),
    );
  }

  updateProfile(data: { companyName: string; ruc: string; phone: string; email: string }): Observable<Session> {
    const current = this._session();
    this._loading.set(true);
    this._error.set('');

    const request: Observable<BuyerCompany | ProviderCompany> =
      current.role === 'PROVIDER' && current.providerId
        ? this.api.updateProviderCompany(current.providerId, {
            name: data.companyName,
            ruc: data.ruc,
            rating: 0,
            address: '',
            phone: data.phone,
            fuelTypesOffered: [],
            description: '',
          })
        : this.api.updateBuyerCompany(current.companyId ?? 0, {
            name: data.companyName,
            ruc: data.ruc,
            sector: 'General',
            address: '',
            contactEmail: data.email,
            phone: data.phone,
          });

    return request.pipe(
      map((company) => this.sessionFromCompany(current, company, data.email)),
      tap({
        next: (session) => {
          this._session.set(session);
          this.persist();
          this._loading.set(false);
        },
        error: () => {
          this._error.set('No se pudo actualizar el perfil.');
          this._loading.set(false);
        },
      }),
    );
  }

  logout(): void {
    this._session.set(new Session());
    localStorage.removeItem(STORAGE_KEY);
  }

  private buildSession(auth: AuthenticatedUser): Observable<Session> {
    return this.api.getUsers(auth.token).pipe(
      switchMap((users) => {
        const user = users.find((u) => u.username === auth.username) ?? users.find((u) => u.id === auth.id);
        return this.companyForUser(user, auth);
      }),
    );
  }

  private companyForUser(user: BackendUser | undefined, auth: AuthenticatedUser): Observable<Session> {
    const roles = user?.roles ?? [];
    const isProvider = roles.includes('ROLE_PROVIDER');
    if (isProvider && user?.providerId) {
      return this.api.getProviderCompany(user.providerId, auth.token).pipe(
        map((company) =>
          new Session({
            token: auth.token,
            role: 'PROVIDER',
            userId: String(user.id),
            providerId: company.id,
            displayName: auth.username,
            companyName: company.name,
            email: auth.username,
            ruc: company.ruc,
            phone: company.phone,
          }),
        ),
      );
    }

    return this.api.getBuyerCompany(user?.companyId ?? 0, auth.token).pipe(
      map((company) =>
        new Session({
          token: auth.token,
          role: 'BUYER',
          userId: String(user?.id ?? auth.id),
          companyId: company.id,
          displayName: auth.username,
          companyName: company.name,
          email: auth.username,
          ruc: company.ruc,
          phone: company.phone,
        }),
      ),
    );
  }

  private sessionFromCompany(
    current: Session,
    company: BuyerCompany | ProviderCompany,
    email: string,
  ): Session {
    return new Session({
      ...current,
      displayName: email,
      email,
      companyName: company.name,
      ruc: company.ruc,
      phone: company.phone,
    });
  }
}
