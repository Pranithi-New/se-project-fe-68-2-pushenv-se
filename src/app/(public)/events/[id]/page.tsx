import { PublicEventDetailPage } from "@/components/shared/PublicEventDetailPage";

export default async function Page({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
	const { id } = await params;
	return <PublicEventDetailPage eventId={id} />;
}
