import { Dialog, DialogContent } from "@/shared/ui/kit/dialog";
import { useWLModal } from "./use-wl-modal";
import { useState, useEffect, useRef, type TouchEvent } from "react";

const SWIPE_THRESHOLD = 40;

function Carousel({ urls }: { urls: string[] }) {
  const [idx, setIdx] = useState(0);
  const touchStartX = useRef<number | null>(null);

  if (urls.length === 0) return null;

  const goPrev = () => setIdx((i) => Math.max(0, i - 1));
  const goNext = () => setIdx((i) => Math.min(urls.length - 1, i + 1));

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (delta > SWIPE_THRESHOLD) goPrev();
    else if (delta < -SWIPE_THRESHOLD) goNext();
    touchStartX.current = null;
  };

  return (
    <div className="flex flex-col gap-2">
      <img
        src={urls[idx]}
        className="rounded-2xl w-full object-contain max-h-[55vh] select-none touch-pan-y"
        alt=""
        loading="lazy"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      />
      {urls.length > 1 && (
        <div className="flex items-center justify-center gap-3 text-sm">
          <button
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-30 flex items-center justify-center text-lg"
            onClick={goPrev}
            disabled={idx === 0}
          >
            ‹
          </button>
          <span className="text-gray-500">{idx + 1} / {urls.length}</span>
          <button
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-30 flex items-center justify-center text-lg"
            onClick={goNext}
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
  const [tab, setTab] = useState<"before" | "after">("before");

  useEffect(() => { setTab("before"); }, [WLData?.id]);

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
                  className={`px-4 py-1.5 text-sm rounded-md transition-colors ${tab === "before" ? "bg-gray-800 text-white" : "hover:bg-gray-100"}`}
                  onClick={() => setTab("before")}
                >
                  До
                </button>
                <button
                  className={`px-4 py-1.5 text-sm rounded-md transition-colors ${tab === "after" ? "bg-gray-800 text-white" : "hover:bg-gray-100"}`}
                  onClick={() => setTab("after")}
                >
                  После
                </button>
              </div>
            )}
            {hasBefore ? (
              tab === "after"
                ? <Carousel key="after" urls={WLData?.photoUrls ?? []} />
                : <Carousel key="before" urls={WLData?.beforePhotoUrls ?? []} />
            ) : (
              <Carousel key="single" urls={WLData?.photoUrls ?? []} />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
