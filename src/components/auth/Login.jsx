import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { InstaVuLogo, Email, Lock, Eye, EyeOff, LoadingSpinner } from '../../assets/icons';
import { validateEmail } from '../../utils/validators';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, user, profile } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const savedEmail = localStorage.getItem('remembered_email');
    const savedPassword = localStorage.getItem('remembered_password');
    if (savedEmail) {
      setFormData({ email: savedEmail, password: savedPassword || '' });
      setRememberMe(true);
    }
  }, []);

  useEffect(() => {
    if (user && profile?.username) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [user, profile, navigate, location]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await signIn(formData.email, formData.password);
      if (error) throw error;

      if (rememberMe) {
        localStorage.setItem('remembered_email', formData.email);
        localStorage.setItem('remembered_password', formData.password);
      } else {
        localStorage.removeItem('remembered_email');
        localStorage.removeItem('remembered_password');
      }
    } catch (error) {
      setError(error.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 relative overflow-hidden">
      {/* Animated Background Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-secondary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Content */}
      <div className="relative flex items-center justify-center min-h-screen p-4 sm:p-6 md:p-8">
        {/* Login Card - Mobile First */}
        <div className="w-full max-w-md">
          {/* Glass Card Effect */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8 md:p-10 animate-scale-in">
            {/* Logo Section */}
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-block p-3 sm:p-4 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl sm:rounded-3xl shadow-glow mb-4 sm:mb-6 animate-float">
                <InstaVuLogo className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-white via-primary-100 to-secondary-100 bg-clip-text text-transparent mb-2 sm:mb-3">
                InstaVu
              </h1>
              <p className="text-sm sm:text-base text-white/80 font-medium">
                Unlimited Storage, Unlimited Possibilities
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-error-500/20 backdrop-blur-sm border border-error-400/50 text-error-100 rounded-lg sm:rounded-xl text-sm sm:text-base animate-slide-down">
                <div className="flex items-start gap-2 sm:gap-3">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {/* Email Input */}
              <div className="group">
                <label className="block text-sm sm:text-base font-semibold text-white/90 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <Email className="w-5 h-5 sm:w-6 sm:h-6 text-white/50 group-focus-within:text-secondary-400 transition" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg sm:rounded-xl text-white placeholder-white/50 focus:bg-white/20 focus:border-secondary-400 focus:ring-4 focus:ring-secondary-500/30 transition-all duration-300 text-sm sm:text-base"
                    placeholder="your@email.com"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="group">
                <label className="block text-sm sm:text-base font-semibold text-white/90 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-white/50 group-focus-within:text-secondary-400 transition" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 sm:pl-12 pr-12 sm:pr-14 py-3 sm:py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg sm:rounded-xl text-white placeholder-white/50 focus:bg-white/20 focus:border-secondary-400 focus:ring-4 focus:ring-secondary-500/30 transition-all duration-300 text-sm sm:text-base"
                    placeholder="••••••••"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center text-white/50 hover:text-white transition"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5 sm:w-6 sm:h-6" /> : <Eye className="w-5 h-5 sm:w-6 sm:h-6" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between text-sm sm:text-base">
                <label className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 sm:w-5 sm:h-5 rounded border-2 border-white/30 bg-white/10 text-secondary-500 focus:ring-2 focus:ring-secondary-500 focus:ring-offset-0 transition cursor-pointer"
                    disabled={loading}
                  />
                  <span className="ml-2 sm:ml-3 text-white/80 font-medium group-hover:text-white transition">
                    Remember me
                  </span>
                </label>
                <Link 
                  to="/forgot-password" 
                  className="text-secondary-300 hover:text-secondary-200 font-semibold transition"
                >
                  Forgot?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="relative w-full group overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-secondary-500 via-primary-500 to-secondary-500 rounded-lg sm:rounded-xl"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-secondary-400 via-primary-400 to-secondary-400 rounded-lg sm:rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative px-6 py-3 sm:py-4 flex items-center justify-center gap-2 sm:gap-3">
                  {loading && <LoadingSpinner className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
                  <span className="text-base sm:text-lg font-bold text-white">
                    {loading ? 'Signing in...' : 'Sign In'}
                  </span>
                </div>
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6 sm:my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-xs sm:text-sm">
                <span className="px-3 sm:px-4 bg-transparent text-white/60 font-medium">
                  New to InstaVu?
                </span>
              </div>
            </div>

            {/* Register Link */}
            <Link
              to="/register"
              className="block w-full text-center px-6 py-3 sm:py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white font-bold rounded-lg sm:rounded-xl hover:bg-white/20 hover:border-white/50 transition-all duration-300 text-sm sm:text-base"
            >
              Create New Account
            </Link>
          </div>

          {/* Footer Text */}
          <p className="text-center text-xs sm:text-sm text-white/60 mt-4 sm:mt-6">
            By continuing, you agree to our{' '}
            <Link to="/terms" className="text-secondary-300 hover:text-secondary-200 font-semibold">
              Terms
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-secondary-300 hover:text-secondary-200 font-semibold">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}