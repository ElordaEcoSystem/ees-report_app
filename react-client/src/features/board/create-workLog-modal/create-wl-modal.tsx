import { Dialog, DialogContent, DialogTitle } from "@/shared/ui/kit/dialog";
import { useCreateWorkLogModal } from "./use-create-wl-modal";
import { WorkLogForm } from "./create-wl-form";
import { Button } from "@/shared/ui/kit/button";
import { fetchCreateWorkLog, fetchWorkLogList, fetchExecutors, type ExecutorOption } from "@/shared/model/api";
import { useState, useEffect } from "react";
import { resizeImageFile } from "@/shared/model/compressPhoto";
import { useBoard } from "../use-board";
import { getDepartmentConfig } from "@/features/departments/registry";

export function CreateWorkLogModal() {
  const { isOpen, close } = useCreateWorkLogModal();
  const { setWorkLogList, currentUser } = useBoard();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [executors, setExecutors] = useState<ExecutorOption[]>([]);

  const departmentCode = currentUser?.department?.code ?? null;
  const config = getDepartmentConfig(departmentCode);

  useEffect(() => {
    if (isOpen) {
      fetchExecutors().then(setExecutors).catch(() => {});
    }
  }, [isOpen]);

  const handleSubmit = async (data: Record<string, unknown>) => {
    setIsLoading(true);
    setError(null);
    try {
      // Разбиваем динамические поля на storageKey-назначения
      let objectType: string | undefined;
      let object = "";
      const extraFields: Record<string, unknown> = {};

      for (const field of config.fields) {
        const val = data[field.key] as string | undefined;
        if (field.storageKey === "objectType") objectType = val;
        else if (field.storageKey === "object") object = val ?? "";
        else if (val) extraFields[field.key] = val;
      }

      const workType = data.workType as string | undefined;
      if (workType) extraFields.workType = workType;

      const photos = data.photos as File[];
      const beforePhotos = data.beforePhotos as File[] | undefined;

      const resizedPhotos = await Promise.all(photos.map(resizeImageFile));
      const resizedBeforePhotos = beforePhotos?.length
        ? await Promise.all(beforePhotos.map(resizeImageFile))
        : undefined;

      await fetchCreateWorkLog({
        recordType: data.recordType as string,
        objectType,
        object,
        content: data.content as string,
        photos: resizedPhotos,
        beforePhotos: resizedBeforePhotos,
        executorIds: data.executorIds as string[] | undefined,
        extraFields: Object.keys(extraFields).length > 0 ? extraFields : undefined,
      });

      const updated = await fetchWorkLogList();
      setWorkLogList(updated.items);
      close();
    } catch (err: unknown) {
      const axiosMsg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      const message = axiosMsg ?? (err instanceof Error ? err.message : "Ошибка при создании записи");
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog onOpenChange={close} open={isOpen}>
      <DialogContent className="sm:max-w-[425px] flex flex-col max-h-[92svh] p-0 overflow-hidden">
        <div className="shrink-0 px-6 pt-6 pb-3 border-b">
          <DialogTitle className="text-center">Фиксация работы</DialogTitle>
          {error && (
            <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <WorkLogForm
            formId="worklog-form"
            onSubmit={handleSubmit}
            availableExecutors={executors}
            currentUserId={currentUser?.userId}
            departmentCode={departmentCode}
          />
        </div>
        <div className="shrink-0 px-6 py-4 border-t bg-background">
          <Button className="h-12 w-full" type="submit" form="worklog-form" disabled={isLoading}>
            {isLoading ? "Отправка..." : "Отправить"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
