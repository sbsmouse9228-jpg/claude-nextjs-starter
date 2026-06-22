export default function QuoteLoading() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto mb-6 flex justify-end">
        <div className="w-28 h-9 bg-gray-200 rounded-lg animate-pulse" />
      </div>
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gray-200 h-32 animate-pulse" />
        <div className="px-8 py-8 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-12 bg-gray-100 rounded animate-pulse" />
                <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
          <hr className="border-gray-100" />
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
