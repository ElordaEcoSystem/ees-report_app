import { createGStore } from "create-gstore";
import { useState } from "react";
import type { WorkLog } from "./board-type";

// Define a global state from a hook

type TokenPayload = {
  userId: string;
  email: string;
  fullName: string; // если backend возвращает имя под таким ключом
};

export const useBoard = createGStore(() => {
  const [workLogList, setWorkLogList] = useState<WorkLog[]>([]);
  const [currentUser, setCurrentUser] = useState<TokenPayload | undefined>();
  const [selectedMonth, setSelectedMonth] = useState<number>();

  return {
    workLogList,
    setWorkLogList,
    currentUser,
    setCurrentUser,
    selectedMonth,
    setSelectedMonth,
  };
});
