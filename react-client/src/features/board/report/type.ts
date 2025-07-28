export type WorkOrderResponse = {
  id: string;
  object: string;
  photoUrl: string | null;
  content: string | null;
  createdAt: Date;
  author: {
    fullName: string;
  };
  createdById: string;
};
