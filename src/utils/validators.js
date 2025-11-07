// Validate email format
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Validate password strength
export const validatePassword = (password) => {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain lowercase letter');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain uppercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain a number');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    strength: getPasswordStrength(password),
  };
};

// Get password strength
export const getPasswordStrength = (password) => {
  let strength = 0;
  
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;
  
  if (strength <= 2) return 'weak';
  if (strength <= 4) return 'medium';
  return 'strong';
};

// Validate username
export const validateUsername = (username) => {
  const errors = [];
  
  if (username.length < 3) {
    errors.push('Username must be at least 3 characters');
  }
  
  if (username.length > 20) {
    errors.push('Username must be less than 20 characters');
  }
  
  if (!/^[a-z0-9_-]+$/.test(username)) {
    errors.push('Username can only contain lowercase letters, numbers, underscore, and hyphen');
  }
  
  if (/^[0-9]/.test(username)) {
    errors.push('Username cannot start with a number');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
};

// Validate URL
export const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Validate Supabase URL
export const validateSupabaseUrl = (url) => {
  if (!validateUrl(url)) return false;
  return url.includes('supabase.co') || url.includes('supabase.in');
};