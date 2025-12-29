import { z } from "zod";
import { Control, UseFormReturn } from "react-hook-form";

export type FieldType =
  | "text"
  | "number"
  | "textarea"
  | "select"
  | "datePicker"
  | "checkbox"
  | "password"
  | "email";

export interface SelectOption {
  label: string;
  value: string | number;
}

export interface ConditionalRule {
  dependsOn: string; // field name this rule depends on
  condition: "equals" | "notEquals" | "includes" | "notIncludes";
  value: any;
  action: "show" | "hide" | "enable" | "disable";
}

export interface FieldConfig {
  fieldName: string;
  fieldType: FieldType;
  label?: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  options?: SelectOption[]; // for select fields
  validation?: z.ZodTypeAny; // additional zod validation
  conditionalRules?: ConditionalRule[]; // conditional field behavior
  gridClassName?: string; // custom grid classes for layout
  // Field-specific props
  min?: number; // for number inputs
  max?: number; // for number inputs
  step?: number; // for number inputs
  rows?: number; // for textarea
  allowFutureDates?: boolean; // for datePicker
  returnISOString?: boolean; // for datePicker
}

export interface StepConfig {
  title: string;
  description?: string;
  fields: FieldConfig[];
  gridClassName?: string; // grid layout for the entire step
}

export interface MultiStepFormProps {
  steps: StepConfig[];
  schema: z.ZodSchema<any>;
  defaultValues?: Record<string, any>;
  onSubmitAction: (values: any) => void | Promise<void>;
  submitButtonText?: string;
  isSubmitting?: boolean;
  className?: string;
}

export interface DynamicFieldProps {
  control: Control<any>;
  config: FieldConfig;
  disabled?: boolean;
}

export interface StepValidationResult {
  isValid: boolean;
  errors?: Record<string, string>;
}
