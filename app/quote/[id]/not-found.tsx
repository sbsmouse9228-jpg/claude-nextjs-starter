import Link from "next/link";
import { FileX } from "lucide-react";

export default function QuoteNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <FileX className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h1 className="text-xl font-semibold text-gray-800 mb-2">견적서를 찾을 수 없습니다</h1>
        <p className="text-sm text-gray-500 mb-6">
          링크가 잘못되었거나 견적서가 삭제되었을 수 있습니다.
        </p>
        <Link
          href="/"
          className="text-sm text-gray-600 underline underline-offset-4 hover:text-gray-900"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
