export type User = {
  id: string;
  email: string;
  fullName: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  workLogs: WorkLog[];
};

export type WorkLog = {
  id: string;
  object: string;
  objectType: string;
  content: string;
  photoUrl: string;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  author: User;
};

export type Filters = {
  month?: number;        // месяц (0–11)
  objectType?: string;   // "НС", "ОС"
  authorId?: string;     // например, фильтр по автору
  // можно добавлять дальше...
};
