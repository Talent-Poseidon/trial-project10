import React from "react"
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { prisma } from "@/lib/prisma";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  // Fetch fresh profile data
  const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
  });

  if (!user) {
      redirect("/auth/login");
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
