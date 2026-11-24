import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import './index.css';
import { registerServiceWorker } from './lib/pwa';
import { ErrorBoundary } from './components/ErrorBoundary';
import { installAuthFetch } from './lib/authFetch';

// Send the signed-in user's ID token with API calls so the server can verify identity.
installAuthFetch();

// Register PWA Service Worker for offline application shell & caching
registerServiceWorker();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
