"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CURRENCIES } from "@/lib/currencies";
import { DOTA2_REGIONS } from "@/lib/regions";

export default function NewTournamentForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
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
        setImagePreview(null);
      } else {
        setImageUrl(json.url);
      }
    } catch {
      setImageError("Upload failed. Please try again.");
      setImagePreview(null);
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
      entryFee: entryFeeRaw !== "" ? parseFloat(entryFeeRaw) : undefined,
      prizePool: (form.elements.namedItem("prizePool") as HTMLInputElement).value || undefined,
      currency: (form.elements.namedItem("currency") as HTMLSelectElement).value,
      region: (form.elements.namedItem("region") as HTMLSelectElement).value,
    };

    try {
      const res = await fetch("/api/tournaments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const json = await res.json();
        setError(json.error ?? "Something went wrong");
        return;
      }

      const tournament = await res.json();
      router.push(`/tournaments/${tournament.id}`);
    } catch {
      setError("Unexpected error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto p-8">
      <div className="flex items-center gap-4 mb-8">
        <button
          type="button"
          onClick={() => router.push("/tournaments")}
          className="text-sm text-amber-500 hover:underline"
        >
          ← Back to Tournaments
        </button>
      </div>
      <h1 className="text-3xl font-bold mb-8">Create Tournament</h1>

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
            className="w-full border border-gray-700 bg-gray-900 text-gray-100 placeholder:text-gray-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-y max-h-48"
          />
        </div>

        {/* Tournament Image */}
        <div>
          <label className="block text-sm font-medium mb-1">Tournament Banner</label>
          <div className="flex items-start gap-4">
            <div className="w-24 h-24 rounded-lg border border-gray-700 bg-gray-900 overflow-hidden flex items-center justify-center shrink-0">
              {imagePreview ? (
                <Image src={imagePreview} alt="Banner preview" width={96} height={96} className="object-cover w-full h-full" />
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
            className="w-full border border-gray-700 bg-gray-900 text-gray-100 placeholder:text-gray-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="region">
            Server / Region *
          </label>
          <select
            id="region"
            name="region"
            defaultValue=""
            required
            className="w-full border border-gray-700 bg-gray-900 text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="" disabled>Select a region…</option>
            {DOTA2_REGIONS.map((r) => (
              <option key={r.code} value={r.code}>{r.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="currency">
            Currency
          </label>
          <select
            id="currency"
            name="currency"
            defaultValue="USD"
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
              type="text"
              placeholder="e.g. 500, Steam Keys…"
              className="w-full border border-gray-700 bg-gray-900 text-gray-100 placeholder:text-gray-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || imageUploading}
          className="w-full rounded-lg bg-amber-500 px-4 py-2 text-gray-950 font-semibold hover:bg-amber-400 disabled:opacity-50 transition-colors"
        >
          {loading ? "Creating..." : "Create Tournament"}
        </button>
      </form>
    </div>
  );
}
