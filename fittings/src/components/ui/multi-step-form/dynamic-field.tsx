"use client";

import { Control } from "react-hook-form";
import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { FieldConfig } from "./types";
import { cn } from "@/lib/utils";

interface DynamicFieldProps {
  control: Control<any>;
  config: FieldConfig;
  disabled?: boolean;
}

export function DynamicField({
  control,
  config,
  disabled = false,
}: DynamicFieldProps) {
  const isDisabled = disabled || config.disabled;

  const handleSelectChange = useCallback(
    (value: string, field: any) => {
      // Check if the field expects a number by looking at the original option values
      const originalOption = config.options?.find(
        (opt) => String(opt.value) === value
      );
      if (originalOption && typeof originalOption.value === "number") {
        field.onChange(Number(value));
      } else {
        field.onChange(value);
      }
    },
    [config.options]
  );

  const handleNumberChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, field: any) => {
      const value = e.target.value;
      field.onChange(value === "" ? undefined : Number(value));
    },
    []
  );

  if (config.fieldType === "datePicker") {
    return (
      <div className={cn(config.gridClassName)}>
        <DatePicker
          control={control}
          name={config.fieldName}
          label={config.label || config.fieldName}
          description={config.description}
          placeholder={config.placeholder}
          allowFutureDates={config.allowFutureDates}
          returnISOString={config.returnISOString}
        />
      </div>
    );
  }

  if (config.fieldType === "checkbox") {
    return (
      <div className={cn(config.gridClassName)}>
        <FormField
          control={control}
          name={config.fieldName}
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value || false}
                  onCheckedChange={field.onChange}
                  disabled={isDisabled}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel isRequired={config.required}>
                  {config.label || config.fieldName}
                </FormLabel>
                {config.description && (
                  <FormDescription>{config.description}</FormDescription>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    );
  }

  return (
    <div className={cn(config.gridClassName)}>
      <FormField
        control={control}
        name={config.fieldName}
        render={({ field }) => (
          <FormItem>
            <FormLabel isRequired={config.required}>
              {config.label || config.fieldName}
            </FormLabel>
            <FormControl>
              {config.fieldType === "select" ? (
                <Select
                  onValueChange={(value) => handleSelectChange(value, field)}
                  value={String(field.value || "")}
                  disabled={isDisabled}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={config.placeholder || "Select an option"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {config.options?.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={String(option.value)}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : config.fieldType === "number" ? (
                <Input
                  {...field}
                  type="number"
                  placeholder={config.placeholder}
                  min={config.min}
                  max={config.max}
                  step={config.step}
                  disabled={isDisabled}
                  value={field.value ?? ""}
                  onChange={(e) => handleNumberChange(e, field)}
                />
              ) : config.fieldType === "textarea" ? (
                <Textarea
                  {...field}
                  placeholder={config.placeholder}
                  rows={config.rows}
                  disabled={isDisabled}
                  value={field.value ?? ""}
                />
              ) : (
                <Input
                  {...field}
                  type={
                    config.fieldType === "email"
                      ? "email"
                      : config.fieldType === "password"
                      ? "password"
                      : "text"
                  }
                  placeholder={config.placeholder}
                  disabled={isDisabled}
                  value={field.value ?? ""}
                />
              )}
            </FormControl>
            {config.description && (
              <FormDescription>{config.description}</FormDescription>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
