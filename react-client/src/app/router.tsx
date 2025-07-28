// import { createBrowserRouter, redirect } from "react-router";
// import App from "./App";
// import { ROUTES } from "@/shared/model/routes";

// export const router = createBrowserRouter([
//   {
//     element: (
//       // <Providers>
//       <App />
//     ),
//     children: [
//       {
//         path: ROUTES.LOGIN,
//         lazy: () => import("@/features/auth/login.page"),
//       },
//       {
//         path: ROUTES.HOME,
//         loader: () => redirect(ROUTES.BOARD),
//       },
//       {
//         path: ROUTES.BOARD,
//         lazy: () => import("@/features/board/board.page"),
//       },
//     ],
//   },
// ]);

// routes.ts
import { createBrowserRouter, redirect } from "react-router"; // ← убедись, что dom, не core
import App from "./App";
import { ROUTES } from "@/shared/model/routes";
import { AppHeader } from "@/features/header";
import { Board } from "@/features/board/board.page";

const isAuthenticated = () => {
  return localStorage.getItem("token"); // или sessionStorage
};

export const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      {
        path: ROUTES.LOGIN,
        loader: () => {
          if (isAuthenticated()) {
            return redirect(ROUTES.BOARD);
          }
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
          if (!isAuthenticated()) {
            return redirect(ROUTES.LOGIN);
          }
          return null;
        },
        element: (
          <>
            <AppHeader />
            <Board />
          </>
        ),
        // lazy: () => import("@/features/board/board.page"),
      },
    ],
  },
]);
