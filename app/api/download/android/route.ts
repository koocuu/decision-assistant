import { NextResponse } from "next/server";

export async function GET() {
  const apkUrl = process.env.ANDROID_APK_URL || process.env.NEXT_PUBLIC_ANDROID_APK_URL;

  if (!apkUrl) {
    return NextResponse.json(
      { error: "Android APK 下载地址尚未配置。" },
      { status: 404 }
    );
  }

  return NextResponse.redirect(apkUrl);
}
