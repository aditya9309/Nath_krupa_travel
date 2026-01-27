// Skeleton loader components for better loading states

export const CardSkeleton = () => (
  <div className="bg-white rounded-lg shadow-lg overflow-hidden animate-pulse">
    <div className="w-full h-48 bg-gray-200"></div>
    <div className="p-6">
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      <div className="flex justify-between items-center mt-4">
        <div className="h-6 bg-gray-200 rounded w-24"></div>
        <div className="h-4 bg-gray-200 rounded w-16"></div>
      </div>
    </div>
  </div>
)

export const PackageCardSkeleton = () => (
  <div className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
    <div className="w-full h-56 bg-gray-200 relative">
      <div className="absolute top-4 right-4 w-20 h-6 bg-gray-300 rounded"></div>
    </div>
    <div className="p-6">
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-4/5 mb-4"></div>
      <div className="flex justify-between items-center">
        <div className="h-7 bg-gray-200 rounded w-28"></div>
        <div className="h-5 bg-gray-200 rounded w-20"></div>
      </div>
    </div>
  </div>
)

export const DashboardStatsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="bg-white rounded-lg shadow-lg p-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="w-12 h-12 bg-gray-200 rounded"></div>
        </div>
      </div>
    ))}
  </div>
)

export const TableSkeleton = () => (
  <div className="bg-white rounded-lg shadow-lg overflow-hidden animate-pulse">
    <div className="p-6">
      <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center space-x-4">
            <div className="h-12 bg-gray-200 rounded w-12"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-24"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
)

export const TextSkeleton = ({ lines = 3, className = '' }) => (
  <div className={className}>
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className={`h-4 bg-gray-200 rounded mb-2 animate-pulse ${
          i === lines - 1 ? 'w-3/4' : 'w-full'
        }`}
      />
    ))}
  </div>
)
