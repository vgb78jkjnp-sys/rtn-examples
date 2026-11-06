import AppAuthGate from './AppAuthGate';

function ProtectedRoute({ children }) {
  //return <AppAuthGate>{children}</AppAuthGate>;
  return children;
}

export default ProtectedRoute;
