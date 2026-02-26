import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AdminUserTable } from "@/components/admin/admin-user-table";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user) redirect("/auth/login");

  // Double check role from DB to be safe
  const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
  });

  if (!user || user.role !== "admin") redirect("/dashboard");

  // Fetch all users
  const users = await prisma.user.findMany({
      orderBy: { id: 'desc' }, // created_at not in schema, use id or add created_at
      include: { accounts: true }, // to check provider
  });

  // Map to format expected by table
  const formattedUsers = users.map(u => ({
      id: u.id,
      email: u.email,
      full_name: u.name,
      avatar_url: u.image,
      role: u.role,
      is_approved: u.is_approved,
      provider: u.accounts[0]?.provider || "email",
      created_at: new Date().toISOString(), // Schema doesnt have created_at yet
  }));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">User Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Approve or manage user accounts. Users who sign in with Google need approval before they can access the app.
        </p>
      </div>
      <AdminUserTable users={formattedUsers} currentUserId={user.id} />
    </div>
  );
}
