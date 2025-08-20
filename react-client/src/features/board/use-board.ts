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
  const [isOpenImage, setIsOpenImage] = useState(false);
  const [imageUrl,setImageUrl] = useState<string>("")

  const openImage = (url:string) => {
    return (
      setIsOpenImage(true),
      setImageUrl(url)
    )
  };
  const closeImage = () => setIsOpenImage(false);







  return {
    workLogList,
    setWorkLogList,
    currentUser,
    setCurrentUser,
    selectedMonth,
    setSelectedMonth,
    isOpenImage,
    openImage,
    closeImage,
    imageUrl,
    setImageUrl
  };
});
