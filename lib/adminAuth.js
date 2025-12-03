import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { Admin } from "./models.js";
import bcrypt from "bcryptjs";

export const adminAuthOptions = {
  providers: [
    Credentials({
      name: "adminCredentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = credentials || {};
        if (!email || !password) return null;
        
        // Only check admin accounts
        const user = await Admin.findOne({ email });
        if (!user) return null;
        
        const ok = await bcrypt.compare(password, user.passwordHash || "");
        if (!ok) return null;
        
        return { 
          id: user._id.toString(), 
          name: user.name, 
          email: user.email, 
          role: "admin" 
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = "admin";
      return token;
    },
    async session({ session, token }) {
      session.user.role = "admin";
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login?error=true",
  },
  // Use a different cookie name to avoid conflicts with the main auth
  cookies: {
    sessionToken: {
      name: `admin-session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === "production",
      },
    },
    callbackUrl: {
      name: `admin-callback-url`,
      options: {
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === "production",
      },
    },
    csrfToken: {
      name: `admin-csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
};

// Create admin auth handler - will be used in a separate API route
const handler = NextAuth(adminAuthOptions);
export { handler as GET, handler as POST };
