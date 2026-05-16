import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Proveedores } from '@/app/providers';
import { Enrutador } from '@/app/router';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Proveedores>
        <Enrutador />
      </Proveedores>
    </BrowserRouter>
  </React.StrictMode>,
);
