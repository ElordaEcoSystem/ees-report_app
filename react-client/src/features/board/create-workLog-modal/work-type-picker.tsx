import { useState } from "react";
import { WORK_TYPES } from "./work-types";

type Props = {
  onSelect: (title: string) => void;
  selected?: string;
};

export function WorkTypePicker({ onSelect, selected }: Props) {
  const [open, setOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const handleSelect = (title: string) => {
    onSelect(title);
    setOpen(false);
    setExpandedId(null);
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Кнопка открытия справочника */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between w-full min-h-[48px] px-4 py-3 rounded-lg border-2 border-blue-300 bg-blue-50 text-left transition-colors active:bg-blue-100"
      >
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-blue-500 font-medium uppercase tracking-wide">
            Вид работ
          </span>
          <span className="text-sm font-semibold text-blue-800 leading-tight">
            {selected
              ? selected.length > 45
                ? selected.slice(0, 45) + "…"
                : selected
              : "Выбрать из справочника"}
          </span>
        </div>
        <svg
          className={`w-5 h-5 text-blue-500 shrink-0 ml-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Список видов работ */}
      {open && (
        <div className="rounded-xl border-2 border-gray-200 overflow-hidden bg-white shadow-md">
          <div className="max-h-[55vh] overflow-y-auto divide-y divide-gray-100">
            {WORK_TYPES.map((wt) => (
              <div key={wt.id}>
                {/* Строка — вся кликабельна для раскрытия */}
                <button
                  type="button"
                  onClick={() =>
                    setExpandedId((prev) => (prev === wt.id ? null : wt.id))
                  }
                  className="flex items-center gap-3 w-full text-left px-4 py-4 min-h-[64px] hover:bg-gray-50 active:bg-gray-100 transition-colors"
                >
                  {/* Номер-бейдж */}
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-sm font-bold shrink-0">
                    {wt.id}
                  </span>
                  {/* Название */}
                  <span className="flex-1 text-sm font-medium text-gray-800 leading-snug">
                    {wt.title}
                  </span>
                  {/* Стрелка */}
                  <svg
                    className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-200 ${expandedId === wt.id ? "rotate-180 text-blue-500" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Раскрытое содержимое */}
                {expandedId === wt.id && (
                  <div className="px-4 pb-4 pt-1 bg-blue-50 border-t border-blue-100">
                    <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide mb-3">
                      Состав работ:
                    </p>
                    <ul className="space-y-2 mb-4">
                      {wt.items.map((item, i) => (
                        <li key={i} className="flex gap-2 text-sm text-gray-700">
                          <span className="text-blue-400 font-bold shrink-0 mt-px">•</span>
                          <span className="leading-snug">{item}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => handleSelect(wt.title)}
                      className="w-full h-12 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-base rounded-xl transition-colors shadow-sm"
                    >
                      Выбрать этот вид работ
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
