import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/kit/dialog";
import { Button } from "@/shared/ui/kit/button";
import type { ActConfig, ActSettings, Concordant } from "./use-concordants";

type ActKey = keyof ActSettings;

const TAB_LABELS: Record<ActKey, string> = {
  workAct: "Акт выполненных работ",
  defectAct: "Дефектный акт",
  installationAct: "Акт установки",
};

const TABS: ActKey[] = ["workAct", "defectAct", "installationAct"];

const BODY_HINT: Record<ActKey, string> = {
  workAct: "Плейсхолдеры: {name} — исполнитель, {days} — дней в месяце, {month} — месяц, {year} — год",
  defectAct: "Плейсхолдер: {name} — исполнитель",
  installationAct: "Плейсхолдер: {name} — исполнитель",
};

type Props = {
  settings: ActSettings;
  onUpdate: (actType: ActKey, patch: Partial<ActConfig>) => void;
  onReset: (actType: ActKey) => void;
};

export function ConcordantsEditor({ settings, onUpdate, onReset }: Props) {
  const [activeTab, setActiveTab] = useState<ActKey>("workAct");

  const config = settings[activeTab];

  const handleConcordantChange = (index: number, field: keyof Concordant, value: string) => {
    const updated = config.concordants.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    onUpdate(activeTab, { concordants: updated });
  };

  const handleAddConcordant = () => {
    onUpdate(activeTab, { concordants: [...config.concordants, { post: "", fullName: "" }] });
  };

  const handleRemoveConcordant = (index: number) => {
    onUpdate(activeTab, { concordants: config.concordants.filter((_, i) => i !== index) });
  };

  const handleMoveConcordant = (index: number, dir: -1 | 1) => {
    const list = [...config.concordants];
    const target = index + dir;
    if (target < 0 || target >= list.length) return;
    [list[index], list[target]] = [list[target], list[index]];
    onUpdate(activeTab, { concordants: list });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Настройки актов
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Настройки актов</DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-1 border-b pb-2 flex-wrap">
          {TABS.map((tab) => (
            <button
              key={tab}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                activeTab === tab
                  ? "bg-gray-900 text-white"
                  : "hover:bg-gray-100 text-gray-600"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto flex-1 pr-1 space-y-5">

          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Заголовок</label>
            <textarea
              className="w-full border rounded px-2 py-1.5 text-sm resize-none"
              rows={3}
              value={config.title}
              onChange={(e) => onUpdate(activeTab, { title: e.target.value })}
            />
          </div>

          {/* Body */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Вступительный текст</label>
            <textarea
              className="w-full border rounded px-2 py-1.5 text-sm resize-none"
              rows={4}
              value={config.body}
              onChange={(e) => onUpdate(activeTab, { body: e.target.value })}
            />
            <p className="text-xs text-gray-400 mt-1">{BODY_HINT[activeTab]}</p>
          </div>

          {/* Photo Scale */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Размер фото (100 — по умолчанию)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                className="border rounded px-2 py-1.5 text-sm w-24"
                min={50}
                max={200}
                value={config.photoScale}
                onChange={(e) => onUpdate(activeTab, { photoScale: Number(e.target.value) })}
              />
              <span className="text-sm text-gray-400">50–200</span>
            </div>
          </div>

          {/* Concordants */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">Состав комиссии</label>
            <div className="space-y-2">
              {config.concordants.map((item, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <span className="text-xs text-gray-400 w-5 text-right shrink-0">{i + 1}.</span>
                  <input
                    className="border rounded px-2 py-1 text-sm flex-1 min-w-0"
                    placeholder="Должность"
                    value={item.post}
                    onChange={(e) => handleConcordantChange(i, "post", e.target.value)}
                  />
                  <input
                    className="border rounded px-2 py-1 text-sm w-36 shrink-0"
                    placeholder="Инициалы"
                    value={item.fullName}
                    onChange={(e) => handleConcordantChange(i, "fullName", e.target.value)}
                  />
                  <div className="flex flex-col gap-0.5 shrink-0">
                    <button
                      className="text-gray-400 hover:text-gray-700 text-xs leading-none px-1"
                      onClick={() => handleMoveConcordant(i, -1)}
                      disabled={i === 0}
                    >▲</button>
                    <button
                      className="text-gray-400 hover:text-gray-700 text-xs leading-none px-1"
                      onClick={() => handleMoveConcordant(i, 1)}
                      disabled={i === config.concordants.length - 1}
                    >▼</button>
                  </div>
                  <button
                    className="text-red-400 hover:text-red-600 text-sm px-1 shrink-0"
                    onClick={() => handleRemoveConcordant(i)}
                  >✕</button>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="mt-3" onClick={handleAddConcordant}>
              + Добавить строку
            </Button>
          </div>

        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <p className="text-xs text-gray-400">Изменения сохраняются автоматически</p>
          <Button
            variant="outline"
            size="sm"
            className="text-gray-500"
            onClick={() => {
              if (confirm(`Сбросить "${TAB_LABELS[activeTab]}" к значениям по умолчанию?`)) {
                onReset(activeTab);
              }
            }}
          >
            Сбросить
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
