import { requireAdmin } from "@/lib/session";
import { PageHeader } from "@/components/layout/PageHeader";
import { UsersClient } from "./UsersClient";

export default async function UsersPage() {
  const currentUser = await requireAdmin();

  return (
    <div>
      <PageHeader title="Pengguna" description="Kelola akun admin dan kasir." />
      <UsersClient currentUserId={currentUser.id} />
    </div>
  );
}
