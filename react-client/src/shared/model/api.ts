import axios from "axios";
import type { WorkLog } from "@/features/board/board-type";

type Login = {
  email: string;
  password: string;
};

export async function fetchLogin(data: Login) {
  try {
    const response = await axios.post("/api/login", data, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data; // { token, user, etc. }
  } catch (error: any) {
    const message = error.response?.data?.message || "Ошибка входа";
    throw new Error(message);
  }
}

type PostWorkLog = {
  object: string;
  content: string;
  photo: File;
};

export async function fetchWorkLogList(): Promise<WorkLog[]> {
  const token = localStorage.getItem("token");

  try {
    const response = await axios.get<WorkLog[]>("/api/worklogs", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Ошибка при получении списка WorkLog:",
      error.response?.data?.message
    );
    return [];
  }
}

export async function fetchCreateWorkLog(data: PostWorkLog) {
  const token = localStorage.getItem("token");
  const formData = new FormData();
  formData.append("object", data.object);
  formData.append("content", data.content);
  formData.append("photo", data.photo);

  try {
    const response = await axios.post("/api/worklogs", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Ошибка при создании записи:",
      error.response?.data?.message
    );
    return {};
  }
}