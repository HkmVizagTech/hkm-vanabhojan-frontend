import './lib/resizeObserverPatch';
import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ColorModeScript } from '@chakra-ui/react';
import App from './app/App';
import { theme } from './theme';
import reportWebVitals from './reportWebVitals';
import * as serviceWorker from './serviceWorker';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);

serviceWorker.unregister();
reportWebVitals();
