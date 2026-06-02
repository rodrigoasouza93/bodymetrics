import { signInWithEmail } from "@/src/features/auth/actions/auth-actions";
import { AuthForm } from "@/src/features/auth/components/auth-form";

export default function LoginPage() {
  return (
    <AuthForm
      action={signInWithEmail}
      alternateHref="/sign-up"
      alternateLabel="Criar uma conta"
      buttonLabel="Entrar"
      passwordAutoComplete="current-password"
      title="Entrar no BodyMetrics"
    />
  );
}
