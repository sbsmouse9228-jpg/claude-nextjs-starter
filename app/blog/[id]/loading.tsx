export default function BlogPostLoading() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="w-24 h-4 bg-gray-200 rounded animate-pulse mb-8" />
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-8 pt-10 pb-6 border-b border-gray-100 space-y-3">
            <div className="w-16 h-6 bg-gray-100 rounded-full animate-pulse" />
            <div className="w-3/4 h-8 bg-gray-200 rounded animate-pulse" />
            <div className="w-24 h-4 bg-gray-100 rounded animate-pulse" />
          </div>
          <div className="px-8 py-8 space-y-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className={`h-4 bg-gray-100 rounded animate-pulse ${i % 3 === 2 ? "w-2/3" : "w-full"}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
