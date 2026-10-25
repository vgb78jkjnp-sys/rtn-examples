import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import PartMasterHome from './PartMasterHome';
import PartMasterList from './PartMasterList';
import PartAssembly from './PartAssembly';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute';

const deployedBasename = import.meta.env.BASE_URL.replace(/\/$/, '');
const routerBasename = import.meta.env.DEV
  ? window.location.pathname.startsWith(deployedBasename)
    ? import.meta.env.BASE_URL
    : '/'
  : import.meta.env.BASE_URL;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter basename={routerBasename}>
        <Routes>
          <Route path="/" element={<ProtectedRoute><PartMasterHome /></ProtectedRoute>} />
          <Route path="/part-master-list" element={<ProtectedRoute><PartMasterList /></ProtectedRoute>} />
          <Route path="/part-assembly" element={<ProtectedRoute><PartAssembly /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);
