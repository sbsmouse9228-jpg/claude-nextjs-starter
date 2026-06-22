import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomerForm } from "@/components/invoice/customer-form";

export default function NewCustomerPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">고객 등록</h1>
        <p className="text-muted-foreground text-sm mt-1">새 고객 정보를 입력하세요</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>고객 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomerForm />
        </CardContent>
      </Card>
    </div>
  );
}
