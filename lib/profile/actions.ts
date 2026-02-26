"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateProfile(fullName: string) {
    const session = await auth();
    if (!session?.user?.email) throw new Error("Unauthorized");

    await prisma.user.update({
        where: { email: session.user.email },
        data: { name: fullName },
    });
    revalidatePath("/dashboard/profile");
}
