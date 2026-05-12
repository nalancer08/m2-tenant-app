import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from './AuthProvider';

export function RequireTenantAuth() {
  const { me, loading } = useAuth();
  const location = useLocation();
  if (loading) return null;
  if (!me) return <Navigate to="/auth/login" replace state={{ from: location }} />;
  if (me.profile_type !== 'tenant') return <Navigate to="/auth/login" replace />;
  return <Outlet />;
}
