import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTournamentByIdPublic } from "@/services/tournament-service";
import { notFound } from "next/navigation";
import RegisterTeamForm from "./_components/register-team-form";

export default async function RegisterTeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [session, tournament] = await Promise.all([auth(), getTournamentByIdPublic(id).catch(() => null)]);
  if (!session) redirect(`/auth/signin?callbackUrl=/tournaments/${id}/register`);
  if (!tournament) notFound();

  return <RegisterTeamForm tournamentId={id} maxRankTier={tournament.maxRankTier ?? null} />;
}


