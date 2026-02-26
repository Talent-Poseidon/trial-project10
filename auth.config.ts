import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/auth/login",
    newUser: "/auth/sign-up",
  },
  trustHost: true,
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isApproved = auth?.user?.is_approved;
      
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isOnAdmin = nextUrl.pathname.startsWith("/admin");
      const isOnPending = nextUrl.pathname.startsWith("/auth/pending-approval");
      
      // If logged in but not approved
      if (isLoggedIn && !isApproved) {
        // Allow access to pending page
        if (isOnPending) return true;
        
        // Redirect all other pages to pending approval
        // This ensures strict blocking of dashboard, admin, and other pages for unapproved users
        return Response.redirect(new URL("/auth/pending-approval", nextUrl)); 
      }

      if (isOnDashboard || isOnAdmin) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        // Redirect authenticated (and approved) users to dashboard if they visit login/signup/pending
        if (nextUrl.pathname.startsWith("/auth")) {
           return Response.redirect(new URL("/dashboard", nextUrl));
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.is_approved = user.is_approved;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role as string;
        session.user.is_approved = token.is_approved as boolean;
      }
      return session;
    },
  },
  providers: [], // Configured in auth.ts
} satisfies NextAuthConfig;
