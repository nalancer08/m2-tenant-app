import { createBrowserRouter } from 'react-router';
import { LoginPage } from '../pages/auth/LoginPage';
import { SignupPage } from '../pages/auth/SignupPage';
import { WelcomePage } from '../pages/welcome/WelcomePage';
import { LinkLandingPage } from '../pages/flow/LinkLandingPage';
import { WizardShell } from '../pages/wizard/WizardShell';
import { TenantShell } from '../components/layout/TenantShell';
import { RequireTenantAuth } from '../auth/RequireTenantAuth';

/**
 * Routes:
 *   /                       authed welcome (with "Empezar investigación" CTA)
 *   /wizard                 authed wizard (Steps 1-7 today; 8-9 in next phases)
 *   /:linkToken             public landing the broker shares
 *   /auth/login, /signup    auth pages
 */
export const router = createBrowserRouter([
  { path: '/auth/login', element: <LoginPage /> },
  { path: '/auth/signup', element: <SignupPage /> },
  // Production URL: https://inquilino.metrocuadrados.com/X8K2P4 — the
  // `inquilino` subdomain namespaces the route, so the 6-char token
  // sits directly under the root (no /i/ prefix).
  { path: '/:linkToken', element: <LinkLandingPage /> },
  {
    path: '/',
    element: <RequireTenantAuth />,
    children: [
      // Wizard runs without TenantShell — it has its own header with
      // progress bar baked in.
      { path: 'wizard', element: <WizardShell /> },
      {
        element: <TenantShell />,
        children: [{ index: true, element: <WelcomePage /> }],
      },
    ],
  },
]);
