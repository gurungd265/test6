import React, { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';


function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const { login,isLoggedIn } = useAuth();

  useEffect(() =>{
      if(isLoggedIn){
          console.log("LoginPage: Login on -> HomePage");
          navigate('/');
      }
  },[isLoggedIn,navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await login(email,password);

      setSuccess('ログイン成功!');
      console.log('ログイン成功:');

    } catch (err) {
      console.error('ログイン失敗:', err);
      if (err.response) {
        // ex: 401 Unauthorized, 400 Bad Request
        setError(err.response.data.message || 'ログインに失敗しました！EmailとかPasswordを確認してください。');
      } else if (err.request) {
        // network error,server down
        setError('NetworkまたはServerが繋がってない状態です');
      } else {
        setError('分からないエラーが発生しました');
      }
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>ログイン</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label htmlFor="email" style={styles.label}>Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
        </div>
        <div style={styles.formGroup}>
          <label htmlFor="password" style={styles.label}>Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />
        </div>
        <button type="submit" style={styles.button}>ログイン</button>
      </form>

      {error && <p style={styles.errorMessage}>{error}</p>}
      {success && <p style={styles.successMessage}>{success}</p>}

      <p style={styles.linkText}>
        アカウントをお持ちでないですか? <a href="/signup" style={styles.link}>sign up</a>
      </p>
    </div>
  );
}

//css
const styles = {
  container: {
    maxWidth: '400px',
    margin: '50px auto',
    padding: '20px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    fontFamily: 'Arial, sans-serif',
  },
  heading: {
    textAlign: 'center',
    color: '#333',
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  formGroup: {
    marginBottom: '15px',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold',
    color: '#555',
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxSizing: 'border-box',
  },
  button: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '10px 15px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    marginTop: '10px',
  },
  errorMessage: {
    color: 'red',
    textAlign: 'center',
    marginTop: '15px',
  },
  successMessage: {
    color: 'green',
    textAlign: 'center',
    marginTop: '15px',
  },
  linkText: {
    textAlign: 'center',
    marginTop: '20px',
    color: '#666',
  },
  link: {
    color: '#007bff',
    textDecoration: 'none',
  }
};

export default LoginPage;