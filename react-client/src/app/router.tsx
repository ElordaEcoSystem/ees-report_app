import { createBrowserRouter, redirect } from "react-router";
import App from "./App";
import { ROUTES } from "@/shared/model/routes";
import { AppHeader } from "@/features/header";
import { Board } from "@/features/board/board.page";
import { AdminPage } from "@/features/admin/admin.page";
import { fetchCurrentUser } from "@/shared/model/api";

const getToken = () => localStorage.getItem("token");

export const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      {
        path: ROUTES.LOGIN,
        loader: () => {
          if (getToken()) return redirect(ROUTES.BOARD);
          return null;
        },
        lazy: () => import("@/features/auth/login.page"),
      },
      {
        path: ROUTES.HOME,
        loader: () => redirect(ROUTES.BOARD),
      },
      {
        path: ROUTES.BOARD,
        loader: () => {
          if (!getToken()) return redirect(ROUTES.LOGIN);
          return null;
        },
        element: (
          <>
            <AppHeader />
            <Board />
          </>
        ),
      },
      {
        path: ROUTES.ADMIN,
        loader: async () => {
          if (!getToken()) return redirect(ROUTES.LOGIN);
          try {
            const user = await fetchCurrentUser();
            if (user.role !== "ADMIN") return redirect(ROUTES.BOARD);
          } catch {
            // Token invalid or expired — force re-auth
            localStorage.removeItem("token");
            return redirect(ROUTES.LOGIN);
          }
          return null;
        },
        element: (
          <>
            <AppHeader />
            <AdminPage />
          </>
        ),
      },
    ],
  },
]);
