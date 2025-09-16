// import {
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
//   Form,
// } from "@/shared/ui/kit/form";
// import { Input } from "@/shared/ui/kit/input";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { Textarea } from "@/shared/ui/kit/textarea";

// const workLogSchema = z.object({
//   object: z.string({ required_error: "ОБъект обязателен" }),
//   content: z.string({ required_error: "Проделанная работа обязательна" }),
//   photo: z.instanceof(File),
// });
 
// export function WorkLogForm({
//   footer,
//   onSubmit,
// }: {
//   footer: React.ReactNode;
//   onSubmit: (data: z.infer<typeof workLogSchema>) => void | Promise<void>;
// }) {
//   const form = useForm({
//     resolver: zodResolver(workLogSchema),
//     defaultValues: {
//       object: "",
//       content: "",
//       photo: undefined,
//     },
//   });

//   return (
//     <Form {...form}>
//       <form
//         className="flex flex-col gap-4 w-full max-w-full"
//         onSubmit={form.handleSubmit(onSubmit)}
//       >
        
//          <FormField
//           control={form.control}
//           name="object"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Объект</FormLabel>
//               <FormControl>
//                 <Input placeholder="object" {...field} />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />
//         <FormField
//           control={form.control}
//           name="content"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Проделанная работа</FormLabel>
//               <FormControl>
//                 <Textarea placeholder="Проделанная работа..." {...field} />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />
//         <FormField
//           control={form.control}
//           name="photo"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Фото</FormLabel>
//               <FormControl>
//                 <div className="grid w-full max-w items-center gap-3 ">
//                   <Input
//                     className="text-sm"
//                     type="file"
//                     accept="image/*"
//                     // capture="environment" // <-- включает камеру заднего вида
//                     onChange={(e) => {
//                       const file = e.target.files?.[0];
//                       field.onChange(file); // обновляем значение формы
//                     }}
//                   />
//                 </div>
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />
//         {footer}
//       </form>
//     </Form>
//   );
// }



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
import { Textarea } from "@/shared/ui/kit/textarea";
import { Button } from "@/shared/ui/kit/button";

const workLogSchema = z.object({
  objectType: z.enum(["НС", "БКНС","ОС"], { required_error: "Тип обязателен" }), // 👈 добавляем тип
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
        className="flex flex-col gap-5 w-full max-w-full"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        
       <div className="flex flex-col gap-2">
          <FormField
          control={form.control}
          name="objectType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Объект</FormLabel>
              <FormControl>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    className={` h-12 flex-1 py-3 text-xl font-bold rounded-md border transition-colors duration-300
                      ${field.value === "НС" ? "bg-green-600 text-white" : "bg-gray-100 text-black"}`}
                    onClick={() => field.onChange("НС")}
                  >
                    НС
                  </Button>
                  <Button
                    type="button"
                    className={`h-12 flex-1 py-3 text-xl font-bold rounded-md border   transition-colors duration-300
                      ${field.value === "БКНС" ? "bg-green-600 text-white" : "bg-gray-100 text-black"}`}
                    onClick={() => field.onChange("БКНС")}
                  >
                    БКНС
                  </Button>
                  <Button
                    type="button"
                    className={`h-12 flex-1 py-3 text-xl font-bold rounded-md border   transition-colors duration-300
                      ${field.value === "ОС" ? "bg-green-600 text-white" : "bg-gray-100 text-black"}`}
                    onClick={() => field.onChange("ОС")}
                  >
                    ОС
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

         <FormField
          control={form.control}
          name="object"
          render={({ field }) => (
            <FormItem>
              {/* <FormLabel>Объект</FormLabel> */}
              <FormControl>
                <Input placeholder="object" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
       </div>
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Проделанная работа</FormLabel>
              <FormControl>
                <Textarea placeholder="Проделанная работа..." {...field} />
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
                <div className="grid w-full max-w items-center gap-3 ">
                  <Input
                    className="text-sm"
                    type="file"
                    accept="image/*"
                    // capture="environment" // <-- включает камеру заднего вида
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
