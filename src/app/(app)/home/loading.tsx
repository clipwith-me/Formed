export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-gray-50 pb-24 animate-pulse">
      {/* Header skeleton */}
      <div className="bg-gradient-to-r from-[#1F5E4A] to-[#2d7a61] px-4 pt-10 pb-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-3 w-24 bg-white/20 rounded-full mb-2" />
              <div className="h-6 w-40 bg-white/30 rounded-full" />
            </div>
            <div className="w-10 h-10 bg-white/20 rounded-full" />
          </div>

          {/* Hero card skeleton */}
          <div className="bg-white/10 rounded-2xl p-4 mt-4 space-y-3">
            <div className="h-3 w-20 bg-white/20 rounded-full" />
            <div className="h-5 w-48 bg-white/30 rounded-full" />
            <div className="h-3 w-full bg-white/20 rounded-full" />
            <div className="h-3 w-3/4 bg-white/20 rounded-full" />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Daily verse skeleton */}
        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
          <div className="h-3 w-24 bg-gray-200 rounded-full" />
          <div className="h-4 w-full bg-gray-200 rounded-full" />
          <div className="h-4 w-5/6 bg-gray-200 rounded-full" />
          <div className="h-4 w-4/6 bg-gray-200 rounded-full" />
          <div className="h-3 w-20 bg-gray-100 rounded-full" />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl p-4 shadow-sm space-y-2">
              <div className="h-6 w-10 bg-gray-200 rounded-full" />
              <div className="h-3 w-16 bg-gray-100 rounded-full" />
            </div>
          ))}
        </div>

        {/* Section title */}
        <div className="h-4 w-32 bg-gray-200 rounded-full" />

        {/* Prayer cards */}
        {[1, 2].map(i => (
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-28 bg-gray-200 rounded-full" />
                <div className="h-3 w-20 bg-gray-100 rounded-full" />
              </div>
            </div>
            <div className="h-3 w-full bg-gray-100 rounded-full" />
            <div className="h-3 w-3/4 bg-gray-100 rounded-full" />
          </div>
        ))}

        {/* Section title */}
        <div className="h-4 w-36 bg-gray-200 rounded-full" />

        {/* Testimony card */}
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-28 bg-gray-200 rounded-full" />
              <div className="h-3 w-20 bg-gray-100 rounded-full" />
            </div>
          </div>
          <div className="h-32 w-full bg-gray-100 rounded-xl" />
          <div className="h-3 w-full bg-gray-100 rounded-full" />
          <div className="h-3 w-2/3 bg-gray-100 rounded-full" />
        </div>
      </div>
    </div>
  )
}
