import { headers } from "next/headers";
import { Download, ExternalLink, QrCode } from "lucide-react";
import { Sheep } from "@/components/sheep";

const downloadPath = "/api/download/android";

export async function AppDownloadCard({ variant = "card" }: { variant?: "card" | "inline" }) {
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") || headerStore.get("host");
  const protocol = headerStore.get("x-forwarded-proto") || "https";
  const downloadUrl = host ? `${protocol}://${host}${downloadPath}` : downloadPath;
  const qrSize = variant === "inline" ? 132 : 168;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&margin=10&data=${encodeURIComponent(downloadUrl)}`;

  if (variant === "inline") {
    return (
      <div className="w-full min-w-0 text-center">
        <div className="mb-3 flex flex-col items-center">
          <div
            className="mb-2 flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{ background: "var(--warm-soft)" }}
          >
            <Sheep size={44} mood="happy" float />
          </div>
          <p className="text-base font-semibold tracking-normal">把小羊装进手机</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">Android 体验版，同步账号和历史记录</p>
        </div>
        <div className="hidden flex-col items-center sm:flex">
          <div className="rounded-xl border bg-background p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="Android App 下载二维码" className="h-[132px] w-[132px]" src={qrUrl} />
          </div>
          <div className="mt-3 flex items-center gap-1 text-sm text-muted-foreground">
            <QrCode className="h-3.5 w-3.5" aria-hidden="true" />
            手机扫码下载
          </div>
        </div>
        <a
          className="mt-0 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 active:scale-[0.98] sm:mt-3"
          href={downloadPath}
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          点我下载 Android APK
        </a>
      </div>
    );
  }

  const content = (
    <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
            style={{ background: "var(--warm-soft)" }}
          >
            <Sheep size={38} mood="happy" float />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-normal">把小羊装进你的手机</h2>
            <p className="mt-1 text-sm text-muted-foreground">Android 体验版，沿用同一套账号、历史和 AI 后端。</p>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <a
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 active:scale-[0.98] sm:w-fit"
            href={downloadPath}
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            点我下载 Android APK
          </a>
          <a
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border bg-card px-5 text-sm font-medium transition hover:bg-accent active:scale-[0.98] sm:w-fit"
            href={downloadUrl}
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            打开下载链接
          </a>
        </div>
      </div>

      <div className="hidden rounded-xl border bg-background p-3 md:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="Android App 下载二维码" className="h-[168px] w-[168px]" src={qrUrl} />
        <div className="mt-2 flex items-center justify-center gap-1 text-xs text-muted-foreground">
          <QrCode className="h-3.5 w-3.5" aria-hidden="true" />
          手机扫码下载
        </div>
      </div>
    </div>
  );

  return (
    <section className="card-in rounded-2xl border bg-card p-5 shadow-[0_1px_2px_rgba(11,14,20,0.03),0_8px_24px_-12px_rgba(11,14,20,0.08)] sm:p-6">
      {content}
    </section>
  );
}
