import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/shared/ui/kit/dialog";
import { useTemplatesModal } from "./use-templates-modal";

export function LayoutModal({
  title,
  form,
  footer,
}: {
  title: React.ReactNode;
  form: React.ReactNode;
  footer: React.ReactNode;
}) {
  const { isOpen, close } = useTemplatesModal();
  return (
    <Dialog onOpenChange={close} open={isOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogTitle>{title}</DialogTitle>
        {form}
        <DialogFooter>{footer}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
