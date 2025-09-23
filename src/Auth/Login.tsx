import React, { useState } from 'react';

interface LoginProps {
  onLoginSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Modales
  const [showRegister, setShowRegister] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  // Registro
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  // Forgot password
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');
  const [forgotError, setForgotError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:1337/api/auth/local', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: email, password }),
      });

      const data = await res.json();

      if (res.ok && data.jwt) {
        localStorage.setItem('jwt', data.jwt);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLoginSuccess();
      } else {
        setError('Correo electrónico o contraseña incorrectos');
      }
    } catch {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    if (!regUsername || !regEmail || !regPassword) {
      setRegError('Completa todos los campos.');
      return;
    }

    try {
      const res = await fetch('http://localhost:1337/api/auth/local/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: regUsername,
          email: regEmail,
          password: regPassword,
        }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setRegSuccess('¡Registro exitoso! Ahora puedes iniciar sesión.');
        setRegUsername('');
        setRegEmail('');
        setRegPassword('');
      } else {
        setRegError(data.error?.message || 'Error al registrar');
      }
    } catch {
      setRegError('Error de conexión');
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotMsg('');
    setForgotError('');

    if (!forgotEmail) {
      setForgotError('Ingresa tu correo electrónico.');
      return;
    }

    try {
      const res = await fetch('http://localhost:1337/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        setForgotMsg('Si el correo existe, recibirás instrucciones para restablecer tu contraseña.');
        setForgotEmail('');
      } else {
        setForgotError(data.error?.message || 'Error al enviar el correo');
      }
    } catch {
      setForgotError('Error de conexión');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form className="bg-white p-8 rounded shadow-md w-full max-w-sm" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold mb-6 text-center">Gestión de Minimarket</h2>
        {error && <div className="mb-4 text-red-600 text-center">{error}</div>}
        <div className="mb-4">
          <label className="block mb-1">Correo electrónico</label>
          <input
            type="email"
            className="w-full border px-3 py-2 rounded"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoFocus
          />
        </div>
        <div className="mb-6">
          <label className="block mb-1">Contraseña</label>
          <input
            type="password"
            className="w-full border px-3 py-2 rounded"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? 'Ingresando...' : 'Iniciar Sesión'}
        </button>
        <div className="mt-4 flex flex-col items-center gap-2">
          <button
            type="button"
            className="text-blue-600 hover:underline text-sm"
            onClick={() => setShowForgot(true)}
          >
            ¿Olvidaste tu contraseña?
          </button>
          <button
            type="button"
            className="text-blue-600 hover:underline text-sm"
            onClick={() => setShowRegister(true)}
          >
            ¿No tienes cuenta? Regístrate
          </button>
        </div>
      </form>

      {/* Modal Registro */}
      {showRegister && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <form className="bg-white p-8 rounded shadow-md w-full max-w-sm relative" onSubmit={handleRegister}>
            <button
              type="button"
              className="absolute top-2 right-2 text-gray-500"
              onClick={() => { setShowRegister(false); setRegError(''); setRegSuccess(''); }}
            >✕</button>
            <h2 className="text-xl font-bold mb-4 text-center">Registrarse</h2>
            {regError && <div className="mb-2 text-red-600 text-center">{regError}</div>}
            {regSuccess && <div className="mb-2 text-green-600 text-center">{regSuccess}</div>}
            <div className="mb-3">
              <label className="block mb-1">Usuario</label>
              <input
                type="text"
                className="w-full border px-3 py-2 rounded"
                value={regUsername}
                onChange={e => setRegUsername(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="block mb-1">Correo electrónico</label>
              <input
                type="email"
                className="w-full border px-3 py-2 rounded"
                value={regEmail}
                onChange={e => setRegEmail(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1">Contraseña</label>
              <input
                type="password"
                className="w-full border px-3 py-2 rounded"
                value={regPassword}
                onChange={e => setRegPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
            >
              Registrarse
            </button>
          </form>
        </div>
      )}

      {/* Modal Forgot Password */}
      {showForgot && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <form className="bg-white p-8 rounded shadow-md w-full max-w-sm relative" onSubmit={handleForgot}>
            <button
              type="button"
              className="absolute top-2 right-2 text-gray-500"
              onClick={() => { setShowForgot(false); setForgotMsg(''); setForgotError(''); }}
            >✕</button>
            <h2 className="text-xl font-bold mb-4 text-center">Recuperar Contraseña</h2>
            {forgotError && <div className="mb-2 text-red-600 text-center">{forgotError}</div>}
            {forgotMsg && <div className="mb-2 text-green-600 text-center">{forgotMsg}</div>}
            <div className="mb-4">
              <label className="block mb-1">Correo electrónico</label>
              <input
                type="email"
                className="w-full border px-3 py-2 rounded"
                value={forgotEmail}
                onChange={e => setForgotEmail(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Enviar instrucciones
            </button>
          </form>
        </div>
      )}
    </div>
  );
};