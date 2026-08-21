import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { initDatabase } from '@/db';
import './index.css';

async function bootstrap() {
  try {
    await initDatabase();
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

bootstrap();
