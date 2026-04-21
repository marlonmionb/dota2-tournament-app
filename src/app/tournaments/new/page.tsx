import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import NewTournamentForm from "./_components/new-tournament-form";

export default async function NewTournamentPage() {
  const session = await auth();
  if (!session) redirect("/auth/signin?callbackUrl=/tournaments/new");

  return <NewTournamentForm />;
}
