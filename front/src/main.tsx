import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppProvider } from '@/app/providers';
import { AppRoutes } from '@/app/routes';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  </StrictMode>
);
