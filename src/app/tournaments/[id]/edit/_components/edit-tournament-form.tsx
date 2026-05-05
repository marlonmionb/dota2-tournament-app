"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { Tournament } from "@/types";
import { CURRENCIES } from "@/lib/currencies";

function toDatetimeLocal(date: Date | string): string {
  const d = new Date(date);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EditTournamentForm({ tournament }: { tournament: Tournament }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [imagePreview, setImagePreview] = useState<string | null>(tournament.imageUrl ?? null);
  const [imageUrl, setImageUrl] = useState<string | null>(tournament.imageUrl ?? null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageError(null);
    setImagePreview(URL.createObjectURL(file));
    setImageUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload/tournament-image", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) {
        setImageError(json.error ?? "Upload failed");
        setImagePreview(tournament.imageUrl ?? null);
      } else {
        setImageUrl(json.url);
      }
    } catch {
      setImageError("Upload failed. Please try again.");
      setImagePreview(tournament.imageUrl ?? null);
    } finally {
      setImageUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = e.currentTarget;
    const entryFeeRaw = (form.elements.namedItem("entryFee") as HTMLInputElement).value;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      description: (form.elements.namedItem("description") as HTMLTextAreaElement).value || undefined,
      maxTeams: parseInt((form.elements.namedItem("maxTeams") as HTMLSelectElement).value, 10),
      startDate: (form.elements.namedItem("startDate") as HTMLInputElement).value,
      registrationDeadline: (form.elements.namedItem("registrationDeadline") as HTMLInputElement).value,
      imageUrl: imageUrl || undefined,
      discordUrl: (form.elements.namedItem("discordUrl") as HTMLInputElement).value || undefined,
      streamUrl: (form.elements.namedItem("streamUrl") as HTMLInputElement).value || undefined,
      entryFee: entryFeeRaw !== "" ? parseFloat(entryFeeRaw) : undefined,
      prizePool: (() => { const v = (form.elements.namedItem("prizePool") as HTMLInputElement).value; return v !== "" ? parseFloat(v) : undefined; })(),
      currency: (form.elements.namedItem("currency") as HTMLSelectElement).value,
      maxRankTier: (() => {
        const v = (form.elements.namedItem("maxRankTier") as HTMLSelectElement).value;
        return v ? parseInt(v, 10) : undefined;
      })(),
    };

    try {
      const res = await fetch(`/api/tournaments/${tournament.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const json = await res.json();
        setError(json.error ?? "Something went wrong");
        return;
      }

      router.push(`/tournaments/${tournament.id}`);
      router.refresh();
    } catch {
      setError("Unexpected error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Edit Tournament</h1>

      {error && (
        <div className="mb-4 rounded-lg bg-red-950/50 border border-red-800 text-red-400 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="name">
            Tournament Name *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={tournament.name}
            className="w-full border border-gray-700 bg-gray-900 text-gray-100 placeholder:text-gray-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={tournament.description ?? ""}
            className="w-full border border-gray-700 bg-gray-900 text-gray-100 placeholder:text-gray-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Tournament Image */}
        <div>
          <label className="block text-sm font-medium mb-1">Tournament Banner</label>
          <div className="flex items-start gap-4">
            <div className="w-24 h-24 rounded-lg border border-gray-700 bg-gray-900 overflow-hidden flex items-center justify-center shrink-0">
              {imagePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imagePreview} alt="Banner preview" className="object-cover w-full h-full" />
              ) : (
                <span className="text-xs text-gray-500">No image</span>
              )}
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <input
                id="tournamentImage"
                name="tournamentImage"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={imageUploading}
                onChange={handleImageChange}
                className="text-sm text-gray-400 file:mr-3 file:rounded-lg file:border file:border-gray-600 file:px-3 file:py-1.5 file:text-xs file:font-medium file:bg-gray-800 file:text-gray-200 hover:file:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p className="text-xs text-gray-500">JPEG, PNG, or WebP · max 4 MB</p>
              {imageUploading && <p className="text-xs text-amber-400">Uploading…</p>}
              {imageError && <p className="text-xs text-red-500">{imageError}</p>}
              {imageUrl && !imageUploading && <p className="text-xs text-green-500">Image uploaded ✓</p>}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="maxTeams">
            Max Teams *
          </label>
          <select
            id="maxTeams"
            name="maxTeams"
            required
            defaultValue={tournament.maxTeams}
            className="w-full border border-gray-700 bg-gray-900 text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            {[2, 4, 8, 16].map((n) => (
              <option key={n} value={n}>
                {n} teams
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="registrationDeadline">
            Registration Deadline *
          </label>
          <input
            id="registrationDeadline"
            name="registrationDeadline"
            type="datetime-local"
            required
            defaultValue={toDatetimeLocal(tournament.registrationDeadline)}
            style={{ colorScheme: 'dark' }}
            className="w-full border border-gray-700 bg-gray-900 text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="startDate">
            Start Date *
          </label>
          <input
            id="startDate"
            name="startDate"
            type="datetime-local"
            required
            defaultValue={toDatetimeLocal(tournament.startDate)}
            style={{ colorScheme: 'dark' }}
            className="w-full border border-gray-700 bg-gray-900 text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="discordUrl">
            Discord Server
          </label>
          <input
            id="discordUrl"
            name="discordUrl"
            type="url"
            placeholder="https://discord.gg/..."
            defaultValue={tournament.discordUrl ?? ""}
            className="w-full border border-gray-700 bg-gray-900 text-gray-100 placeholder:text-gray-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="streamUrl">
            Stream URL
          </label>
          <input
            id="streamUrl"
            name="streamUrl"
            type="url"
            placeholder="https://twitch.tv/... or https://youtube.com/..."
            defaultValue={tournament.streamUrl ?? ""}
            className="w-full border border-gray-700 bg-gray-900 text-gray-100 placeholder:text-gray-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="maxRankTier">
            Maximum Rank Tier <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <select
            id="maxRankTier"
            name="maxRankTier"
            defaultValue={tournament.maxRankTier ?? ""}
            className="w-full border border-gray-700 bg-gray-900 text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">No rank restriction</option>
            <option value="1">Herald</option>
            <option value="2">Guardian</option>
            <option value="3">Crusader</option>
            <option value="4">Archon</option>
            <option value="5">Legend</option>
            <option value="6">Ancient</option>
            <option value="7">Divine</option>
            <option value="8">Immortal</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">Players ranked above this tier will not be able to register.</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="currency">
            Currency
          </label>
          <select
            id="currency"
            name="currency"
            defaultValue={tournament.currency ?? "USD"}
            className="w-full border border-gray-700 bg-gray-900 text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>{c.label}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="entryFee">
              Entry Fee per Team
            </label>
            <input
              id="entryFee"
              name="entryFee"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              defaultValue={tournament.entryFee ?? ""}
              className="w-full border border-gray-700 bg-gray-900 text-gray-100 placeholder:text-gray-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="prizePool">
              Prize Pool
            </label>
            <input
              id="prizePool"
              name="prizePool"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              defaultValue={tournament.prizePool ?? ""}
              className="w-full border border-gray-700 bg-gray-900 text-gray-100 placeholder:text-gray-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-300 font-semibold hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || imageUploading}
            className="flex-1 rounded-lg bg-amber-500 px-4 py-2 text-gray-950 font-semibold hover:bg-amber-400 disabled:opacity-50 transition-colors"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
