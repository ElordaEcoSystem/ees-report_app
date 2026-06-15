import { useState } from "react";

export type Concordant = { post: string; fullName: string };

export type ActConfig = {
  title: string;
  body: string;
  concordants: Concordant[];
  photoScale: number;
};

export type ActSettings = {
  workAct: ActConfig;
  defectAct: ActConfig;
  installationAct: ActConfig;
};

export const DEFAULT_SETTINGS: ActSettings = {
  workAct: {
    title: "АКТ\nвыполненных работ Службы информационных технологий\nи автоматизированных систем",
    body: "В период с 1 по {days} {month} {year} года инженерами КИП {name} на базе Предприятия успешно проведено плановое ремонтное обслуживание оборудования и систем, что позволило обеспечить бесперебойную работу насосных агрегатов и других технических устройств. В рамках проведения работ был выполнен ряд задач, связанных с диагностикой, сборкой, подключением и настройкой различных элементов насосных установок.",
    photoScale: 100,
    concordants: [
      { post: "Заместитель генерального директора", fullName: "А. Жагипаров" },
      { post: "Руководитель СЭОС", fullName: "Б. Шаймуханбетов" },
      { post: "Руководителя СЭНС", fullName: "Т. Козгумбаев" },
      { post: "Руководителя СИТиАС", fullName: "Е. Есимбеков" },
      { post: "Инженер АСУТП", fullName: "К. Есмухамбетов" },
      { post: "Инженер АСУТП", fullName: "Т. Жамантаев" },
      { post: "Инженер АСУТП", fullName: "А. Тютюньков" },
    ],
  },
  defectAct: {
    title: "ДЕФЕКТНЫЙ АКТ",
    body: "Комиссия в составе инженеров КИП {name} провела обследование оборудования и выявила следующие дефекты, требующие устранения:",
    photoScale: 100,
    concordants: [
      { post: "Заместитель генерального директора", fullName: "А. Жагипаров" },
      { post: "Руководитель СЭОС", fullName: "Б. Шаймуханбетов" },
      { post: "Руководителя СЭНС", fullName: "Т. Козгумбаев" },
      { post: "Руководителя СИТиАС", fullName: "Е. Есимбеков" },
      { post: "Инженер АСУТП", fullName: "К. Есмухамбетов" },
    ],
  },
  installationAct: {
    title: "АКТ УСТАНОВКИ",
    body: "Комиссия в составе инженеров КИП {name} произвела установку и ввод в эксплуатацию следующего оборудования:",
    photoScale: 100,
    concordants: [
      { post: "Заместитель генерального директора", fullName: "А. Жагипаров" },
      { post: "Руководитель СЭОС", fullName: "Б. Шаймуханбетов" },
      { post: "Руководителя СЭНС", fullName: "Т. Козгумбаев" },
      { post: "Руководителя СИТиАС", fullName: "Е. Есимбеков" },
      { post: "Инженер АСУТП", fullName: "К. Есмухамбетов" },
    ],
  },
};

const STORAGE_KEY = "ees_act_settings_v2";

export function useConcordants() {
  const [settings, setSettings] = useState<ActSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return DEFAULT_SETTINGS;
      const parsed = JSON.parse(stored) as Partial<ActSettings>;
      return {
        workAct: { ...DEFAULT_SETTINGS.workAct, ...parsed.workAct, photoScale: parsed.workAct?.photoScale ?? 100 },
        defectAct: { ...DEFAULT_SETTINGS.defectAct, ...parsed.defectAct, photoScale: parsed.defectAct?.photoScale ?? 100 },
        installationAct: { ...DEFAULT_SETTINGS.installationAct, ...parsed.installationAct, photoScale: parsed.installationAct?.photoScale ?? 100 },
      };
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const updateConfig = (actType: keyof ActSettings, patch: Partial<ActConfig>) => {
    const updated = {
      ...settings,
      [actType]: { ...settings[actType], ...patch },
    };
    setSettings(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const reset = (actType: keyof ActSettings) => {
    updateConfig(actType, DEFAULT_SETTINGS[actType]);
  };

  return { settings, updateConfig, reset };
}
