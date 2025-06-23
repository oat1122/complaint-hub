import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/auth-options";
import DashboardShell from "@/components/dashboard/dashboard-layout";

export const metadata: Metadata = {
  title: "Dashboard - Complaint Hub",
  description: "Admin dashboard for complaint management",
};

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  // Redirect to login if not authenticated
  if (!session) {
    redirect("/login");
  }
  return <DashboardShell>{children}</DashboardShell>;
}
