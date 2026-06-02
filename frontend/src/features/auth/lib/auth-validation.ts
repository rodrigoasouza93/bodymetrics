export const MIN_PASSWORD_LENGTH = 6;

export const validateCredentials = (email: string, password: string) => {
  if (!email || !password) {
    return "Informe email e senha.";
  }

  if (!email.includes("@")) {
    return "Informe um email válido.";
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return "A senha precisa ter pelo menos 6 caracteres.";
  }

  return null;
};
