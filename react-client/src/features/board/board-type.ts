export type Role = "ADMIN" | "MANAGER" | "OBSERVER" | "EXECUTOR" | "CUSTOMER";
export type RecordType = "WORK" | "DEFECT" | "INSTALLATION";

export type Department = {
  id: string;
  code: string;
  name: string;
};

export type User = {
  id: string;
  email: string;
  fullName: string;
  position?: string | null;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
  departmentId?: string | null;
  department?: Department | null;
};

export type ExecutorRef = {
  id: string;
  fullName: string;
  position?: string | null;
};

export type WorkLog = {
  id: string;
  object: string;
  objectType?: string | null;
  recordType: RecordType;
  content: string;
  photoUrls: string[];
  beforePhotoUrls: string[];
  extraFields: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  author: User;
  executors: ExecutorRef[];
  departmentId?: string | null;
  department?: Department | null;
};

export type Filters = {
  month?: number;
  year?: number;
  objectTypes?: Set<string>;
  recordTypes?: Set<string>;
  positions?: Set<string>;
};
