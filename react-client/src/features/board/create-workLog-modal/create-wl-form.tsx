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
import type { ExecutorOption } from "@/shared/model/api";
import { useState } from "react";
import { getDepartmentConfig, type DepartmentConfig } from "@/features/departments/registry";
import { WorkTypePicker } from "./work-type-picker";

const recordTypeLabels: Record<string, string> = {
  WORK: "Работа",
  DEFECT: "Дефект",
  INSTALLATION: "Установка",
};

type FormValues = {
  recordType: "WORK" | "DEFECT" | "INSTALLATION";
  content: string;
  photos: File[];
  beforePhotos?: File[];
  executorIds?: string[];
  // динамические поля из конфига отдела — ключи заполняются в runtime
  [key: string]: unknown;
};

function buildSchema(config: DepartmentConfig) {
  const dynamicShape: Record<string, z.ZodTypeAny> = {};
  for (const field of config.fields) {
    let schema: z.ZodTypeAny = z.string();
    if (field.required) {
      schema = z.string().min(1, `${field.label} обязательно`);
    } else {
      schema = z.string().optional();
    }
    dynamicShape[field.key] = schema;
  }

  return z.object({
    recordType: z.enum(["WORK", "DEFECT", "INSTALLATION"], { required_error: "Тип записи обязателен" }),
    workType: z.string().min(1, "Вид работ обязателен"),
    content: z.string().min(1, "Описание обязательно"),
    photos: z.array(z.instanceof(File)).min(1, "Выберите хотя бы одно фото"),
    beforePhotos: z.array(z.instanceof(File)).optional(),
    executorIds: z.array(z.string()).optional(),
    ...dynamicShape,
  });
}

function buildDefaultValues(config: DepartmentConfig): Record<string, unknown> {
  const defaults: Record<string, unknown> = {
    recordType: "WORK" as const,
    workType: "",
    content: "",
    photos: [] as File[],
    beforePhotos: [] as File[],
    executorIds: [] as string[],
  };
  for (const field of config.fields) {
    defaults[field.key] = field.type === "select" ? (field.options?.[0] ?? "") : "";
  }
  return defaults;
}

export function WorkLogForm({
  footer,
  onSubmit,
  availableExecutors = [],
  currentUserId,
  departmentCode,
  formId,
}: {
  footer?: React.ReactNode;
  onSubmit: (data: FormValues) => void | Promise<void>;
  availableExecutors?: ExecutorOption[];
  currentUserId?: string;
  departmentCode?: string | null;
  formId?: string;
}) {
  const config = getDepartmentConfig(departmentCode);
  const schema = buildSchema(config);

  const [useBeforeAfter, setUseBeforeAfter] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: buildDefaultValues(config),
  });

  const selectedExecutorIds: string[] = (form.watch("executorIds") as string[]) ?? [];

  const toggleExecutor = (id: string) => {
    const current = selectedExecutorIds;
    const updated = current.includes(id)
      ? current.filter((x) => x !== id)
      : [...current, id];
    form.setValue("executorIds", updated);
  };

  const executorList = availableExecutors.filter((e) => e.id !== currentUserId);
  const workTypeValue = form.watch("workType") as string;

  return (
    <Form {...form}>
      <form
        id={formId}
        className="flex flex-col gap-5 w-full max-w-full"
        onSubmit={form.handleSubmit(onSubmit as Parameters<typeof form.handleSubmit>[0])}
      >
        {/* Тип записи */}
        <FormField
          control={form.control}
          name="recordType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Тип записи</FormLabel>
              <FormControl>
                <div className="flex gap-4">
                  {(["WORK", "DEFECT", "INSTALLATION"] as const).map((type) => (
                    <Button
                      key={type}
                      type="button"
                      className={`h-12 flex-1 py-3 text-base font-bold rounded-md border transition-colors duration-300
                        ${field.value === type ? "bg-blue-600 text-white" : "bg-gray-100 text-black"}`}
                      onClick={() => field.onChange(type)}
                    >
                      {recordTypeLabels[type]}
                    </Button>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Динамические поля отдела */}
        {config.fields.map((fieldCfg) => (
          <FormField
            key={fieldCfg.key}
            control={form.control}
            name={fieldCfg.key}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{fieldCfg.label}</FormLabel>
                <FormControl>
                  {fieldCfg.type === "select" ? (
                    <div className="flex gap-2 flex-wrap">
                      {fieldCfg.options?.map((opt) => (
                        <Button
                          key={opt}
                          type="button"
                          className={`h-12 flex-1 py-3 text-xl font-bold rounded-md border transition-colors duration-300
                            ${field.value === opt ? "bg-green-600 text-white" : "bg-gray-100 text-black"}`}
                          onClick={() => field.onChange(opt)}
                        >
                          {opt}
                        </Button>
                      ))}
                    </div>
                  ) : fieldCfg.type === "textarea" ? (
                    <Textarea placeholder={fieldCfg.label} {...field} value={field.value as string ?? ""} />
                  ) : (
                    <Input placeholder={fieldCfg.label} {...field} value={field.value as string ?? ""} />
                  )}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}

        {/* Выбор вида работ */}
        <WorkTypePicker
          selected={workTypeValue}
          onSelect={(title) => form.setValue("workType", title)}
        />

        {/* Описание работы */}
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Описание</FormLabel>
              <FormControl>
                <Textarea placeholder="Описание работы / дефекта..." {...field} value={field.value as string ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Фото */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="beforeAfterToggle"
              className="w-4 h-4 cursor-pointer"
              checked={useBeforeAfter}
              onChange={(e) => {
                setUseBeforeAfter(e.target.checked);
                if (!e.target.checked) form.setValue("beforePhotos", []);
              }}
            />
            <label htmlFor="beforeAfterToggle" className="text-sm font-medium cursor-pointer">
              Фото до / после
            </label>
          </div>

          {useBeforeAfter ? (
            <>
              <FormField
                control={form.control}
                name="beforePhotos"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Фото ДО</FormLabel>
                    <FormControl>
                      <Input
                        className="text-sm"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => field.onChange(Array.from(e.target.files ?? []))}
                      />
                    </FormControl>
                    {(field.value as File[])?.length > 0 && (
                      <p className="text-xs text-gray-500">{(field.value as File[]).length} фото выбрано</p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="photos"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Фото ПОСЛЕ</FormLabel>
                    <FormControl>
                      <Input
                        className="text-sm"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => field.onChange(Array.from(e.target.files ?? []))}
                      />
                    </FormControl>
                    {(field.value as File[])?.length > 0 && (
                      <p className="text-xs text-gray-500">{(field.value as File[]).length} фото выбрано</p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          ) : (
            <FormField
              control={form.control}
              name="photos"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Фото</FormLabel>
                  <FormControl>
                    <Input
                      className="text-sm"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => field.onChange(Array.from(e.target.files ?? []))}
                    />
                  </FormControl>
                  {(field.value as File[])?.length > 0 && (
                    <p className="text-xs text-gray-500">{(field.value as File[]).length} фото выбрано</p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {/* Соисполнители */}
        {executorList.length > 0 && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Соисполнители</label>
            <div className="border rounded-md max-h-40 overflow-y-auto divide-y">
              {executorList.map((ex) => (
                <label
                  key={ex.id}
                  className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    className="w-4 h-4 shrink-0"
                    checked={selectedExecutorIds.includes(ex.id)}
                    onChange={() => toggleExecutor(ex.id)}
                  />
                  <span className="text-sm">
                    {ex.position && <span className="text-gray-500">{ex.position} — </span>}
                    {ex.fullName}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {footer}
      </form>
    </Form>
  );
}
