import { headers } from "next/headers";
import { Download, QrCode } from "lucide-react";
import { Sheep } from "@/components/sheep";

const downloadPath = "/api/download/android";

export async function AppDownloadCard({ variant = "card" }: { variant?: "card" | "inline" }) {
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") || headerStore.get("host");
  const protocol = headerStore.get("x-forwarded-proto") || "https";
  const downloadUrl = host ? `${protocol}://${host}${downloadPath}` : downloadPath;
  const qrSize = variant === "inline" ? 116 : 168;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&margin=10&data=${encodeURIComponent(downloadUrl)}`;

  const content = (
    <div className={variant === "inline" ? "grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center" : "grid gap-5 md:grid-cols-[1fr_auto] md:items-center"}>
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
            style={{ background: "var(--warm-soft)" }}
          >
            <Sheep size={38} mood="happy" float />
          </div>
          <div>
            <h2 className={variant === "inline" ? "text-base font-semibold tracking-normal" : "text-lg font-semibold tracking-normal"}>
              把小羊装进你的手机
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">Android 体验版，沿用同一套账号、历史和 AI 后端。</p>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <a
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 active:scale-[0.98] sm:w-fit"
            href={downloadPath}
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            下载 Android APK
          </a>
          <a
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border bg-card px-5 text-sm font-medium transition hover:bg-accent active:scale-[0.98] sm:w-fit"
            href={downloadUrl}
          >
            打开下载链接
          </a>
        </div>
      </div>

      <div className={variant === "inline" ? "hidden rounded-xl border bg-background p-2 sm:block" : "hidden rounded-xl border bg-background p-3 md:block"}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="Android App 下载二维码" className={variant === "inline" ? "h-[116px] w-[116px]" : "h-[168px] w-[168px]"} src={qrUrl} />
        <div className="mt-2 flex items-center justify-center gap-1 text-xs text-muted-foreground">
          <QrCode className="h-3.5 w-3.5" aria-hidden="true" />
          手机扫码下载
        </div>
      </div>
    </div>
  );

  if (variant === "inline") {
    return <div className="rounded-2xl border bg-background/60 p-4 sm:p-5">{content}</div>;
  }

  return (
    <section className="card-in rounded-2xl border bg-card p-5 shadow-[0_1px_2px_rgba(11,14,20,0.03),0_8px_24px_-12px_rgba(11,14,20,0.08)] sm:p-6">
      {content}
    </section>
  );
}
