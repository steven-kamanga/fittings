"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Control, FieldPath, FieldValues } from "react-hook-form";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  control: Control<TFieldValues>;
  name: TName;
  label: string;
  description?: string;
  placeholder?: string;
  disabled?: (date: Date) => boolean;
  className?: string;
  allowFutureDates?: boolean;
  returnStringValue?: boolean; // Return string instead of Date
  returnISOString?: boolean; // Return ISO string format (e.g., 2025-09-04T10:17:55.463Z)
}

export function DatePicker<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  label,
  description,
  placeholder = "Pick a date",
  disabled,
  className,
  allowFutureDates = false,
  returnStringValue = false,
  returnISOString = false,
}: DatePickerProps<TFieldValues, TName>) {
  const [open, setOpen] = useState(false);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("flex flex-col", className)}>
          <FormLabel>{label}</FormLabel>
          <Popover open={open} onOpenChange={setOpen} modal={true}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full pl-3 text-left font-normal",
                    !field.value && "text-muted-foreground"
                  )}
                >
                  {field.value ? (
                    typeof field.value === "string" ? (
                      format(new Date(field.value), "PPP")
                    ) : (
                      format(field.value, "PPP")
                    )
                  ) : (
                    <span>{placeholder}</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0 z-50"
              align="start"
              onInteractOutside={(e) => {
                // Prevent closing when clicking inside the calendar
                const target = e.target as Element;
                if (target.closest('[data-slot="calendar"]')) {
                  e.preventDefault();
                }
              }}
            >
              <Calendar
                mode="single"
                selected={
                  field.value
                    ? typeof field.value === "string"
                      ? new Date(field.value)
                      : field.value
                    : undefined
                }
                onSelect={(date) => {
                  console.log("Date selected:", date);
                  if (date) {
                    let value;
                    if (returnISOString) {
                      value = date.toISOString();
                    } else if (returnStringValue) {
                      value = format(date, "yyyy-MM-dd");
                    } else {
                      value = date;
                    }
                    field.onChange(value);
                  } else {
                    field.onChange(null);
                  }
                  setOpen(false);
                }}
                disabled={
                  disabled ||
                  (allowFutureDates
                    ? (date) => date < new Date("2020-01-01")
                    : (date) =>
                        date > new Date() || date < new Date("1900-01-01"))
                }
                startMonth={new Date(2015, 0)}
                endMonth={
                  allowFutureDates
                    ? new Date(new Date().getFullYear() + 10, 11)
                    : undefined
                }
                captionLayout="dropdown"
                autoFocus
              />
            </PopoverContent>
          </Popover>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
