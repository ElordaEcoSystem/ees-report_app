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
  content: string;
  photoUrl: string;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  author: User;
};
