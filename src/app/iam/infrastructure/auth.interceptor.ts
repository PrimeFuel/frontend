import { HttpInterceptorFn } from '@angular/common/http';

const STORAGE_KEY = 'fulltank.session';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  let token = '';
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    token = raw ? JSON.parse(raw)?.token ?? '' : '';
  } catch {
    token = '';
  }

  if (!token || req.url.includes('/authentication/')) {
    return next(req);
  }

  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
