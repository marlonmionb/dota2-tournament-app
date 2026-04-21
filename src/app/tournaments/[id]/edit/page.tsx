import { getTournamentById } from "@/services/tournament-service";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { TournamentStatus } from "@prisma/client";
import EditTournamentForm from "./_components/edit-tournament-form";

export default async function EditTournamentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id }, session] = await Promise.all([params, auth()]);
  const tournament = await getTournamentById(id).catch(() => null);

  if (!tournament) notFound();
  if (tournament.organizerId !== session?.user?.id) redirect(`/tournaments/${id}`);
  if (tournament.status !== TournamentStatus.DRAFT) redirect(`/tournaments/${id}`);

  return <EditTournamentForm tournament={tournament} />;
}
