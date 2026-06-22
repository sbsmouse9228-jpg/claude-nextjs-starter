"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CustomerFormSchema, type CustomerFormValues } from "@/types/invoice";
import type { Customer } from "@/lib/generated/prisma/client";

interface CustomerFormProps {
  defaultValues?: Customer;
}

export function CustomerForm({ defaultValues }: CustomerFormProps) {
  const router = useRouter();
  const isEditing = !!defaultValues;

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(CustomerFormSchema),
    defaultValues: defaultValues ?? {
      name: "",
      email: "",
      phone: "",
      address: "",
      company: "",
    },
  });

  async function onSubmit(values: CustomerFormValues) {
    try {
      const url = isEditing
        ? `/api/customers/${defaultValues.id}`
        : "/api/customers";
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

      toast.success(isEditing ? "고객 정보가 수정되었습니다." : "고객이 등록되었습니다.");
      router.push("/dashboard/customers");
      router.refresh();
    } catch {
      toast.error("네트워크 오류가 발생했습니다.");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>이름 *</FormLabel>
                <FormControl>
                  <Input placeholder="홍길동" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>이메일 *</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="example@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>회사명</FormLabel>
                <FormControl>
                  <Input placeholder="회사명 (선택)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>전화번호</FormLabel>
                <FormControl>
                  <Input placeholder="010-0000-0000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>주소</FormLabel>
              <FormControl>
                <Input placeholder="주소 (선택)" {...field} />
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
              : "고객 등록"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
