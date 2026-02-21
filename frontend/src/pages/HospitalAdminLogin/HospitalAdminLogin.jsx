import { useApi } from '../../context/ApiContext';
import { toast } from 'sonner';

function HospitalAdminLogin({ onNavigateToLanding, onLoginSuccess }) {
  const { apiFetch } = useApi();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    hospitalCode: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await apiFetch('/auth/hospital-admin-login', {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLoginSuccess();
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '50px 60px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '500px',
        minWidth: '450px',
        textAlign: 'center'
      }}>
        {/* Logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '30px'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            backgroundColor: '#6366f1',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '12px',
            color: 'white',
            fontSize: '24px'
          }}>
            H
          </div>
          <span style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#6366f1'
          }}>
            Careline
          </span>
        </div>

        {/* Welcome Text */}
        <h1 style={{
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#1f2937',
          marginBottom: '8px'
        }}>
          Welcome to Careline
        </h1>

        <p style={{
          fontSize: '16px',
          color: '#6b7280',
          marginBottom: '40px'
        }}>
          Manage your hospital queue efficiently.
        </p>

        {/* Error Message */}
        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '25px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Email Field */}
          <div style={{ marginBottom: '25px', textAlign: 'left' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                backgroundColor: '#f9fafb',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Password Field */}
          <div style={{ marginBottom: '25px', textAlign: 'left' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Password"
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                backgroundColor: '#f9fafb',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Hospital Code Field */}
          <div style={{ marginBottom: '25px', textAlign: 'left' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Hospital Code
            </label>
            <input
              type="text"
              name="hospitalCode"
              value={formData.hospitalCode}
              onChange={handleChange}
              required
              placeholder="Enter hospital code"
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                backgroundColor: '#f9fafb',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Forgot Password */}
          <div style={{ textAlign: 'right', marginBottom: '30px' }}>
            <button
              type="button"
              onClick={() => toast.info('Please contact system administrator for password reset')}
              style={{
                color: '#ec4899',
                background: 'none',
                border: 'none',
                fontSize: '14px',
                cursor: 'pointer',
                textDecoration: 'none'
              }}
            >
              Forgot Password?
            </button>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: loading ? '#9ca3af' : '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Credentials */}
        <div style={{
          marginTop: '35px',
          padding: '20px',
          backgroundColor: '#f3f4f6',
          borderRadius: '8px',
          textAlign: 'left',
          fontSize: '12px'
        }}>
          <h4 style={{ margin: '0 0 15px 0', color: '#374151' }}>Demo Hospital Credentials:</h4>

          <div style={{ marginBottom: '10px' }}>
            <strong>Bir Hospital:</strong><br />
            admin@bir-hospital.com | BH-2024-001
          </div>

          <div style={{ marginBottom: '10px' }}>
            <strong>Patan Hospital:</strong><br />
            admin@patan-hospital.com | PH-2024-002
          </div>

          <div style={{ marginBottom: '10px' }}>
            <strong>Civil Hospital:</strong><br />
            admin@civil-hospital.com | CH-2024-003
          </div>

          <p style={{ margin: '10px 0 0 0', fontWeight: 'bold' }}>Password: admin123</p>
        </div>
      </div>
    </div>
  );
}

export default HospitalAdminLogin;