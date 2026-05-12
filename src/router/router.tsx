import { createBrowserRouter } from 'react-router';
import { LoginPage } from '../pages/auth/LoginPage';
import { SignupPage } from '../pages/auth/SignupPage';
import { WelcomePage } from '../pages/welcome/WelcomePage';
import { LinkLandingPage } from '../pages/flow/LinkLandingPage';
import { TenantShell } from '../components/layout/TenantShell';
import { RequireTenantAuth } from '../auth/RequireTenantAuth';

export const router = createBrowserRouter([
  { path: '/auth/login', element: <LoginPage /> },
  { path: '/auth/signup', element: <SignupPage /> },
  { path: '/i/:linkToken', element: <LinkLandingPage /> },
  {
    path: '/',
    element: <RequireTenantAuth />,
    children: [
      {
        element: <TenantShell />,
        children: [{ index: true, element: <WelcomePage /> }],
      },
    ],
  },
]);
