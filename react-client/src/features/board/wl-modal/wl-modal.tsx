import { Dialog, DialogContent } from "@/shared/ui/kit/dialog";
import { useWLModal } from "./use-wl-modal";
import { useState, useEffect } from "react";

function Carousel({ urls }: { urls: string[] }) {
  const [idx, setIdx] = useState(0);
  if (urls.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      <img
        src={urls[idx]}
        className="rounded-2xl w-full object-contain max-h-[55vh]"
        alt=""
        loading="lazy"
      />
      {urls.length > 1 && (
        <div className="flex items-center justify-center gap-3 text-sm">
          <button
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-30 flex items-center justify-center text-lg"
            onClick={() => setIdx((i) => Math.max(0, i - 1))}
            disabled={idx === 0}
          >
            ‹
          </button>
          <span className="text-gray-500">{idx + 1} / {urls.length}</span>
          <button
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-30 flex items-center justify-center text-lg"
            onClick={() => setIdx((i) => Math.min(urls.length - 1, i + 1))}
            disabled={idx === urls.length - 1}
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}

export const WLModal = () => {
  const { isOpenWL, close, WLData } = useWLModal();
  const [tab, setTab] = useState<"after" | "before">("after");

  useEffect(() => { setTab("after"); }, [WLData?.id]);

  const hasBefore = (WLData?.beforePhotoUrls?.length ?? 0) > 0;

  return (
    <Dialog onOpenChange={close} open={isOpenWL}>
      <DialogContent className="sm:max-h-[min(100%-3rem,960px)] sm:max-w-[min(100%-3rem,960px)] rounded-4xl p-6">
        <div className="grid sm:grid-cols-2 grid-cols-1">
          <div className="flex flex-col p-4 gap-2 w-full">
            <div className="text-3xl font-bold mb-2">{WLData?.object}</div>
            <div className="border-b pb-1">
              <span className="font-bold">Дата: </span>
              {WLData?.createdAt ? new Date(WLData.createdAt).toLocaleDateString("ru-RU") : "—"}
            </div>
            <div className="border-b pb-1">
              <span className="font-bold">Исполнители: </span>
              <div className="flex flex-col gap-1 mt-1">
                {WLData && [WLData.author, ...(WLData.executors?.filter(e => e.id !== WLData.author.id) ?? [])].map((ex, i) => (
                  <div key={i} className="leading-tight">
                    {ex.position && <span className="text-gray-400 text-xs">{ex.position} </span>}
                    <span>{ex.fullName}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>{WLData?.content}</div>
          </div>

          <div className="flex flex-col gap-3">
            {hasBefore && (
              <div className="flex gap-1 border rounded-lg p-1 w-fit">
                <button
                  className={`px-4 py-1.5 text-sm rounded-md transition-colors ${tab === "after" ? "bg-gray-800 text-white" : "hover:bg-gray-100"}`}
                  onClick={() => setTab("after")}
                >
                  После
                </button>
                <button
                  className={`px-4 py-1.5 text-sm rounded-md transition-colors ${tab === "before" ? "bg-gray-800 text-white" : "hover:bg-gray-100"}`}
                  onClick={() => setTab("before")}
                >
                  До
                </button>
              </div>
            )}
            {hasBefore ? (
              tab === "after"
                ? <Carousel urls={WLData?.photoUrls ?? []} />
                : <Carousel urls={WLData?.beforePhotoUrls ?? []} />
            ) : (
              <Carousel urls={WLData?.photoUrls ?? []} />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
