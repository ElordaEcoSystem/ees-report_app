/**
 * Department Registry — конфигурация отделов.
 * Чтобы добавить новый отдел: создать конфиг и добавить в DEPARTMENT_REGISTRY.
 *
 * storageKey определяет, куда сохраняется значение поля:
 *   'objectType' → WorkLog.objectType
 *   'object'     → WorkLog.object
 *   'extra'      → WorkLog.extraFields[key]
 */

export type FieldType = "text" | "select" | "textarea";

export type StorageKey = "objectType" | "object" | "extra";

export type FieldConfig = {
  key: string;
  label: string;
  type: FieldType;
  storageKey: StorageKey;
  options?: string[];      // только для type === "select"
  required: boolean;
  showInList: boolean;     // показывать столбец в таблице списка
  showInPdf: boolean;      // показывать столбец в PDF
  pdfWidth?: number;       // ширина столбца в PDF (pt)
};

export type DepartmentConfig = {
  code: string;
  name: string;
  fields: FieldConfig[];
};

// ─── АСУТП ───────────────────────────────────────────────────────────────────
const asutP: DepartmentConfig = {
  code: "asutP",
  name: "АСУТП",
  fields: [
    {
      key: "objectType",
      label: "Тип объекта",
      type: "select",
      storageKey: "objectType",
      options: ["НС", "БКНС", "ОС"],
      required: true,
      showInList: true,
      showInPdf: false, // в PDF вставляется перед объектом: "НС-5"
    },
    {
      key: "object",
      label: "Объект",
      type: "text",
      storageKey: "object",
      required: true,
      showInList: true,
      showInPdf: true,
      pdfWidth: 95,
    },
  ],
};

// ─── Отдел эксплуатации НС ───────────────────────────────────────────────────
const exploitation: DepartmentConfig = {
  code: "exploitation",
  name: "Отдел эксплуатации НС",
  fields: [
    {
      key: "object",
      label: "Насосная станция",
      type: "text",
      storageKey: "object",
      required: true,
      showInList: true,
      showInPdf: true,
      pdfWidth: 80,
    },
    {
      key: "equipment",
      label: "Оборудование",
      type: "text",
      storageKey: "extra",
      required: false,
      showInList: true,
      showInPdf: true,
      pdfWidth: 80,
    },
  ],
};

// ─── Отдел аварийных ситуаций ─────────────────────────────────────────────────
const emergency: DepartmentConfig = {
  code: "emergency",
  name: "Отдел аварийных ситуаций",
  fields: [
    {
      key: "object",
      label: "Адрес",
      type: "text",
      storageKey: "object",
      required: true,
      showInList: true,
      showInPdf: true,
      pdfWidth: 110,
    },
    {
      key: "incidentType",
      label: "Тип аварии",
      type: "text",
      storageKey: "extra",
      required: false,
      showInList: false,
      showInPdf: true,
      pdfWidth: 80,
    },
    {
      key: "severity",
      label: "Степень",
      type: "select",
      storageKey: "extra",
      options: ["Критическая", "Средняя", "Низкая"],
      required: true,
      showInList: true,
      showInPdf: true,
      pdfWidth: 65,
    },
  ],
};

// ─── Энергетический участок ───────────────────────────────────────────────────
const energy: DepartmentConfig = {
  code: "energy",
  name: "Энергетический участок",
  fields: [
    {
      key: "objectType",
      label: "Тип объекта",
      type: "select",
      storageKey: "objectType",
      options: ["НС", "БКНС", "ОС"],
      required: true,
      showInList: true,
      showInPdf: false,
    },
    {
      key: "object",
      label: "Объект",
      type: "text",
      storageKey: "object",
      required: true,
      showInList: true,
      showInPdf: true,
      pdfWidth: 95,
    },
  ],
};

// ─── Реестр ──────────────────────────────────────────────────────────────────
export const DEPARTMENT_REGISTRY: Record<string, DepartmentConfig> = {
  asutP,
  exploitation,
  emergency,
  energy,
};

/** Fallback-конфиг для пользователей без отдела (совместимость) */
export const DEFAULT_DEPARTMENT_CONFIG: DepartmentConfig = asutP;

export function getDepartmentConfig(code: string | null | undefined): DepartmentConfig {
  if (!code) return DEFAULT_DEPARTMENT_CONFIG;
  return DEPARTMENT_REGISTRY[code] ?? DEFAULT_DEPARTMENT_CONFIG;
}

/**
 * Извлекает значение поля из WorkLog.
 * objectType → wl.objectType, object → wl.object, extra → wl.extraFields[key]
 */
export function getFieldValue(
  field: FieldConfig,
  wl: { objectType?: string | null; object: string; extraFields?: Record<string, unknown> }
): string {
  if (field.storageKey === "objectType") return wl.objectType ?? "";
  if (field.storageKey === "object") return wl.object ?? "";
  return String(wl.extraFields?.[field.key] ?? "");
}
