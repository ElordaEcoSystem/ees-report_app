import { Dialog, DialogContent, DialogTitle } from "@/shared/ui/kit/dialog";
import { useCreateWorkLogModal } from "./use-create-wl-modal";
import { WorkLogForm } from "./wl-form";
import { Button } from "@/shared/ui/kit/button";
import z from "zod";
import { fetchCreateWorkLog } from "@/shared/model/api";
import { useState } from "react";
const workLogSchema = z.object({
  object: z.string({ required_error: "ОБъект обязателен" }),
  content: z.string({ required_error: "Проделанная работа обязательна" }),
  photo: z.instanceof(File),
});

export function CreateWorkLogModal() {
  const { isOpen, close } = useCreateWorkLogModal();
  const [isLoading, setIsLoading] = useState(false);
   const handleSubmit = async (data: z.infer<typeof workLogSchema>) => {
    setIsLoading(true);
    try {
      const response = await fetchCreateWorkLog(data);
      if (response) {
        close();
      }
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Dialog onOpenChange={close} open={isOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogTitle>Фиксация работы</DialogTitle>
        <WorkLogForm
          onSubmit={handleSubmit}
          footer={<Button type="submit" disabled={isLoading}>{isLoading ? "Отправка..." : "Отправить"}</Button>}
        ></WorkLogForm>
      </DialogContent>
    </Dialog>
  );
}
