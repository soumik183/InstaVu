import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Icon, { ICONS } from '../../components/common/Icon';
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 w-full max-w-md p-6 sm:p-8 animate-scale-in">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="mb-4">
            <div className="inline-block p-3 bg-primary-500 rounded-xl animate-bounce">
              <Icon name={ICONS.ALL_FILES} className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to InstaVu! 🎉</h1>
          <p className="text-gray-600 text-sm">Choose your unique username</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg mb-4 text-sm">
            <div className="flex items-start gap-2">
              <Icon name={ICONS.ERROR} className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
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
              <Icon name={ICONS.USER} className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={username}
                onChange={handleChange}
                className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-sm ${
                  available === true ? 'border-success-500' :
                  available === false || validationErrors.length > 0 ? 'border-error-500' :
                  'border-gray-300'
                }`}
                placeholder="johndoe"
                required
                disabled={loading}
                minLength={3}
                maxLength={20}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {checking && <Icon name={ICONS.LOADING} spin className="w-5 h-5 text-primary-600" />}
                {!checking && available === true && (
                  <Icon name={ICONS.CHECK} className="w-5 h-5 text-success-500" />
                )}
                {!checking && (available === false || validationErrors.length > 0) && (
                  <Icon name={ICONS.ERROR} className="w-5 h-5 text-error-500" />
                )}
              </div>
            </div>

            {/* Validation Messages */}
            <div className="mt-2 space-y-1">
              {validationErrors.length > 0 ? (
                validationErrors.map((err, idx) => (
                  <p key={idx} className="text-xs text-error-600 flex items-center gap-1">
                    <Icon name={ICONS.ERROR} className="w-3 h-3" />
                    {err}
                  </p>
                ))
              ) : (
                <>
                  {available === true && (
                    <p className="text-xs text-success-600 flex items-center gap-1">
                      <Icon name={ICONS.CHECK} className="w-3 h-3" />
                      Username is available!
                    </p>
                  )}
                  {available === false && (
                    <p className="text-xs text-error-600 flex items-center gap-1">
                      <Icon name={ICONS.ERROR} className="w-3 h-3" />
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
                  <span className={username.length >= 3 ? 'text-success-600' : 'text-gray-400'}>✓</span>
                  3-20 characters
                </li>
                <li className="flex items-center gap-2">
                  <span className={/^[a-z0-9_-]*$/.test(username) ? 'text-success-600' : 'text-gray-400'}>✓</span>
                  Lowercase letters, numbers, underscore, hyphen only
                </li>
                <li className="flex items-center gap-2">
                  <span className={!/^[0-9]/.test(username) || !username ? 'text-success-600' : 'text-gray-400'}>✓</span>
                  Cannot start with a number
                </li>
              </ul>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !available || validationErrors.length > 0}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <Icon name={ICONS.LOADING} spin className="w-5 h-5" />}
            {loading ? 'Setting up...' : 'Continue to InstaVu'}
          </button>
        </form>
      </div>
    </div>
  );
}