import { getTournamentByIdPublic } from "@/services/tournament-service";
import { notFound } from "next/navigation";
import RegisterTeamForm from "./_components/register-team-form";

export default async function RegisterTeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tournament = await getTournamentByIdPublic(id).catch(() => null);
  if (!tournament) notFound();

  return <RegisterTeamForm tournamentId={id} maxRankTier={tournament.maxRankTier ?? null} />;
}


