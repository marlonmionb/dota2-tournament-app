export default function TournamentLoading() {
  return (
    <div className="max-w-4xl mx-auto p-8 animate-pulse">
      {/* Back link */}
      <div className="h-4 w-32 bg-gray-800 rounded mb-6" />

      {/* Banner skeleton */}
      <div className="w-full h-48 sm:h-64 rounded-xl bg-gray-900 mb-8" />

      {/* Title + badge */}
      <div className="mb-8 space-y-3">
        <div className="h-8 w-2/3 bg-gray-800 rounded" />
        <div className="flex gap-2">
          <div className="h-5 w-28 bg-gray-800 rounded-full" />
          <div className="h-5 w-40 bg-gray-800 rounded-full" />
        </div>
      </div>

      {/* Teams grid skeleton */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border border-gray-800 rounded-xl p-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-lg bg-gray-800" />
              <div className="h-4 w-32 bg-gray-800 rounded" />
            </div>
            {Array.from({ length: 5 }).map((_, j) => (
              <div key={j} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-800" />
                <div className="space-y-1.5">
                  <div className="h-3.5 w-24 bg-gray-800 rounded" />
                  <div className="h-3 w-16 bg-gray-800 rounded" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
