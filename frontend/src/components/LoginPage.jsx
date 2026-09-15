import { useState } from 'react';
import { login } from '../api';
import { Button, Field, inputClass } from './ui';

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await login(username, password);
      localStorage.setItem('crm_access_token', response.data.access);
      localStorage.setItem('crm_refresh_token', response.data.refresh);
      onLogin();
    } catch (error) {
      console.error('Error de login:', error);
      alert('Usuario o contraseña inválidos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-pipedrive-gray p-6">
      <form onSubmit={submit} className="w-full max-w-sm rounded-lg border border-pipedrive-border bg-white p-6 shadow-sm">
        <h1 className="mb-1 text-2xl font-semibold text-pipedrive-text">Mi CRM</h1>
        <p className="mb-6 text-sm text-gray-500">Ingresa para continuar.</p>
        <div className="space-y-4">
          <Field label="Usuario">
            <input className={inputClass} value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" />
          </Field>
          <Field label="Contraseña">
            <input className={inputClass} type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" />
          </Field>
          <Button className="w-full" disabled={loading || !username || !password}>
            Entrar
          </Button>
        </div>
      </form>
    </div>
  );
}
