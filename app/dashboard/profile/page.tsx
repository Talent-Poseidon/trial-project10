import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ProfileCard } from "@/components/dashboard/profile-card";
import { prisma } from "@/lib/prisma";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) redirect("/auth/login");

  const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
  });

  if (!user) redirect("/auth/login");

  const profile = {
      id: user.id,
      email: user.email,
      full_name: user.name,
      avatar_url: user.image,
      role: user.role,
      is_approved: user.is_approved,
      created_at: new Date().toISOString(),
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your personal information
        </p>
      </div>
      <ProfileCard user={session.user} profile={profile} />
    </div>
  );
}
