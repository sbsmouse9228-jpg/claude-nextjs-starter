"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { InvoiceItemsEditor } from "./invoice-items-editor";
import { InvoiceFormSchema, type InvoiceFormValues } from "@/types/invoice";
import { cn } from "@/lib/utils";
import type { Customer, Invoice } from "@/lib/generated/prisma/client";
import type { InvoiceWithDetails } from "@/types/invoice";

interface InvoiceFormProps {
  customers: Customer[];
  defaultValues?: InvoiceWithDetails;
}

export function InvoiceForm({ customers, defaultValues }: InvoiceFormProps) {
  const router = useRouter();

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(InvoiceFormSchema),
    defaultValues: defaultValues
      ? {
          customerId: defaultValues.customerId,
          issueDate: new Date(defaultValues.issueDate),
          dueDate: new Date(defaultValues.dueDate),
          taxRate: defaultValues.taxRate,
          notes: defaultValues.notes ?? "",
          items: defaultValues.items.map((item) => ({
            id: item.id,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.amount,
            order: item.order,
          })),
        }
      : {
          customerId: "",
          issueDate: new Date(),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          taxRate: 0.1,
          notes: "",
          items: [{ description: "", quantity: 1, unitPrice: 0, amount: 0, order: 0 }],
        },
  });

  const isEditing = !!defaultValues;

  async function onSubmit(values: InvoiceFormValues) {
    try {
      const url = isEditing
        ? `/api/invoices/${defaultValues.id}`
        : "/api/invoices";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "저장에 실패했습니다.");
        return;
      }

      const { data } = await res.json();
      toast.success(isEditing ? "청구서가 수정되었습니다." : "청구서가 생성되었습니다.");
      router.push(`/dashboard/invoices/${data.id}`);
      router.refresh();
    } catch {
      toast.error("네트워크 오류가 발생했습니다.");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 고객 선택 */}
          <FormField
            control={form.control}
            name="customerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>고객</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="고객을 선택하세요" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} {c.company ? `(${c.company})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 세율 */}
          <FormField
            control={form.control}
            name="taxRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>세율</FormLabel>
                <Select
                  onValueChange={(v) => field.onChange(parseFloat(v))}
                  defaultValue={String(field.value)}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="0">0%</SelectItem>
                    <SelectItem value="0.05">5%</SelectItem>
                    <SelectItem value="0.1">10%</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 발행일 */}
          <FormField
            control={form.control}
            name="issueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>발행일</FormLabel>
                <Popover>
                  <FormControl>
                    <PopoverTrigger
                      className={cn(
                        "inline-flex w-full items-center justify-start gap-2 rounded-lg border bg-background px-3 py-2 text-sm font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="h-4 w-4" />
                      {field.value ? format(field.value, "yyyy년 MM월 dd일") : "날짜 선택"}
                    </PopoverTrigger>
                  </FormControl>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 납기일 */}
          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>납기일</FormLabel>
                <Popover>
                  <FormControl>
                    <PopoverTrigger
                      className={cn(
                        "inline-flex w-full items-center justify-start gap-2 rounded-lg border bg-background px-3 py-2 text-sm font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="h-4 w-4" />
                      {field.value ? format(field.value, "yyyy년 MM월 dd일") : "날짜 선택"}
                    </PopoverTrigger>
                  </FormControl>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* 청구서 항목 */}
        <div>
          <h3 className="text-sm font-medium mb-3">청구 항목</h3>
          <InvoiceItemsEditor />
        </div>

        {/* 메모 */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>메모 (선택)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="청구서 관련 메모를 입력하세요"
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            취소
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting
              ? "저장 중..."
              : isEditing
              ? "수정 완료"
              : "청구서 생성"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
