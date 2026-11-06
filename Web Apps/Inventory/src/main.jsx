import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import InventoryHome from './InventoryHome';
import KkaqPage from './KkaqPage';
import XlsPage from './XlsPage';
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
          <Route path="/" element={<ProtectedRoute><InventoryHome /></ProtectedRoute>} />
          <Route path="/kkaq" element={<ProtectedRoute><KkaqPage /></ProtectedRoute>} />
          <Route path="/spreadsheet" element={<ProtectedRoute><XlsPage /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);
