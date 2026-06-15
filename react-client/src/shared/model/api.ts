import axios from "axios";
import type { Department, Role, WorkLog } from "@/features/board/board-type";

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

type Login = {
  email: string;
  password: string;
};

export async function fetchLogin(data: Login) {
  const response = await axios.post("/api/login", data, {
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
}

type PostWorkLog = {
  recordType: string;
  objectType?: string;
  object: string;
  content: string;
  photos: File[];
  beforePhotos?: File[];
  executorIds?: string[];
  extraFields?: Record<string, unknown>;
};

export type WorkLogListResponse = {
  items: WorkLog[];
  total: number;
  page: number;
  limit: number;
};

export async function fetchWorkLogList(page = 1, limit = 100): Promise<WorkLogListResponse> {
  const response = await axios.get<WorkLogListResponse>("/api/worklogs", {
    headers: { ...getAuthHeaders() },
    params: { page, limit },
  });
  return response.data;
}

export async function fetchCreateWorkLog(data: PostWorkLog) {
  const formData = new FormData();
  formData.append("recordType", data.recordType);
  if (data.objectType) formData.append("objectType", data.objectType);
  formData.append("object", data.object);
  formData.append("content", data.content);
  for (const photo of data.photos) formData.append("photos", photo);
  if (data.beforePhotos) for (const photo of data.beforePhotos) formData.append("beforePhotos", photo);
  if (data.executorIds && data.executorIds.length > 0) {
    formData.append("executorIds", JSON.stringify(data.executorIds));
  }
  if (data.extraFields && Object.keys(data.extraFields).length > 0) {
    formData.append("extraFields", JSON.stringify(data.extraFields));
  }

  const response = await axios.post("/api/worklogs", formData, {
    headers: { ...getAuthHeaders() },
  });
  return response.data;
}

export type CurrentUser = {
  userId: string;
  email: string;
  fullName: string;
  role: Role;
  departmentId?: string | null;
  department?: Department | null;
};

export async function fetchCurrentUser(): Promise<CurrentUser> {
  const response = await axios.get("/api/current", {
    headers: { ...getAuthHeaders() },
  });
  const u = response.data;
  return {
    userId: u.id,
    email: u.email,
    fullName: u.fullName,
    role: u.role,
    departmentId: u.departmentId ?? null,
    department: u.department ?? null,
  };
}

export async function fetchDepartments(): Promise<Department[]> {
  const response = await axios.get<Department[]>("/api/departments", {
    headers: { ...getAuthHeaders() },
  });
  return response.data;
}

// Admin API

export type AdminUser = {
  id: string;
  email: string;
  fullName: string;
  position?: string | null;
  role: Role;
  createdAt: string;
  departmentId?: string | null;
  department?: Department | null;
};

export type ExecutorOption = {
  id: string;
  fullName: string;
  position?: string | null;
};

export async function fetchExecutors(): Promise<ExecutorOption[]> {
  const response = await axios.get<ExecutorOption[]>("/api/executors", {
    headers: { ...getAuthHeaders() },
  });
  return response.data;
}

export async function fetchUsers(): Promise<AdminUser[]> {
  const response = await axios.get<AdminUser[]>("/api/admin/users", {
    headers: { ...getAuthHeaders() },
  });
  return response.data;
}

export async function fetchUpdateUser(
  userId: string,
  data: { fullName?: string; position?: string; email?: string; newPassword?: string; departmentId?: string | null }
): Promise<AdminUser> {
  const response = await axios.patch<AdminUser>(
    `/api/admin/users/${userId}`,
    data,
    { headers: { ...getAuthHeaders() } }
  );
  return response.data;
}

export async function fetchUpdateUserRole(userId: string, role: Role): Promise<AdminUser> {
  const response = await axios.patch<AdminUser>(
    `/api/admin/users/${userId}/role`,
    { role },
    { headers: { ...getAuthHeaders() } }
  );
  return response.data;
}

export async function fetchCreateUser(data: {
  email: string;
  password: string;
  fullName: string;
  position?: string;
  role: Role;
  departmentId?: string | null;
}): Promise<AdminUser> {
  const response = await axios.post<AdminUser>("/api/admin/users", data, {
    headers: { ...getAuthHeaders() },
  });
  return response.data;
}

export async function fetchDeleteUser(userId: string, adminPassword: string): Promise<void> {
  await axios.delete(`/api/admin/users/${userId}`, {
    headers: { ...getAuthHeaders() },
    data: { adminPassword },
  });
}

export async function fetchDeleteWorkLog(id: string): Promise<void> {
  await axios.delete(`/api/worklogs/${id}`, {
    headers: { ...getAuthHeaders() },
  });
}
