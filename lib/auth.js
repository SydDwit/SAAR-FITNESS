import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { Admin, Staff } from "./models.js";
import bcrypt from "bcryptjs";

export const authOptions = {
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        const { email, password, role } = credentials || {};
        if (!email || !password || !role) return null;
        const Model = role === "admin" ? Admin : Staff;
        const user = await Model.findOne({ email });
        if (!user) return null;
        const ok = await bcrypt.compare(password, user.passwordHash || "");
        if (!ok) return null;
        return { id: user._id.toString(), name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = user.role;
      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role;
      return session;
    },
  },
  pages: { signIn: "/login" },
};

// v4 route handler export
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
