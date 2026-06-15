import { createGStore } from "create-gstore";
import React, { useState } from "react";
import type { WorkLog } from "@/features/board/board-type";

export const useWLModal = createGStore(() => {
  const [isOpenWL, setIsOpenWL] = useState(false);
  const [WLData, setWLData] = React.useState<WorkLog | null>(null);

  const open = (data: WorkLog) => {
    setIsOpenWL(true);
    setWLData(data);
  };

  const close = () => setIsOpenWL(false);

  return { isOpenWL, open, close, WLData };
});
