import { Button } from "@/shared/ui/kit/button";
import { useBoard } from "@/features/board/use-board";
import { Link } from "react-router";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Администратор",
  OBSERVER: "Наблюдатель",
  EXECUTOR: "Исполнитель",
};

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-red-100 text-red-700",
  OBSERVER: "bg-blue-100 text-blue-700",
  EXECUTOR: "bg-green-100 text-green-700",
};

export function AppHeader() {
  const { currentUser } = useBoard();

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="w-full min-h-[30px] border-b flex items-center sticky top-0 bg-white z-50">
      <div className="container flex mx-auto py-2 px-4 items-center gap-4">
        <div className="flex items-center font-bold text-2xl">
          EES <span className="text-green-600 font-normal">&nbsp;/СИТиАС</span>
        </div>

        <div className="ml-auto flex items-center gap-3">
          {currentUser && (
            <>
              <span className="text-sm text-gray-600 hidden sm:block">
                {currentUser.fullName}
              </span>
              <span className={`text-xs px-2 py-1 rounded-full font-medium hidden sm:inline ${ROLE_COLORS[currentUser.role] ?? "bg-gray-100 text-gray-700"}`}>
                {ROLE_LABELS[currentUser.role] ?? currentUser.role}
              </span>
              {currentUser.role === "ADMIN" && (
                <Link to="/admin" className="hidden sm:block">
                  <Button variant="outline" size="sm">Пользователи</Button>
                </Link>
              )}
            </>
          )}
          <Button onClick={handleLogout}>Выйти</Button>
        </div>
      </div>
    </div>
  );
}
