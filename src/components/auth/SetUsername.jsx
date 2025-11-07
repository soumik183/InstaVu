import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { InstaVuLogo, User, CheckCircle, ErrorCircle, LoadingSpinner } from '../../assets/icons';
import { validateUsername } from '../../utils/validators';

export default function SetUsername() {
  const navigate = useNavigate();
  const { user, profile, createProfile, checkUsernameAvailability } = useAuth();

  const [username, setUsername] = useState('');
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
    if (profile?.username) {
      navigate('/dashboard');
    }
  }, [user, profile, navigate]);

  useEffect(() => {
    if (username.length >= 3) {
      const timer = setTimeout(() => {
        checkAvailability();
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setAvailable(null);
    }
  }, [username]);

  const checkAvailability = async () => {
    const validation = validateUsername(username);
    setValidationErrors(validation.errors);

    if (!validation.valid) {
      setAvailable(null);
      return;
    }

    setChecking(true);
    try {
      const { available } = await checkUsernameAvailability(username);
      setAvailable(available);
    } catch (error) {
      console.error('Error checking username:', error);
    } finally {
      setChecking(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    setUsername(value);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validation = validateUsername(username);
    if (!validation.valid) {
      setError(validation.errors[0]);
      return;
    }

    if (available === false) {
      setError('Username is already taken');
      return;
    }

    setLoading(true);

    try {
      const { error } = await createProfile(username, username);
      
      if (error) throw error;

      navigate('/dashboard');
    } catch (error) {
      setError(error.message || 'Failed to set username');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-scale-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="mb-4">
            <InstaVuLogo className="w-20 h-20 mx-auto text-primary-600 animate-bounce" />
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Welcome to InstaVu! 🎉</h1>
          <p className="text-gray-600">Choose your unique username</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Setup Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={username}
                onChange={handleChange}
                className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition ${
                  available === true ? 'border-green-500' :
                  available === false || validationErrors.length > 0 ? 'border-red-500' :
                  'border-gray-300'
                }`}
                placeholder="johndoe"
                required
                disabled={loading}
                minLength={3}
                maxLength={20}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {checking && <LoadingSpinner className="w-5 h-5 text-primary-600" />}
                {!checking && available === true && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
                {!checking && (available === false || validationErrors.length > 0) && (
                  <ErrorCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
            </div>

            {/* Validation Messages */}
            <div className="mt-2 space-y-1">
              {validationErrors.length > 0 ? (
                validationErrors.map((err, idx) => (
                  <p key={idx} className="text-xs text-red-600 flex items-center gap-1">
                    <ErrorCircle className="w-3 h-3" />
                    {err}
                  </p>
                ))
              ) : (
                <>
                  {available === true && (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Username is available!
                    </p>
                  )}
                  {available === false && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <ErrorCircle className="w-3 h-3" />
                      Username is already taken
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Username Requirements */}
            <div className="mt-3 bg-gray-50 rounded-lg p-3">
              <p className="text-xs font-medium text-gray-700 mb-2">Username requirements:</p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li className="flex items-center gap-2">
                  <span className={username.length >= 3 ? 'text-green-600' : ''}>✓</span>
                  3-20 characters
                </li>
                <li className="flex items-center gap-2">
                  <span className={/^[a-z0-9_-]*$/.test(username) ? 'text-green-600' : ''}>✓</span>
                  Lowercase letters, numbers, underscore, hyphen only
                </li>
                <li className="flex items-center gap-2">
                  <span className={!/^[0-9]/.test(username) || !username ? 'text-green-600' : ''}>✓</span>
                  Cannot start with a number
                </li>
              </ul>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !available || validationErrors.length > 0}
            className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 rounded-lg font-semibold hover:from-primary-700 hover:to-primary-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <LoadingSpinner className="w-5 h-5" />}
            {loading ? 'Setting up...' : 'Continue to InstaVu'}
          </button>
        </form>
      </div>
    </div>
  );
}