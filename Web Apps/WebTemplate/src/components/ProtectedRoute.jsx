import { AuthGate } from '../auth';

function ProtectedRoute({ children }) {
  return <AuthGate>{children}</AuthGate>;
}

export default ProtectedRoute;
