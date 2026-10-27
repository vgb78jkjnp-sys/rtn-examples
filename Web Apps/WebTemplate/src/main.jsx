/*
 * Import page components and register them in the routes below.
 * Example: <Route path="/example" element={<ProtectedRoute><ExamplePage /></ProtectedRoute>} />
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './auth';
import { PageLoadingProvider } from './context/PageLoadingContext.jsx';
import ProtectedRoute from './components/ProtectedRoute';
import ExamplePage from './pages/ExamplePage.jsx';
import { appConfig } from './config/application.config';

document.title = appConfig.applicationTitle;

const deployedBasename = import.meta.env.BASE_URL.replace(/\/$/, '');
const routerBasename = import.meta.env.DEV
  ? window.location.pathname.startsWith(deployedBasename)
    ? import.meta.env.BASE_URL
    : '/'
  : import.meta.env.BASE_URL;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <PageLoadingProvider>
        <BrowserRouter basename={routerBasename}>
          <Routes>
            <Route path="/" element={<ProtectedRoute><App /></ProtectedRoute>} />
            <Route path="/auth-status" element={<Navigate to="/" replace />} />
            <Route path="/example" element={<ProtectedRoute><ExamplePage /></ProtectedRoute>} />
          </Routes>
        </BrowserRouter>
      </PageLoadingProvider>
    </AuthProvider>
  </StrictMode>
);