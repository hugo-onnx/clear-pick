import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';
import { resetScrollOnReload } from './utils/scrollRestoration';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

resetScrollOnReload();

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
