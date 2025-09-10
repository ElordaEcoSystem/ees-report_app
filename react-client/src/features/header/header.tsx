import { Button } from "@/shared/ui/kit/button";

export function AppHeader() {
  const handleLogout = () => {
    if (localStorage.getItem("token")) {
      localStorage.removeItem("token");
    }
    localStorage.removeItem("token");
    window.location.href = "/login"; // или использовать navigate
  };
  return (
    <div className="w-full min-h-[30px] border-b  flex items-center sticky top-0 bg-white z-50">
      <div className="container flex mx-auto py-2 px-4">
        <div className="flex items-center font-bold text-2xl">EES <span  className="text-green-600 font-normal">&nbsp; /СИТиАС</span></div>
        {/* <div className="flex items-center font-bold text-2xl">EES </div> */}
        <Button className="ml-auto" onClick={() => handleLogout()}>
          Выйти
        </Button>
      </div>
    </div>
  );
}
