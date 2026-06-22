"use client";

import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { formatCurrency } from "@/lib/format";
import type { InvoiceFormValues } from "@/types/invoice";

export function InvoiceItemsEditor() {
  const { control } = useFormContext<InvoiceFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const items = useWatch({ control, name: "items" });
  const taxRate = useWatch({ control, name: "taxRate" });

  const subtotal = items?.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
    0
  ) ?? 0;
  const taxAmount = subtotal * (Number(taxRate) || 0);
  const total = subtotal + taxAmount;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[1fr_80px_120px_100px_40px] gap-2 text-sm font-medium text-muted-foreground px-1">
        <span>항목 설명</span>
        <span className="text-right">수량</span>
        <span className="text-right">단가</span>
        <span className="text-right">금액</span>
        <span />
      </div>

      {fields.map((field, index) => {
        const qty = Number(items?.[index]?.quantity) || 0;
        const price = Number(items?.[index]?.unitPrice) || 0;
        const amount = qty * price;

        return (
          <div key={field.id} className="grid grid-cols-[1fr_80px_120px_100px_40px] gap-2 items-start">
            <FormField
              control={control}
              name={`items.${index}.description`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="항목 설명" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`items.${index}.quantity`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      className="text-right"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`items.${index}.unitPrice`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="100"
                      className="text-right"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center h-9 text-sm text-right justify-end px-1">
              {formatCurrency(amount)}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => remove(index)}
              disabled={fields.length === 1}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      })}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() =>
          append({ description: "", quantity: 1, unitPrice: 0, amount: 0, order: fields.length })
        }
      >
        <Plus className="h-4 w-4 mr-1" />
        항목 추가
      </Button>

      <div className="border-t pt-4 space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">소계</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">세액 ({Math.round((Number(taxRate) || 0) * 100)}%)</span>
          <span>{formatCurrency(taxAmount)}</span>
        </div>
        <div className="flex justify-between font-semibold text-base border-t pt-1">
          <span>합계</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
}
