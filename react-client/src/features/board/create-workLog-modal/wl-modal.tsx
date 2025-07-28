import { Dialog, DialogContent, DialogTitle } from "@/shared/ui/kit/dialog";
import { useCreateWorkLogModal } from "./use-create-wl-modal";
import { WorkLogForm } from "./wl-form";
import { Button } from "@/shared/ui/kit/button";
import z from "zod";
import { fetchCreateWorkLog } from "@/shared/model/api";
const workLogSchema = z.object({
  object: z.string({ required_error: "ОБъект обязателен" }),
  content: z.string({ required_error: "Проделанная работа обязательна" }),
  photo: z.instanceof(File),
});

export function CreateWorkLogModal() {
  const { isOpen, close } = useCreateWorkLogModal();
  const handleSubmit = async (data: z.infer<typeof workLogSchema>) => {
    const response = await fetchCreateWorkLog(data);
    if (response) {
      close();
    }
    console.log("Данные формы:", data);
    // тут можешь отправлять на бекенд
  };
  return (
    <Dialog onOpenChange={close} open={isOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogTitle>Фиксация работы</DialogTitle>
        <WorkLogForm
          onSubmit={handleSubmit}
          footer={<Button type="submit">Отправить</Button>}
        ></WorkLogForm>
      </DialogContent>
    </Dialog>
  );
}
