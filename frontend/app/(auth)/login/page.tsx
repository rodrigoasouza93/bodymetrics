import { signInWithEmail } from "@/src/features/auth/actions/auth-actions";
import { AuthForm } from "@/src/features/auth/components/auth-form";

interface LoginPageProps {
  readonly searchParams: Promise<{
    readonly password?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const initialState =
    params.password === "updated"
      ? { success: "Senha alterada com sucesso. Entre novamente para continuar." }
      : undefined;

  return (
    <AuthForm
      action={signInWithEmail}
      alternateHref="/sign-up"
      alternateLabel="Criar uma conta"
      buttonLabel="Entrar"
      initialState={initialState}
      passwordAutoComplete="current-password"
      passwordHelpHref="/auth/reset-password"
      passwordHelpLabel="Esqueci minha senha"
      title="Entrar no BodyMetrics"
    />
  );
}
