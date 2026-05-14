import { cookies } from "next/headers";
import { decrypt } from "@/lib/auth"; 
import DashboardClientLayout from "@/components/DashboardClientLayout";
import { redirect } from "next/navigation";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;
  
  if (!sessionToken) {
    redirect("/login");
  }

  const payload = await decrypt(sessionToken);
  
  // Jika gagal decrypt (manipulasi/expired)
  if (!payload) {
    redirect("/login");
  }

  const userData = {
    name: payload.name as string,
    role: payload.role as string,
    branch: payload.branch as string
  };

  return (
    <DashboardClientLayout user={userData}>
      {children}
    </DashboardClientLayout>
  );
}