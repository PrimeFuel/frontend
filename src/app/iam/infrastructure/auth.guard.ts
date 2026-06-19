import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { IamStore } from '../application/iam.store';

function dashboardUrl(iam: IamStore): UrlTree {
  const router = inject(Router);
  return router.parseUrl(iam.isProvider() ? '/reporting/provider-dashboard' : '/reporting/buyer-dashboard');
}

export const authGuard: CanActivateFn = (): boolean | UrlTree => {
  const iam = inject(IamStore);
  const router = inject(Router);
  return iam.isAuthenticated() ? true : router.parseUrl('/iam');
};

export const buyerGuard: CanActivateFn = (): boolean | UrlTree => {
  const iam = inject(IamStore);
  return iam.isAuthenticated() && iam.isBuyer() ? true : dashboardUrl(iam);
};

export const providerGuard: CanActivateFn = (): boolean | UrlTree => {
  const iam = inject(IamStore);
  return iam.isAuthenticated() && iam.isProvider() ? true : dashboardUrl(iam);
};

export const dashboardRedirectGuard: CanActivateFn = (): UrlTree => {
  const iam = inject(IamStore);
  return dashboardUrl(iam);
};
