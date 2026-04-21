import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import RegisterTeamForm from "./_components/register-team-form";

export default async function RegisterTeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session) redirect(`/auth/signin?callbackUrl=/tournaments/${id}/register`);

  return <RegisterTeamForm tournamentId={id} />;
}


