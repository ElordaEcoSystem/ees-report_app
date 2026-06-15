import { createGStore } from "create-gstore";
import { useState } from "react";
import type { WorkLog } from "./board-type";
import type { CurrentUser } from "@/shared/model/api";

function toggleInSet<T>(prev: Set<T>, value: T): Set<T> {
  const next = new Set(prev);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

export const useBoard = createGStore(() => {
  const [workLogList, setWorkLogList] = useState<WorkLog[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | undefined>();
  const [selectedMonth, setSelectedMonth] = useState<number>();
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedObjectTypes, setSelectedObjectTypes] = useState<Set<string>>(new Set());
  const [selectedRecordTypes, setSelectedRecordTypes] = useState<Set<string>>(new Set());
  const [selectedPositions, setSelectedPositions] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelected = (id: string) => setSelectedIds((prev) => toggleInSet(prev, id));
  const clearSelected = () => setSelectedIds(new Set());

  const selectAll = (ids: string[]) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      return next;
    });
  };

  const deselectAll = (ids: string[]) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });
  };

  const toggleObjectType = (type: string) => setSelectedObjectTypes((prev) => toggleInSet(prev, type));
  const clearObjectTypes = () => setSelectedObjectTypes(new Set());

  const toggleRecordType = (type: string) => setSelectedRecordTypes((prev) => toggleInSet(prev, type));
  const clearRecordTypes = () => setSelectedRecordTypes(new Set());

  const togglePosition = (pos: string) => setSelectedPositions((prev) => toggleInSet(prev, pos));
  const clearPositions = () => setSelectedPositions(new Set());

  return {
    workLogList,
    setWorkLogList,
    currentUser,
    setCurrentUser,
    selectedMonth,
    setSelectedMonth,
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
  };
});
