import { Button } from "@/shared/ui/kit/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/kit/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/kit/table";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { fetchWorkLogList, fetchCurrentUser, fetchDeleteWorkLog } from "@/shared/model/api";
import {
  CreateWorkLogModal,
  useCreateWorkLogModal,
} from "./create-workLog-modal";
import { pdf } from "@react-pdf/renderer";
import { Report } from "./report";
import { DefectAct } from "./report/defect-act";
import { InstallationAct } from "./report/installation-act";
import { useBoard } from "./use-board";
import { useConcordants } from "./concordants/use-concordants";
import { ConcordantsEditor } from "./concordants/concordants-editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/kit/select";
import type { WorkLog, Filters } from "./board-type";
import { useWLModal, WLModal } from "./wl-modal";
import { getDepartmentConfig, getFieldValue } from "@/features/departments/registry";

function applyFilters(workLogs: WorkLog[], filters: Filters): WorkLog[] {
  return workLogs.filter((workLog) => {
    const created = new Date(workLog.createdAt);
    if (filters.year !== undefined) {
      if (created.getFullYear() !== filters.year) return false;
    }
    if (filters.month !== undefined && filters.month !== 12 && !Number.isNaN(filters.month)) {
      if (created.getMonth() !== filters.month) return false;
    }
    if (filters.objectTypes && filters.objectTypes.size > 0) {
      if (!filters.objectTypes.has(workLog.objectType ?? "")) return false;
    }
    if (filters.recordTypes && filters.recordTypes.size > 0) {
      if (!filters.recordTypes.has(workLog.recordType)) return false;
    }
    if (filters.positions && filters.positions.size > 0) {
      const people = [workLog.author, ...(workLog.executors ?? [])];
      const hasMatch = people.some((p) => p.position && filters.positions!.has(p.position));
      if (!hasMatch) return false;
    }
    return true;
  });
}

const recordTypeOptions = [
  { value: "WORK", label: "Работа" },
  { value: "DEFECT", label: "Дефект" },
  { value: "INSTALLATION", label: "Установка" },
];

const monthSelectItems = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь", "Все",
];

const recordTypeLabels: Record<string, string> = {
  WORK: "Работа",
  DEFECT: "Дефект",
  INSTALLATION: "Установка",
};

const recordTypeBadge: Record<string, string> = {
  WORK: "bg-green-100 text-green-800",
  DEFECT: "bg-red-100 text-red-800",
  INSTALLATION: "bg-blue-100 text-blue-800",
};

const SWIPE_THRESHOLD = 40;

function MobilePhotoSwiper({ photoUrls, beforePhotoUrls = [] }: { photoUrls: string[]; beforePhotoUrls?: string[] }) {
  const hasBefore = beforePhotoUrls.length > 0;
  const [tab, setTab] = useState<"before" | "after">("before");
  const urls = hasBefore ? (tab === "before" ? beforePhotoUrls : photoUrls) : photoUrls;

  const [idx, setIdx] = useState(0);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => { setIdx(0); }, [tab]);

  if (urls.length === 0) return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (delta > SWIPE_THRESHOLD) setIdx((i) => Math.max(0, i - 1));
    else if (delta < -SWIPE_THRESHOLD) setIdx((i) => Math.min(urls.length - 1, i + 1));
    touchStartX.current = null;
  };

  return (
    <div className="mt-2">
      {hasBefore && (
        <div className="flex gap-1 mb-1">
          <button
            type="button"
            className={`px-3 py-1 text-xs rounded-md border ${tab === "before" ? "bg-gray-800 text-white" : "bg-gray-100 text-black"}`}
            onClick={() => setTab("before")}
          >
            До
          </button>
          <button
            type="button"
            className={`px-3 py-1 text-xs rounded-md border ${tab === "after" ? "bg-gray-800 text-white" : "bg-gray-100 text-black"}`}
            onClick={() => setTab("after")}
          >
            После
          </button>
        </div>
      )}
      <div className="relative">
        <img
          className="w-full select-none touch-pan-y"
          src={urls[idx]}
          alt=""
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        />
        {urls.length > 1 && (
          <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
            {idx + 1} / {urls.length}
          </span>
        )}
      </div>
    </div>
  );
}

type MultiSelectFilterProps = {
  label: string;
  options: { value: string; label: string }[];
  selected: Set<string>;
  onToggle: (value: string) => void;
  onClear: () => void;
};

function MultiSelectFilter({ label, options, selected, onToggle, onClear }: MultiSelectFilterProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayLabel =
    selected.size === 0
      ? label
      : options.filter((o) => selected.has(o.value)).map((o) => o.label).join(", ");

  return (
    <div className="relative" ref={ref}>
      <button
        className="border rounded-md px-3 h-9 text-sm flex items-center gap-1 bg-white hover:bg-gray-50 min-w-[120px] max-w-[180px]"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="truncate flex-1 text-left">{displayLabel}</span>
        <span className="text-gray-400 shrink-0">▾</span>
      </button>
      {open && (
        <div className="absolute top-full mt-1 bg-white border rounded-md shadow-lg z-20 min-w-[150px]">
          <button
            className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-500"
            onClick={() => { onClear(); setOpen(false); }}
          >
            Все
          </button>
          {options.map((o) => (
            <label
              key={o.value}
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-sm cursor-pointer"
            >
              <input
                type="checkbox"
                className="w-4 h-4 cursor-pointer"
                checked={selected.has(o.value)}
                onChange={() => onToggle(o.value)}
                onClick={(e) => e.stopPropagation()}
              />
              {o.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

export function Board() {
  const {
    setWorkLogList,
    workLogList,
    setCurrentUser,
    setSelectedMonth,
    currentUser,
    selectedMonth,
    selectedYear,
    setSelectedYear,
    selectedObjectTypes,
    toggleObjectType,
    clearObjectTypes,
    selectedRecordTypes,
    toggleRecordType,
    clearRecordTypes,
    selectedPositions,
    togglePosition,
    clearPositions,
    selectedIds,
    toggleSelected,
    clearSelected,
    selectAll,
    deselectAll,
  } = useBoard();

  const [actMenuOpen, setActMenuOpen] = useState(false);
  const actMenuRef = useRef<HTMLDivElement>(null);
  const CreateWorkLog = useCreateWorkLogModal();
  const WorkLogModal = useWLModal();
  const { settings: actSettings, updateConfig: updateActConfig, reset: resetActConfig } = useConcordants();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (actMenuRef.current && !actMenuRef.current.contains(e.target as Node)) {
        setActMenuOpen(false);
      }

    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    async function loadWorkLogs() {
      try {
        const [user, data] = await Promise.all([fetchCurrentUser(), fetchWorkLogList()]);
        setCurrentUser(user);
        setWorkLogList(data.items);
      } catch {
        setWorkLogList([]);
      }
    }
    loadWorkLogs();
  }, []);

  const availableYears = useMemo(() =>
    Array.from(
      new Set([
        new Date().getFullYear(),
        ...workLogList.map((wl) => new Date(wl.createdAt).getFullYear()),
      ])
    ).sort((a, b) => b - a),
    [workLogList]
  );

  const availablePositions = useMemo(() =>
    Array.from(
      new Set(
        workLogList.flatMap((wl) =>
          [wl.author, ...(wl.executors ?? [])].map((p) => p.position).filter(Boolean) as string[]
        )
      )
    ).sort(),
    [workLogList]
  );

  const filters: Filters = {
    month: selectedMonth,
    year: selectedYear,
    objectTypes: selectedObjectTypes,
    recordTypes: selectedRecordTypes,
    positions: selectedPositions,
  };

  const filteredWL = applyFilters(workLogList, filters);
  const selectedWorkLogs = filteredWL.filter((wl) => selectedIds.has(wl.id));

  const isAdmin = currentUser?.role === "ADMIN";
  const deptConfig = getDepartmentConfig(currentUser?.department?.code ?? null);

  const handleDeleteWorkLog = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Удалить эту запись и все её фото?")) return;
    try {
      await fetchDeleteWorkLog(id);
      setWorkLogList(workLogList.filter((wl) => wl.id !== id));
    } catch {
      alert("Ошибка при удалении");
    }
  };

  const canCreateRecords =
    currentUser?.role === "ADMIN" ||
    currentUser?.role === "EXECUTOR" ||
    currentUser?.role === "MANAGER";
  const canGenerateReports =
    currentUser?.role === "ADMIN" ||
    currentUser?.role === "MANAGER";
  const isManager = currentUser?.role === "MANAGER" || currentUser?.role === "ADMIN";

  const filteredIds = filteredWL.map((wl) => wl.id);
  const allVisibleSelected =
    filteredIds.length > 0 && filteredIds.every((id) => selectedIds.has(id));
  const someVisibleSelected =
    filteredIds.some((id) => selectedIds.has(id)) && !allVisibleSelected;

  function handleSelectAllToggle() {
    if (allVisibleSelected) {
      deselectAll(filteredIds);
    } else {
      selectAll(filteredIds);
    }
  }

  const effectiveMonth =
    selectedMonth === undefined || selectedMonth === 12
      ? new Date().getMonth()
      : selectedMonth;

  async function loadOrientations(wls: WorkLog[]): Promise<Record<string, boolean>> {
    const urls = [...new Set(wls.flatMap(wl => [...(wl.beforePhotoUrls ?? []), ...(wl.photoUrls ?? [])]))];
    const entries = await Promise.allSettled(
      urls.map(url => new Promise<[string, boolean]>((resolve) => {
        const img = new window.Image();
        img.onload = () => resolve([url, img.naturalHeight > img.naturalWidth]);
        img.onerror = () => resolve([url, false]);
        img.src = url;
      }))
    );
    return Object.fromEntries(entries.flatMap(r => r.status === "fulfilled" ? [r.value] : []));
  }

  function openBlobUrl(blob: Blob) {
    const url = URL.createObjectURL(blob);
    window.open(url);
    // Revoke after 5 minutes — enough time for the PDF to fully load in the new tab
    setTimeout(() => URL.revokeObjectURL(url), 5 * 60 * 1000);
  }

  async function generateAndOpenAct(
    items: WorkLog[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    buildComponent: (orientations: Record<string, boolean>) => React.ReactElement<any>
  ) {
    const orientations = await loadOrientations(items);
    const blob = await pdf(buildComponent(orientations)).toBlob();
    openBlobUrl(blob);
    setActMenuOpen(false);
    clearSelected();
  }

  const handleOpenWorkAct = () => {
    const items = selectedIds.size > 0 ? selectedWorkLogs : filteredWL;
    const cfg = actSettings.workAct;
    generateAndOpenAct(items, (orientations) => (
      <Report
        monthIndex={effectiveMonth}
        year={selectedYear ?? new Date().getFullYear()}
        workLogList={items}
        currentUserName={currentUser?.fullName}
        concordants={cfg.concordants}
        title={cfg.title}
        body={cfg.body}
        orientations={orientations}
        departmentConfig={deptConfig}
        photoScale={cfg.photoScale}
      />
    ));
  };

  const handleOpenDefectAct = () => {
    const items = selectedIds.size > 0 ? selectedWorkLogs : filteredWL.filter(w => w.recordType === "DEFECT");
    const cfg = actSettings.defectAct;
    generateAndOpenAct(items, (orientations) => (
      <DefectAct workLogList={items} currentUserName={currentUser?.fullName} concordants={cfg.concordants} title={cfg.title} body={cfg.body} orientations={orientations} departmentConfig={deptConfig} photoScale={cfg.photoScale} />
    ));
  };

  const handleOpenInstallationAct = () => {
    const items = selectedIds.size > 0 ? selectedWorkLogs : filteredWL.filter(w => w.recordType === "INSTALLATION");
    const cfg = actSettings.installationAct;
    generateAndOpenAct(items, (orientations) => (
      <InstallationAct workLogList={items} currentUserName={currentUser?.fullName} concordants={cfg.concordants} title={cfg.title} body={cfg.body} orientations={orientations} departmentConfig={deptConfig} photoScale={cfg.photoScale} />
    ));
  };

  return (
    <main className="grow container mx-auto p-4 overflow-x-hidden">
      <CreateWorkLogModal />
      <WLModal />

      {/* Мобильная версия */}
      <div className="sm:hidden flex flex-col">
        <div className="flex flex-col gap-4">
          {filteredWL.map((workLog) => (
            <Card key={workLog.id} className="overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl break-words">{workLog.object}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-1">
                <div className="flex gap-2">
                  <div className="shrink-0">Дата:</div>
                  <div className="font-bold">
                    {new Date(workLog.createdAt).toLocaleDateString("ru-RU")}
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="shrink-0">Тип:</div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${recordTypeBadge[workLog.recordType] ?? "bg-gray-100 text-gray-800"}`}>
                    {recordTypeLabels[workLog.recordType] ?? workLog.recordType}
                  </span>
                </div>
                <div className="flex gap-2">
                  <div className="shrink-0">Исполнитель:</div>
                  <div className="font-bold break-words min-w-0">{workLog.author.fullName}</div>
                </div>
                <div className="flex gap-2">
                  <div className="shrink-0 text-gray-500">Вид работ:</div>
                  <div className="text-sm break-words min-w-0">
                    {(workLog.extraFields?.workType as string | undefined) || "—"}
                  </div>
                </div>
                <div className="break-words">{workLog.content}</div>
                <MobilePhotoSwiper photoUrls={workLog.photoUrls} beforePhotoUrls={workLog.beforePhotoUrls} />
              </CardContent>
            </Card>
          ))}
        </div>
        {canCreateRecords && (
          <div className="fixed bottom-0 border-t w-full bg-white left-0 px-4 py-2">
            <Button className="w-full text-base h-14" onClick={() => CreateWorkLog.open()}>
              + Фиксация
            </Button>
          </div>
        )}
      </div>

      {/* Desktop версия */}
      <div className="sm:block hidden">
        <div className="flex justify-between items-center pb-4 border-b gap-2 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm text-gray-500">Записей: {filteredWL.length}</span>
            {canCreateRecords && (
              <Button onClick={() => CreateWorkLog.open()}>
                + Фиксация
              </Button>
            )}
            {selectedIds.size > 0 && (
              <button className="text-sm text-gray-400 hover:text-gray-600" onClick={clearSelected}>
                Снять выделение ({selectedIds.size})
              </button>
            )}
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <Select
              value={String(selectedYear)}
              onValueChange={(value) => setSelectedYear(Number(value))}
            >
              <SelectTrigger className="w-[110px]">
                <SelectValue placeholder="Год" />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map((year) => (
                  <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={selectedMonth !== undefined ? String(selectedMonth) : "12"}
              onValueChange={(value) => setSelectedMonth(Number(value))}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Месяц" />
              </SelectTrigger>
              <SelectContent>
                {monthSelectItems.map((month, i) => (
                  <SelectItem key={month} value={String(i)}>{month}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(() => {
              const selectField = deptConfig.fields.find(f => f.type === "select" && f.storageKey === "objectType");
              if (!selectField?.options) return null;
              return (
                <MultiSelectFilter
                  label={selectField.label}
                  options={selectField.options.map((v) => ({ value: v, label: v }))}
                  selected={selectedObjectTypes}
                  onToggle={toggleObjectType}
                  onClear={clearObjectTypes}
                />
              );
            })()}
            <MultiSelectFilter
              label="Тип записи"
              options={recordTypeOptions}
              selected={selectedRecordTypes}
              onToggle={toggleRecordType}
              onClear={clearRecordTypes}
            />
            <MultiSelectFilter
              label="Должность"
              options={availablePositions.map((p) => ({ value: p, label: p }))}
              selected={selectedPositions}
              onToggle={togglePosition}
              onClear={clearPositions}
            />
            {isManager && (
              <ConcordantsEditor
                settings={actSettings}
                onUpdate={updateActConfig}
                onReset={resetActConfig}
              />
            )}
            {canGenerateReports && (
              <div className="relative" ref={actMenuRef}>
                <Button variant="outline" onClick={() => setActMenuOpen((v) => !v)}>
                  Сформировать акт ▾
                </Button>
                {actMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 bg-white border rounded-md shadow-lg z-10 min-w-[220px]">
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                      onClick={handleOpenWorkAct}
                    >
                      Акт выполненных работ
                    </button>
                    {isManager && (
                      <>
                        <button
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                          onClick={handleOpenDefectAct}
                        >
                          Дефектный акт
                        </button>
                        <button
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                          onClick={handleOpenInstallationAct}
                        >
                          Акт установки
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <Table className="table-fixed w-full">
          <TableHeader>
            <TableRow>
              {isManager && (
                <TableHead className="w-10">
                  <input
                    type="checkbox"
                    className="w-4 h-4 cursor-pointer"
                    checked={allVisibleSelected}
                    ref={(el) => { if (el) el.indeterminate = someVisibleSelected; }}
                    onChange={handleSelectAllToggle}
                  />
                </TableHead>
              )}
              <TableHead className="w-24">Дата</TableHead>
              <TableHead className="w-28">Тип</TableHead>
              <TableHead className="w-40">Исполнители</TableHead>
              {deptConfig.fields.filter(f => f.showInList).map(f => (
                <TableHead key={f.key} className="w-32">{f.label}</TableHead>
              ))}
              <TableHead className="w-44">Вид работ</TableHead>
              <TableHead>Описание</TableHead>
              <TableHead className="w-24">Фото</TableHead>
              {isAdmin && <TableHead className="w-16"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredWL.map((workLog) => (
              <TableRow
                key={workLog.id}
                className={`cursor-pointer ${selectedIds.has(workLog.id) ? "bg-blue-50 hover:bg-blue-100" : ""}`}
                onClick={() => {
                  if (isManager) {
                    toggleSelected(workLog.id);
                  } else {
                    WorkLogModal.open(workLog);
                  }
                }}
              >
                {isManager && (
                  <TableCell>
                    <input
                      type="checkbox"
                      className="w-4 h-4 cursor-pointer"
                      checked={selectedIds.has(workLog.id)}
                      onChange={() => toggleSelected(workLog.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TableCell>
                )}
                <TableCell className="font-medium text-sm">
                  {new Date(workLog.createdAt).toLocaleDateString("ru-RU")}
                </TableCell>
                <TableCell>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${recordTypeBadge[workLog.recordType] ?? "bg-gray-100 text-gray-800"}`}>
                    {recordTypeLabels[workLog.recordType] ?? workLog.recordType}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1.5">
                    {[workLog.author, ...(workLog.executors?.filter(e => e.id !== workLog.author.id) ?? [])].map((ex, i) => (
                      <div key={i} className={`leading-tight ${i > 0 ? "border-t pt-1.5" : ""}`}>
                        {ex.position && <div className="text-gray-400 text-xs">{ex.position}</div>}
                        <div className="text-sm">{ex.fullName}</div>
                      </div>
                    ))}
                  </div>
                </TableCell>
                {deptConfig.fields.filter(f => f.showInList).map(f => (
                  <TableCell key={f.key} className="text-sm">
                    {getFieldValue(f, workLog) || "—"}
                  </TableCell>
                ))}
                <TableCell className="text-sm text-gray-600">
                  {(workLog.extraFields?.workType as string | undefined) || "—"}
                </TableCell>
                <TableCell className="text-sm break-words whitespace-pre-wrap">{workLog.content}</TableCell>
                <TableCell>
                  <div className="relative w-20 h-20">
                    {workLog.photoUrls.length > 0 && (
                    <img
                      src={workLog.photoUrls[workLog.photoUrls.length - 1]}
                      className="w-20 h-20 object-cover rounded-md"
                      alt=""
                      loading="lazy"
                      onClick={(e) => { e.stopPropagation(); WorkLogModal.open(workLog); }}
                      style={{ cursor: "pointer" }}
                    />
                    )}
                    {workLog.beforePhotoUrls.length > 0 && (
                      <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1 rounded leading-tight">
                        до/после
                      </span>
                    )}
                    {workLog.photoUrls.length > 1 && (
                      <span className="absolute top-1 right-1 bg-black/60 text-white text-[9px] px-1 rounded leading-tight">
                        {workLog.photoUrls.length}
                      </span>
                    )}
                  </div>
                </TableCell>
                {isAdmin && (
                  <TableCell>
                    <button
                      className="text-red-400 hover:text-red-600 text-xs px-2 py-1 rounded hover:bg-red-50"
                      onClick={(e) => handleDeleteWorkLog(workLog.id, e)}
                    >
                      ✕
                    </button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}

export const Component = Board;
