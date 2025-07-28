import { AuthLayout } from "./auth-layout";
import { LoginForm } from "./login-form";

function LoginPage() {
  return (
    <AuthLayout
      title="Вход в систему"
      description="Введите email и пароль для входв в систему"
      form={<LoginForm />}
    />
  );
}

export const Component = LoginPage;
