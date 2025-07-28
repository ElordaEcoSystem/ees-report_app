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
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const navigate = useNavigate();

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      const response = await fetchLogin(data);
      localStorage.setItem("token", response.token);
      navigate("/board");
    } catch (error) {
      console.error("Ошибка входа:", error.message);
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
        <Button type="submit">Войти</Button>
      </form>
    </Form>
  );
}
