import Link from "next/link";
import { Sheep } from "@/components/sheep";

export default function OfflinePage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <section className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-[0_1px_2px_rgba(11,14,20,0.03),0_8px_24px_-12px_rgba(11,14,20,0.08)]">
        <div
          className="mx-auto flex items-center justify-center rounded-3xl"
          style={{ width: 92, height: 92, background: "var(--warm-soft)" }}
        >
          <Sheep size={72} />
        </div>
        <h1 className="mt-5 text-2xl font-semibold tracking-normal">现在离线了</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          已安装的页面还能打开；需要生成新报告或同步历史时，等网络恢复再继续。
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
        >
          回到首页
        </Link>
      </section>
    </div>
  );
}
