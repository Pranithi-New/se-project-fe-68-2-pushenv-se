import { AdminEventDetailPage } from "@/components/shared/AdminEventDetailPage";

export default async function Page({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  return <AdminEventDetailPage eventId={id} />;
}
