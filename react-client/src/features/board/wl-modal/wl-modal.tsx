import { Dialog, DialogContent } from "@/shared/ui/kit/dialog"
import { useWLModal } from "./use-wl-modal"
// import { boolean } from "zod"


// type ImageDialogProps = {
//   closeImage: () => void;   // функция закрытия
//   isOpenWL: boolean;     // открыт/закрыт диалог
//   imageUrl: string;         // ссылка на картинку
// };

  export const WLModal = () => {
    const {isOpenWL,close,WLData} = useWLModal()
    return (
      <Dialog onOpenChange={close} open={isOpenWL}>
         <DialogContent className="sm:max-h-[min(100%-3rem,960px)] sm:max-w-[min(100%-3rem,960px)] rounded-4xl p-6">
        {/* <DialogTitle>Проделанная работа</DialogTitle> */}
        <div className="grid sm:grid-cols-2 grid-cols-1 ">
          <div className="flex flex-col p-4 gap-2 w-full">
            <div className=" text-3xl font-bold mb-2"> {WLData?.object}</div>
            <div className="border-b"><span className="font-bold ">Дата: </span>   {WLData?.createdAt ? new Date(WLData.createdAt).toLocaleDateString("ru-RU") : "—"}</div>
            <div className="border-b"><span className="font-bold ">Исполнитель: </span> {WLData?.author.fullName}</div>
            <div>{WLData?.content}</div>
          </div>
          <div className=" flex  justify-center sm:justify-end rounded-2xl overflow-hidden">
            <img src={WLData?.photoUrl} className=" rounded-2xl h-full max-h-[60vh]  object-contain" alt="" loading="lazy"></img>
          </div>
        </div>
        </DialogContent>
      </Dialog>
    )
  }