import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import AccountPage from './components/AccountPage.tsx';
import AdminDashboard from './components/AdminDashboard.tsx';
import AuthPage from './components/AuthPage.tsx';
import LegalPage, { getLegalPage } from './components/LegalPage.tsx';
import './index.css';

const currentPath = window.location.pathname.replace(/\/+$/, '') || '/';
const isAdminRoute = currentPath === '/ikrame';
const isAuthRoute = currentPath === '/login' || currentPath === '/signup';
const isAccountRoute = currentPath === '/compte' || currentPath === '/account';
const legalPage = getLegalPage(currentPath);

createRoot(document.getElementById('root')!).render(
  isAdminRoute ? <AdminDashboard /> : isAccountRoute ? <AccountPage /> : isAuthRoute ? <AuthPage /> : legalPage ? <LegalPage page={legalPage} /> : <App />
);
