import Link from "next/link";
import { AccountForm } from "@/components/account-form";

export default function LoginPage() {
  return (
    <div className="space-y-5">
      <AccountForm mode="login" />
      <p className="text-center text-sm text-muted-foreground">
        还没有账号？{" "}
        <Link className="text-primary hover:underline" href="/register">
          去注册
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
