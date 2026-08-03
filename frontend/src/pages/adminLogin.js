import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function AdminLogin() {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError('');

    try {
      const res = await axios.post('http://localhost:3000/auth/login', { usuario, password });
      localStorage.setItem('admin_token', res.data.token);
      navigate('/admin');
    } catch (err) {
      setError('Usuario o contraseña incorrectos');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={estilos.fondo}>
      <div style={estilos.card}>
        <h2 style={estilos.titulo}>Acceso</h2>

        <form onSubmit={handleLogin}>
          <div style={estilos.campo}>
            <input
              type="text"
              placeholder="Usuario"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              style={estilos.input}
              required
            />
          </div>
          <div style={estilos.campo}>
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={estilos.input}
              required
            />
          </div>

          {error && <p style={estilos.error}>{error}</p>}

          <button type="submit" style={estilos.btn} disabled={cargando}>
            {cargando ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}

const estilos = {
  fondo: {
    minHeight: '100vh',
    background: '#f5f5f5',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    background: 'white',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '360px',
  },
  titulo: {
    textAlign: 'center',
    marginBottom: '30px',
    fontFamily: 'Segoe UI, sans-serif',
    color: '#333',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    fontSize: '1rem',
  },
  campo: { marginBottom: '15px' },
  input: {
    width: '100%',
    padding: '12px 15px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '1rem',
    outline: 'none',
    boxSizing: 'border-box',
  },
  btn: {
    width: '100%',
    padding: '13px',
    background: '#333',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    cursor: 'pointer',
    marginTop: '10px',
  },
  error: {
    color: '#e74c3c',
    fontSize: '0.85rem',
    textAlign: 'center',
    marginBottom: '10px',
  },
};

export default AdminLogin;