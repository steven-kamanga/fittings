import { z } from "zod";
import { FieldConfig, StepConfig, StepValidationResult } from "./types";

export function getStepFieldNames(step: StepConfig): string[] {
  return step.fields.map((field) => field.fieldName);
}

export function createStepSchema(
  mainSchema: z.ZodSchema<any>,
  fieldNames: string[]
): z.ZodSchema<any> {
  if (mainSchema instanceof z.ZodObject) {
    const shape = mainSchema.shape;
    const stepShape: Record<string, z.ZodTypeAny> = {};

    fieldNames.forEach((fieldName) => {
      if (shape[fieldName]) {
        stepShape[fieldName] = shape[fieldName];
      }
    });

    return z.object(stepShape);
  }

  return mainSchema;
}

export function validateStep(
  stepConfig: StepConfig,
  formData: any,
  mainSchema: z.ZodSchema<any>
): StepValidationResult {
  try {
    const fieldNames = getStepFieldNames(stepConfig);
    const stepSchema = createStepSchema(mainSchema, fieldNames);

    const stepData: Record<string, any> = {};
    fieldNames.forEach((fieldName) => {
      if (formData[fieldName] !== undefined) {
        stepData[fieldName] = formData[fieldName];
      }
    });

    stepSchema.parse(stepData);
    return { isValid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        if (err.path.length > 0) {
          errors[err.path[0].toString()] = err.message;
        }
      });
      return { isValid: false, errors };
    }

    return { isValid: false, errors: { general: "Validation failed" } };
  }
}

export function getStepDefaultValues(
  stepConfig: StepConfig
): Record<string, any> {
  const defaults: Record<string, any> = {};

  stepConfig.fields.forEach((field) => {
    switch (field.fieldType) {
      case "number":
        defaults[field.fieldName] = field.min || 0;
        break;
      case "checkbox":
        defaults[field.fieldName] = false;
        break;
      case "select":
        if (field.options && field.options.length > 0) {
          defaults[field.fieldName] = field.options[0].value;
        }
        break;
      default:
        defaults[field.fieldName] = "";
    }
  });

  return defaults;
}

export function mergeDefaultValues(
  steps: StepConfig[],
  providedDefaults?: Record<string, any>
): Record<string, any> {
  const stepDefaults = steps.reduce((acc, step) => {
    return { ...acc, ...getStepDefaultValues(step) };
  }, {});

  return { ...stepDefaults, ...providedDefaults };
}

export function areRequiredFieldsFilled(
  stepConfig: StepConfig,
  formData: any
): boolean {
  return stepConfig.fields
    .filter((field) => field.required)
    .every((field) => {
      const value = formData[field.fieldName];
      return value !== undefined && value !== "" && value !== null;
    });
}

export function getStepValidationErrors(
  stepConfig: StepConfig,
  validationResult: StepValidationResult
): Record<string, string> {
  if (validationResult.isValid || !validationResult.errors) {
    return {};
  }

  const stepFieldNames = getStepFieldNames(stepConfig);
  const stepErrors: Record<string, string> = {};

  Object.entries(validationResult.errors).forEach(([fieldName, error]) => {
    if (stepFieldNames.includes(fieldName)) {
      stepErrors[fieldName] = error;
    }
  });

  return stepErrors;
}

export function calculateFormProgress(
  steps: StepConfig[],
  formData: any
): number {
  const totalFields = steps.reduce((acc, step) => acc + step.fields.length, 0);
  const filledFields = steps.reduce((acc, step) => {
    const filled = step.fields.filter((field) => {
      const value = formData[field.fieldName];
      return value !== undefined && value !== "" && value !== null;
    }).length;
    return acc + filled;
  }, 0);

  return totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;
}

export function getVisibleFields(
  stepConfig: StepConfig,
  formData: any
): FieldConfig[] {
  return stepConfig.fields.filter((field) => {
    if (!field.conditionalRules || field.conditionalRules.length === 0) {
      return true;
    }

    return field.conditionalRules.every((rule) => {
      const dependentValue = formData[rule.dependsOn];
      let conditionMet = false;

      switch (rule.condition) {
        case "equals":
          conditionMet = dependentValue === rule.value;
          break;
        case "notEquals":
          conditionMet = dependentValue !== rule.value;
          break;
        case "includes":
          conditionMet = Array.isArray(dependentValue)
            ? dependentValue.includes(rule.value)
            : String(dependentValue).includes(String(rule.value));
          break;
        case "notIncludes":
          conditionMet = Array.isArray(dependentValue)
            ? !dependentValue.includes(rule.value)
            : !String(dependentValue).includes(String(rule.value));
          break;
      }

      if (rule.action === "hide") {
        return !conditionMet;
      }
      if (rule.action === "show") {
        return conditionMet;
      }

      return true;
    });
  });
}

export function validateFormConfiguration(
  steps: StepConfig[],
  schema: z.ZodSchema<any>
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!steps || steps.length === 0) {
    errors.push("At least one step is required");
  }

  steps.forEach((step, index) => {
    if (!step.fields || step.fields.length === 0) {
      errors.push(`Step ${index + 1} must have at least one field`);
    }

    if (!step.title || step.title.trim() === "") {
      errors.push(`Step ${index + 1} must have a title`);
    }

    step.fields.forEach((field, fieldIndex) => {
      if (!field.fieldName || field.fieldName.trim() === "") {
        errors.push(
          `Field ${fieldIndex + 1} in step ${index + 1} must have a fieldName`
        );
      }

      if (!field.fieldType) {
        errors.push(
          `Field ${fieldIndex + 1} in step ${index + 1} must have a fieldType`
        );
      }

      if (
        field.fieldType === "select" &&
        (!field.options || field.options.length === 0)
      ) {
        errors.push(
          `Select field "${field.fieldName}" in step ${
            index + 1
          } must have options`
        );
      }
    });
  });

  return { isValid: errors.length === 0, errors };
}
