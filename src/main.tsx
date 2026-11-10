import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import AdminDashboard from './components/AdminDashboard.tsx';
import AuthPage from './components/AuthPage.tsx';
import LegalPage, { getLegalPage } from './components/LegalPage.tsx';
import './index.css';

const currentPath = window.location.pathname.replace(/\/+$/, '') || '/';
const isAdminRoute = currentPath === '/ikrame';
const isAuthRoute = currentPath === '/login' || currentPath === '/signup';
const legalPage = getLegalPage(currentPath);

createRoot(document.getElementById('root')!).render(
  isAdminRoute ? <AdminDashboard /> : isAuthRoute ? <AuthPage /> : legalPage ? <LegalPage page={legalPage} /> : <App />
);
