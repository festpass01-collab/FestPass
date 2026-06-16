export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <div className="h-7 w-48 bg-gray-200 rounded-md"></div>
        <div className="h-4 w-64 bg-gray-200 rounded-md"></div>
      </div>

      {/* Grid Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-xl p-5 space-y-3 shadow-sm">
            <div className="flex justify-between items-center">
              <div className="h-4 w-24 bg-gray-200 rounded-md"></div>
              <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="h-7 w-16 bg-gray-200 rounded-md"></div>
          </div>
        ))}
      </div>

      {/* Main Content Skeleton */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm space-y-4">
        <div className="h-5 w-32 bg-gray-200 rounded-md"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
              <div className="space-y-2">
                <div className="h-4 w-40 bg-gray-200 rounded-md"></div>
                <div className="h-3.5 w-24 bg-gray-200 rounded-md"></div>
              </div>
              <div className="h-6 w-16 bg-gray-200 rounded-md"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
