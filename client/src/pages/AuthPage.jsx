import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosSetup';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  
  // This tool lets us redirect the user to a different page after they log in
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents the page from refreshing
    setError('');

    try {
      if (isLogin) {
        // Call the Login Route!
        await api.post('/auth/login', { email: formData.email, password: formData.password });
      } else {
        // Call the Register Route!
        await api.post('/auth/register', formData);
      }
      
      // If the backend sends back a 200/201, the cookie is set! Send them to the dashboard.
      navigate('/'); 
      
    } catch (err) {
      // If the backend throws a 400 or 401 (like "Invalid credentials"), show the error message.
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', fontFamily: 'sans-serif' }}>
      <h2>{isLogin ? 'Welcome Back' : 'Create an Account'}</h2>
      
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        {/* Only show the Name field if they are registering */}
        {!isLogin && (
          <input 
            type="text" name="name" placeholder="Full Name" required 
            value={formData.name} onChange={handleChange}
            style={{ padding: '10px' }}
          />
        )}

        <input 
          type="email" name="email" placeholder="Email Address" required 
          value={formData.email} onChange={handleChange}
          style={{ padding: '10px' }}
        />
        
        <input 
          type="password" name="password" placeholder="Password" required 
          value={formData.password} onChange={handleChange}
          style={{ padding: '10px' }}
        />

        <button type="submit" style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>
          {isLogin ? 'Log In' : 'Sign Up'}
        </button>
      </form>

      <p style={{ marginTop: '20px', cursor: 'pointer', color: 'blue' }} onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? "Don't have an account? Sign up." : "Already have an account? Log in."}
      </p>
    </div>
  );
};

export default AuthPage;