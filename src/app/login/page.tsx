import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import AuthShell from "@/components/AuthShell";
import AuthForm from "@/components/AuthForm";

export const metadata = { title: "Log in · SpotPass" };

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <AuthShell title="Welcome back" subtitle="Log in to book your next spot.">
      <AuthForm mode="login" />
    </AuthShell>
  );
}
