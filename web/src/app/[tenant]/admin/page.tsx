import { redirect } from "next/navigation";

export default function AdminPage({ params }: { params: { tenant: string } }) {
  redirect(`/${params.tenant}/admin/home`);
}
