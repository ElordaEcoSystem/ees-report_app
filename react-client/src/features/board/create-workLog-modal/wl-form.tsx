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

const workLogSchema = z.object({
  object: z.string({ required_error: "ОБъект обязателен" }),
  content: z.string({ required_error: "Проделанная работа обязательна" }),
  photo: z.instanceof(File),
});

export function WorkLogForm({
  footer,
  onSubmit,
}: {
  footer: React.ReactNode;
  onSubmit: (data: z.infer<typeof workLogSchema>) => void | Promise<void>;
}) {
  const form = useForm({
    resolver: zodResolver(workLogSchema),
    defaultValues: {
      object: "",
      content: "",
      photo: undefined,
    },
  });

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-4 w-full max-w-full"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="object"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Объект</FormLabel>
              <FormControl>
                <Input placeholder="object" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Проделанная работа</FormLabel>
              <FormControl>
                <Input placeholder="Проделанная работа..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="photo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Фото</FormLabel>
              <FormControl>
                <div className="grid w-full max-w-sm items-center gap-3 ">
                  <Input
                    className="text-sm"
                    type="file"
                    accept="image/*"
                    capture="environment" // <-- включает камеру заднего вида
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      field.onChange(file); // обновляем значение формы
                    }}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {footer}
      </form>
    </Form>
  );
}
