import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { Admin } from "./models.js";
import bcrypt from "bcryptjs";

export const authOptions = {
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = credentials || {};
        if (!email || !password) return null;
        
        try {
          // Only authenticate admin users
          const admin = await Admin.findOne({ email });
          if (admin) {
            const ok = await bcrypt.compare(password, admin.passwordHash || "");
            if (ok) {
              console.log("Admin login successful", admin.email);
              return { 
                id: admin._id.toString(), 
                name: admin.name, 
                email: admin.email, 
                role: "admin" 
              };
            }
          }
        } catch (error) {
          console.error("Login error:", error);
        }
        
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.name = user.name;
        token.email = user.email;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login?error=true",
  },
};

// v4 route handler export for staff authentication
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
