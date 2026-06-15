import "react-router";

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  BOARD: "/board",
  ADMIN: "/admin",
} as const;

export type PathParams = {
  [ROUTES.BOARD]: { boardId: string };
};

declare module "react-router" {
  interface Register {
    params: PathParams;
  }
}
