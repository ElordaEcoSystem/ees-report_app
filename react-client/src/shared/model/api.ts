import type { WorkLog } from "@/features/board/board-type";
import { BASE_API_URL } from "../constans";

type Login = {
  email: string;
  password: string;
};

export async function fetchLogin(data: Login) {
  const response = await fetch(`${BASE_API_URL}/api/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Ошибка входа");
  }

  return await response.json(); // { token, user, etc. }
}

type PostWorkLog = {
  object: string;
  content: string;
  photo: File;
};

export async function fetchWorkLogList(): Promise<WorkLog[]> {
  const token = localStorage.getItem("token"); // или откуда ты его хранишь

  try {
    const response = await fetch(`${BASE_API_URL}/api/worklogs`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(response);
    if (!response.ok) {
      const error = await response.json();
      console.error("Ошибка при получении списка WorkLog:", error.message);
      throw new Error(error.message);
    }
    const result: WorkLog[] = await response.json();
    return result;
  } catch (error) {
    console.error("Ошибка запроса WorkLogs:", error);
    return [];
  }
}

export const fetchCreateWorkLog = async (data: PostWorkLog) => {
  const token = localStorage.getItem("token");
  const formData = new FormData();
  formData.append("object", data.object);
  formData.append("content", data.content);
  formData.append("photo", data.photo); // File сюда
  try {
    const response = await fetch(`${BASE_API_URL}/api/worklogs`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json();
      console.error("Ошибка при создание записи", error.message);
      throw new Error(error.message);
    }
    const result = response.json();
    return result;
  } catch (error) {
    console.error("Ошибка отправке WorkLog:", error);
    return {};
  }
};
