import { createBrowserRouter } from 'react-router';
import { LoginPage } from '../pages/auth/LoginPage';
import { SignupPage } from '../pages/auth/SignupPage';
import { WelcomePage } from '../pages/welcome/WelcomePage';
import { LinkLandingPage } from '../pages/flow/LinkLandingPage';
import { PaymentResultPage } from '../pages/flow/PaymentResultPage';
import { WizardShell } from '../pages/wizard/WizardShell';
import { TenantShell } from '../components/layout/TenantShell';
import { RequireTenantAuth } from '../auth/RequireTenantAuth';

/**
 * Routes:
 *   /                            authed welcome
 *   /wizard                      authed wizard (Steps 1-9, last one is pago)
 *   /pago/exito                  authed post-Stripe success (polls webhook completion)
 *   /pago/cancelado              authed post-Stripe cancel
 *   /:linkToken                  public landing the broker shares
 *   /auth/login, /signup         auth pages
 */
export const router = createBrowserRouter([
  { path: '/auth/login', element: <LoginPage /> },
  { path: '/auth/signup', element: <SignupPage /> },
  // Production URL: https://inquilino.metrocuadrados.com/X8K2P4 — the
  // `inquilino` subdomain namespaces the route, so the 6-char token
  // sits directly under the root (no /i/ prefix). Declared AFTER the
  // explicit /pago/* paths so multi-segment paths win.
  { path: '/:linkToken', element: <LinkLandingPage /> },
  {
    path: '/',
    element: <RequireTenantAuth />,
    children: [
      // Wizard runs without TenantShell — it has its own header with
      // progress bar baked in.
      { path: 'wizard', element: <WizardShell /> },
      // Stripe redirect landings. Plain pages (no TenantShell chrome).
      { path: 'pago/exito', element: <PaymentResultPage mode="success" /> },
      { path: 'pago/cancelado', element: <PaymentResultPage mode="cancelled" /> },
      {
        element: <TenantShell />,
        children: [{ index: true, element: <WelcomePage /> }],
      },
    ],
  },
]);
