import Link from "next/link";
import { AccountForm } from "@/components/account-form";

export default function RegisterPage() {
  return (
    <div className="space-y-5">
      <AccountForm mode="register" />
      <p className="text-center text-sm text-muted-foreground">
        已有账号？{" "}
        <Link className="text-primary hover:underline" href="/login">
          去登录
        </Link>
      </p>
      <p className="text-center text-sm">
        <Link className="text-muted-foreground transition hover:text-primary" href="/">
          跳过，匿名继续
        </Link>
      </p>
    </div>
  );
}
