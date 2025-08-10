import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "tailwindcss";
import App from './App.tsx'
import toastr from 'toastr';
import { ToastProvider } from './components/ui/ToastProvider';

toastr.options.positionClass = 'toast-top-center';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </StrictMode>,
)
