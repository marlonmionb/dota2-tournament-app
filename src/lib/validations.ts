import { z } from "zod";
import { TournamentFormat } from "@prisma/client";

const httpsUrl = z
  .string()
  .url()
  .refine((url) => url.startsWith("https://"), {
    message: "URL must use HTTPS",
  });

const supabaseStorageUrl = z
  .string()
  .url()
  .refine(
    (url) =>
      url.startsWith(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/`
      ),
    { message: "Image must be uploaded via the platform" }
  );

export const createTournamentSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().optional(),
  maxTeams: z
    .number()
    .int()
    .min(2, "Must have at least 2 teams")
    .refine((n) => (n & (n - 1)) === 0, {
      message: "Max teams must be a power of 2 (e.g. 2, 4, 8, 16)",
    }),
  startDate: z.coerce.date(),
  registrationDeadline: z.coerce.date(),
  format: z.nativeEnum(TournamentFormat).default(TournamentFormat.SINGLE_ELIMINATION),
  imageUrl: supabaseStorageUrl.optional().or(z.literal("")),
  discordUrl: httpsUrl.optional().or(z.literal("")),
  entryFee: z.coerce.number().min(0, "Entry fee cannot be negative").optional(),
  prizePool: z.string().max(200).optional(),
  currency: z.string().min(1).max(10).default("USD"),
});

export const registerTeamSchema = z.object({
  teamName: z.string().min(1, "Team name is required").max(100),
  captainName: z.string().min(1, "Captain name is required").max(100),
  logoUrl: supabaseStorageUrl.optional().or(z.literal("")),
  players: z
    .array(
      z.object({
        nickname: z.string().min(1, "Nickname is required"),
        steamId: z.string().min(1, "Steam ID is required"),
      })
    )
    .length(5, "A team must have exactly 5 players"),
});

export const matchResultSchema = z.object({
  winnerId: z.string().uuid("Winner ID must be a valid UUID"),
});

export type CreateTournamentInput = z.infer<typeof createTournamentSchema>;
export type RegisterTeamInput = z.infer<typeof registerTeamSchema>;
export type MatchResultInput = z.infer<typeof matchResultSchema>;

export const updateTournamentSchema = createTournamentSchema.partial();
export type UpdateTournamentInput = z.infer<typeof updateTournamentSchema>;
