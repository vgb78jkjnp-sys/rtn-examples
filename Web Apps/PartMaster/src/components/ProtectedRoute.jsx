import AppAuthGate from './AppAuthGate';

function ProtectedRoute({ children }) {
  return <AppAuthGate>{children}</AppAuthGate>;
}

export default ProtectedRoute;
