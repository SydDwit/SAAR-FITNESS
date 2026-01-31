import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { Member } from "./models.js";
import bcrypt from "bcryptjs";

export const memberAuthOptions = {
  session: { 
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
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
          // Only authenticate member users from Member collection
          const member = await Member.findOne({ email, isActive: true });
          if (member && member.passwordHash) {
            const ok = await bcrypt.compare(password, member.passwordHash);
            if (ok) {
              console.log("Member login successful", member.email);
              return { 
                id: member._id.toString(), 
                name: member.name, 
                email: member.email, 
                role: "member"
              };
            } else {
              console.log("Member login failed - invalid password", email);
            }
          } else {
            console.log("Member login failed - member not found or inactive", email);
          }
        } catch (error) {
          console.error("Member login error:", error);
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
    signIn: "/login",
    error: "/login?error=true",
  },
  cookies: {
    sessionToken: {
      name: "next-auth.member-session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
      },
    },
  },
  debug: process.env.NODE_ENV === "development",
};

// v4 route handler export for member authentication
const handler = NextAuth(memberAuthOptions);
export { handler as GET, handler as POST };
