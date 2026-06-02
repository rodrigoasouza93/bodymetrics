import { signUpWithEmail } from "@/src/features/auth/actions/auth-actions";
import { AuthForm } from "@/src/features/auth/components/auth-form";

export default function SignUpPage() {
  return (
    <AuthForm
      action={signUpWithEmail}
      alternateHref="/login"
      alternateLabel="Já tenho conta"
      buttonLabel="Criar conta"
      passwordAutoComplete="new-password"
      title="Criar sua conta"
    />
  );
}
