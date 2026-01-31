import NextAuth from "next-auth";
import { memberAuthOptions } from "@/lib/memberAuth";

const handler = NextAuth(memberAuthOptions);

export { handler as GET, handler as POST };
