import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Password",
      credentials: {
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const appPassword = process.env.APP_PASSWORD;

        if (credentials?.password === appPassword) {
          return {
            id: "user",
            name: "Authorized User",
            email: "user@ghosttagger.app",
          };
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.SECRET || "fallback-secret-change-in-production",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
