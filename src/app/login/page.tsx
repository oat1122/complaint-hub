import { Metadata } from "next";
import LoginForm from "@/components/auth/login-form";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Login - Complaint Hub",
  description: "Login to access the dashboard",
};

export default async function LoginPage() {
  // If user is already logged in, redirect to dashboard
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-600">Complaint Hub</h1>
          <p className="mt-2 text-secondary-600">Admin Access Portal</p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
