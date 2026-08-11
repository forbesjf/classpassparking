import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import AuthShell from "@/components/AuthShell";
import AuthForm from "@/components/AuthForm";

export const metadata = { title: "Join SpotPass" };

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join free and get 40 credits to start parking."
    >
      <AuthForm mode="register" />
    </AuthShell>
  );
}
