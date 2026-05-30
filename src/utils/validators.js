export const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validatePhone = (phone) => {
  return /^[0-9]{10}$/.test(phone);
};

export const validateFullName = (name) => {
  return name.trim().length > 0 && name.trim().length <= 50;
};

export const validatePassword = (password) => {
  return password.length >= 6;
};