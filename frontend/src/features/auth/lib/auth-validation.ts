export const MIN_PASSWORD_LENGTH = 6;

export const validateEmail = (email: string) => {
  if (!email) {
    return "Informe o email.";
  }

  if (!email.includes("@")) {
    return "Informe um email válido.";
  }

  return null;
};

export const validatePassword = (password: string) => {
  if (!password) {
    return "Informe a senha.";
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return "A senha precisa ter pelo menos 6 caracteres.";
  }

  return null;
};

export const validateCredentials = (email: string, password: string) => {
  if (!email || !password) {
    return "Informe email e senha.";
  }

  return validateEmail(email) ?? validatePassword(password);
};
