import { Button } from "@/shared/ui/kit/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/kit/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/kit/table";

import { useEffect } from "react";
import { fetchWorkLogList } from "@/shared/model/api";
import {
  CreateWorkLogModal,
  useCreateWorkLogModal,
} from "./create-workLog-modal";
import { pdf } from "@react-pdf/renderer";
import { Report } from "./report";
import { useBoard } from "./use-board";
import { jwtDecode } from "jwt-decode";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/kit/select";
import { monthNames } from "@/shared/model/months";
import type { WorkLog } from "./board-type";
import { Dialog, DialogContent, DialogTitle } from "@/shared/ui/kit/dialog";

type TokenPayload = {
  userId: string;
  email: string;
  fullName: string; // если backend возвращает имя под таким ключом
};







export function Board() {
  const {
    setWorkLogList,
    workLogList,
    setCurrentUser,
    setSelectedMonth,
    currentUser,
    selectedMonth,
    closeImage,
    openImage,
    isOpenImage,
    imageUrl,
  } = useBoard();
  const CreateWorkLog = useCreateWorkLogModal();

  useEffect(() => {
    async function loadWorkLogs() {
      const token = localStorage.getItem("token");
      if (token) {
        const decoded = jwtDecode<TokenPayload>(token);
        setCurrentUser(decoded);
      }

      const logs = await fetchWorkLogList();
      setWorkLogList(logs);
    }
    loadWorkLogs();
  }, []);

  let filteredWL: WorkLog[];
  if (selectedMonth) {
    filteredWL = workLogList.filter(
      (workLog) =>
        new Date(workLog.createdAt).getMonth() === Number(selectedMonth)
    );
  } else {
    filteredWL = workLogList;
  }

  const handleOpenPdf = async () => {
    const blob = await pdf(
      <Report
        monthIndex={Number(selectedMonth)}
        workLogList={filteredWL}
        currentUserName={currentUser?.fullName}
      />
    ).toBlob();
    const url = URL.createObjectURL(blob);
    window.open(url); // откроется в новой вкладке
  };

  const ImageDialog = () => {

    return (
      <Dialog onOpenChange={closeImage} open={isOpenImage} >
        <DialogContent className="sm:max-w-[425px]">
          <DialogTitle>Фиксация работы</DialogTitle>
            <img src={imageUrl} className="rounded-md" alt="" loading="lazy"></img>
        </DialogContent>
      </Dialog>
          )

  }

  return (
    <main className="grow container mx-auto p-4 ">
      {/* Мобильная версия */}
      <CreateWorkLogModal />
      <ImageDialog />



      <div className="sm:hidden flex flex-col ">
        <div className="flex flex-col gap-4">
          {filteredWL.map((workLog) => {
            return (
              <Card key={workLog.id}>
                <CardHeader>
                  <CardTitle className="text-xl">{workLog.object}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-1">
                  <div className="flex gap-2">
                    <div>Дата и время:</div>
                    <div className=" font-bold">
                      {new Date(workLog.createdAt).toLocaleDateString("ru-RU")}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div>Исполнитель:</div>
                    <div className=" font-bold">{workLog.author.fullName}</div>
                  </div>
                  <div className="flex gap-2 ">
                    <div className=" ">{workLog.content}</div>
                  </div>
                  <img
                    className="mt-2"
                    src={`${workLog.photoUrl}`}
                    alt=""
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>
        <div className=" fixed bottom-0 border-t w-full bg-white left-0 px-4 py-2">
          <Button
            className="w-full text-base h-14"
            onClick={() => {
              CreateWorkLog.open();
            }}
          >
            Фиксация работы
          </Button>
        </div>
      </div>
      {/* Desctop версия */}
      <div className=" sm:block hidden">
        <div className="flex justify-between items-center pb-4 border-b">
          <div>Выполнено: {filteredWL.length}</div>
          <div className="flex gap-4">
            <Select
              onValueChange={(value) => {
                setSelectedMonth(Number(value));
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Месяц" />
              </SelectTrigger>
              <SelectContent>
                {monthNames.genitive.map((month, i) => {
                  return (
                    <SelectItem key={month} value={String(i)}>
                      {month}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <Button
              onClick={() => {
                handleOpenPdf();
              }}
            >
              Сформировать отчет
            </Button>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Дата</TableHead>
              <TableHead>Исполнитель</TableHead>
              <TableHead>Объект</TableHead>
              <TableHead>Проделанная работа</TableHead>
              <TableHead>Фото</TableHead>
              
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredWL.map((workLog) => (
              <TableRow key={workLog.id}>
                <TableCell className="font-medium">
                  {new Date(workLog.createdAt).toLocaleDateString("ru-RU")}
                </TableCell>
                <TableCell>{workLog.author.fullName}</TableCell>
                <TableCell>{workLog.object}</TableCell>
                <TableCell>{workLog.content}</TableCell>
                <TableCell onClick={()=>{openImage(workLog.photoUrl)}} className="w-20 h-20">
                  <img src={workLog.photoUrl} className=" rounded-md hover:scale-110 cursor-pointer duration-200 ease-in-out"  alt="" loading="lazy"/></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}


export const Component = Board;


