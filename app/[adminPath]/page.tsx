import { notFound } from "next/navigation";
import AdminPanel from "@/components/admin/AdminPanel";

const ADMIN_PATH_SEGMENT = process.env.ADMIN_PATH_SEGMENT;

export const dynamic = "force-dynamic";

export default function PrivateAdminPage({
  params,
}: {
  params: { adminPath: string };
}) {
  if (!ADMIN_PATH_SEGMENT || params.adminPath !== ADMIN_PATH_SEGMENT) {
    notFound();
  }

  return <AdminPanel />;
}
