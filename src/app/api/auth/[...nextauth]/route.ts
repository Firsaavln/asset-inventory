import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// PERBAIKAN: Sesuaikan jumlah '../' (4 kali) untuk naik dari folder [...nextauth] ke folder src/lib
import { prisma } from "../../../../lib/prisma"; 
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        let user = await prisma.user.findUnique({ where: { username: credentials.username } });

        if (!user && credentials.username === "superadmin") {
          const userCount = await prisma.user.count();
          if (userCount === 0) {
            const hashedPassword = await bcrypt.hash(credentials.password, 10);
            user = await prisma.user.create({
              data: {
                username: "superadmin",
                password: hashedPassword,
                name: "System Administrator",
                role: "superadmin",
                branch: "ALL"
              }
            });
            return { id: user.id.toString(), name: user.name, username: user.username, role: user.role, branch: user.branch };
          }
        }

        if (!user) return null;
        const isPasswordMatch = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordMatch) return null;

        return { id: user.id.toString(), name: user.name, username: user.username, role: user.role, branch: user.branch };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.username = (user as any).username;
        token.branch = (user as any).branch;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).username = token.username;
        (session.user as any).branch = token.branch;
      }
      return session;
    }
  },
  pages: { signIn: '/login' },
  session: { strategy: "jwt" },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };