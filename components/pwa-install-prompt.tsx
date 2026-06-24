"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const dismissedKey = "decision-assistant:pwa-install-dismissed";

function isMobileBrowser() {
  return /Android|iPhone|iPad|iPod/i.test(window.navigator.userAgent);
}

function isIOSBrowser() {
  return /iPhone|iPad|iPod/i.test(window.navigator.userAgent);
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function PwaInstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [manualHint, setManualHint] = useState("");

  useEffect(() => {
    if (isStandalone() || localStorage.getItem(dismissedKey) === "1") {
      return;
    }

    let receivedInstallEvent = false;
    const fallbackTimer = window.setTimeout(() => {
      if (receivedInstallEvent || !isMobileBrowser()) {
        return;
      }

      setManualHint(
        isIOSBrowser()
          ? "Safari：点分享按钮，再选择“添加到主屏幕”。"
          : "点浏览器菜单，选择“添加到主屏幕”或“安装应用”。"
      );
      setVisible(true);
    }, 1600);

    function handleBeforeInstallPrompt(event: Event) {
      receivedInstallEvent = true;
      window.clearTimeout(fallbackTimer);
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
      setManualHint("");
      setVisible(true);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => {
      window.clearTimeout(fallbackTimer);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  if (!visible || (!installEvent && !manualHint)) {
    return null;
  }

  async function install() {
    if (!installEvent) {
      return;
    }
    await installEvent.prompt();
    await installEvent.userChoice.catch(() => null);
    setVisible(false);
    setInstallEvent(null);
  }

  function dismiss() {
    localStorage.setItem(dismissedKey, "1");
    setVisible(false);
  }

  function acknowledgeManualHint() {
    setVisible(false);
  }

  return (
    <div className="fixed inset-x-4 bottom-24 z-50 mx-auto max-w-md rounded-xl border bg-card p-3 shadow-[0_10px_32px_-18px_rgba(11,14,20,0.45)] md:bottom-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
          <Download className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">添加到主屏幕</p>
          <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
            {manualHint || "像 App 一样打开决策助手。"}
          </p>
        </div>
        <button
          type="button"
          className="rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
          onClick={installEvent ? install : acknowledgeManualHint}
        >
          {installEvent ? "安装" : "知道了"}
        </button>
        <button
          type="button"
          aria-label="关闭安装提示"
          className="rounded-md p-2 text-muted-foreground transition hover:bg-muted"
          onClick={dismiss}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
