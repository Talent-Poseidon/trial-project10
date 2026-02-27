import React from "react"
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { prisma } from "@/lib/prisma";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  console.log("[AdminLayout] Session result:", session ? `user=${session.user?.email}, role=${session.user?.role}, is_approved=${session.user?.is_approved}` : "NULL - no session");

  if (!session?.user) {
    console.log("[AdminLayout] No session user found, redirecting to /auth/login");
    redirect("/auth/login");
  }

  const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
  });

  console.log("[AdminLayout] Check:", { 
    email: session.user.email, 
    dbRole: user?.role, 
    isApproved: user?.is_approved 
  });

  if (!user || user.role !== "admin") {
    console.log("[AdminLayout] Access denied. Redirecting to dashboard.");
    redirect("/dashboard");
  }

  // Adapter for DashboardShell
  const profile = {
      id: user.id,
      email: user.email,
      full_name: user.name,
      avatar_url: user.image,
      role: user.role,
      is_approved: user.is_approved,
  };

  return (
    <DashboardShell user={session.user} profile={profile}>
      {children}
    </DashboardShell>
  );
}
