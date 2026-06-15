import { Button } from "@/shared/ui/kit/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Form,
} from "@/shared/ui/kit/form";
import { Input } from "@/shared/ui/kit/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
import { fetchLogin } from "@/shared/model/api";
import { useState } from "react";

const loginSchema = z.object({
  email: z
    .string({ required_error: "Email обязателен" })
    .email("Неверно указан email"),
  password: z
    .string({ required_error: "Пароль обязателен" })
    .min(8, "Пароль должен быть не менее 8"),
});

export function LoginForm() {
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = form.handleSubmit(async (data) => {
    setError(null);
    setLoading(true);
    try {
      const response = await fetchLogin(data);
      localStorage.setItem("token", response.token);
      navigate("/board");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg ?? "Ошибка входа. Попробуйте снова.");
    } finally {
      setLoading(false);
    }
  });

  return (
    <Form {...form}>
      <form className="flex flex-col gap-4 w-full" onSubmit={onSubmit}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Пароль</FormLabel>
              <FormControl>
                <Input placeholder="********" {...field} type="password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</p>
        )}
        <Button type="submit" disabled={loading}>{loading ? "Вход..." : "Войти"}</Button>
      </form>
    </Form>
  );
}
