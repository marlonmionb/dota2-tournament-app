import { auth } from "@/lib/auth";
import { getTeamById } from "@/services/team-service";
import { getTournamentById } from "@/services/tournament-service";
import { notFound, redirect } from "next/navigation";
import EditTeamForm from "./_components/edit-team-form";

export default async function EditTeamPage({
  params,
}: {
  params: Promise<{ id: string; teamId: string }>;
}) {
  const [{ id, teamId }, session] = await Promise.all([params, auth()]);

  if (!session?.user?.id) {
    redirect(`/auth/signin?callbackUrl=/tournaments/${id}/teams/${teamId}/edit`);
  }

  const [team, tournament] = await Promise.all([
    getTeamById(teamId).catch(() => null),
    getTournamentById(id).catch(() => null),
  ]);

  if (!team || !tournament || team.tournamentId !== id) notFound();

  const isOrganizer = session.user.id === tournament.organizerId;
  const isRegistrant = session.user.id === team.registeredById;
  if (!isOrganizer && !isRegistrant) notFound();

  return (
    <EditTeamForm
      tournamentId={id}
      team={team}
      maxRankTier={tournament.maxRankTier ?? null}
    />
  );
}
