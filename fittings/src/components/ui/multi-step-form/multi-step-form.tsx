"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { MultiStepFormProps, StepConfig } from "./types";
import { DynamicField } from "./dynamic-field";
import {
  validateStep,
  validateFormConfiguration,
  getStepFieldNames,
} from "./utils";
import { cn } from "@/lib/utils";

export function MultiStepForm({
  steps,
  schema,
  defaultValues = {},
  onSubmitAction,
  submitButtonText = "Submit",
  isSubmitting = false,
  className,
}: MultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [stepErrors, setStepErrors] = useState<Record<number, boolean>>({});

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues,
    mode: "onChange",
  });

  const configValidation = validateFormConfiguration(steps, schema);
  if (!configValidation.isValid) {
    return (
      <div className="p-4 border border-destructive rounded-md">
        <h3 className="text-destructive font-semibold">
          Form Configuration Error
        </h3>
        <ul className="list-disc list-inside mt-2">
          {configValidation.errors.map((error, index) => (
            <li key={index} className="text-sm text-destructive">
              {error}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const totalSteps = steps.length;

  const validateCurrentStep = async () => {
    const currentStepConfig = steps[currentStep - 1];
    const currentValues = form.getValues();

    try {
      const validationResult = validateStep(
        currentStepConfig,
        currentValues,
        schema
      );

      if (validationResult.isValid) {
        setStepErrors((prev) => ({ ...prev, [currentStep]: false }));
        return true;
      } else {
        setStepErrors((prev) => ({ ...prev, [currentStep]: true }));
        const stepFieldNames = getStepFieldNames(currentStepConfig);
        await form.trigger(stepFieldNames as any);
        return false;
      }
    } catch (error) {
      setStepErrors((prev) => ({ ...prev, [currentStep]: true }));
      await form.trigger();
      return false;
    }
  };

  const nextStep = async (e?: React.MouseEvent) => {
    console.log("Next step clicked!");
    console.log("Current step:", currentStep);
    console.log("Total steps:", totalSteps);
    e?.preventDefault();
    e?.stopPropagation();
    if (currentStep < totalSteps) {
      const isValid = await validateCurrentStep();
      console.log("Step validation result:", isValid);
      if (isValid) {
        console.log("Moving to next step:", currentStep + 1);
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const prevStep = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = async (stepNumber: number) => {
    if (stepNumber < currentStep) {
      setCurrentStep(stepNumber);
    } else if (stepNumber > currentStep) {
      let canProceed = true;
      for (let i = currentStep; i < stepNumber && canProceed; i++) {
        const tempStep = currentStep;
        setCurrentStep(i);
        canProceed = await validateCurrentStep();
        if (!canProceed) {
          setCurrentStep(tempStep);
        }
      }
      if (canProceed) {
        setCurrentStep(stepNumber);
      }
    }
  };

  const handleSubmit = async (values: any) => {
    let allStepsValid = true;
    const allErrors: Record<number, boolean> = {};
    console.log("Form submission triggered!");
    console.log("Current step:", currentStep);
    console.log("Total steps:", totalSteps);
    console.log("Submitting form with values:", values);

    for (let i = 0; i < totalSteps; i++) {
      const stepConfig = steps[i];
      const validationResult = validateStep(stepConfig, values, schema);

      if (!validationResult.isValid) {
        allErrors[i + 1] = true;
        allStepsValid = false;
      } else {
        allErrors[i + 1] = false;
      }
    }

    console.log("All Errors: ", allErrors);
    setStepErrors(allErrors);

    if (allStepsValid) {
      await onSubmitAction(values);
    } else {
      const firstErrorStep = Object.entries(allErrors).find(
        ([_, hasError]) => hasError
      );
      if (firstErrorStep) {
        setCurrentStep(parseInt(firstErrorStep[0]));
      }
    }
  };

  const renderStep = () => {
    const currentStepConfig = steps[currentStep - 1];

    return (
      <div className={cn("space-y-4", currentStepConfig.gridClassName)}>
        {currentStepConfig.description && (
          <p className="text-sm text-muted-foreground">
            {currentStepConfig.description}
          </p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentStepConfig.fields.map((fieldConfig) => (
            <DynamicField
              key={fieldConfig.fieldName}
              control={form.control}
              config={fieldConfig}
            />
          ))}
        </div>
      </div>
    );
  };

  const currentStepConfig = steps[currentStep - 1];

  return (
    <div className={cn("space-y-3", className)}>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">{currentStepConfig.title}</h2>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>
                Step {currentStep} of {totalSteps}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {Array.from({ length: totalSteps }, (_, i) => {
            const stepNumber = i + 1;
            const isCompleted = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;
            const hasError = stepErrors[stepNumber];

            return (
              <button
                key={i}
                type="button"
                onClick={() => goToStep(stepNumber)}
                className={cn(
                  "flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium transition-colors",
                  isCompleted &&
                    !hasError &&
                    "bg-primary text-primary-foreground",
                  isCurrent &&
                    !hasError &&
                    "bg-primary/10 text-primary border-2 border-primary",
                  hasError && "bg-destructive text-destructive-foreground",
                  !isCompleted &&
                    !isCurrent &&
                    !hasError &&
                    "bg-muted text-muted-foreground",
                  "hover:bg-primary/20 cursor-pointer"
                )}
                title={`Go to ${steps[i].title}`}
              >
                {stepNumber}
              </button>
            );
          })}
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div>{renderStep()}</div>

          <div className="flex justify-between pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center space-x-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </Button>

            {currentStep < totalSteps ? (
              <Button
                type="button"
                onClick={nextStep}
                className="flex items-center space-x-2"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>{submitButtonText}</span>
                )}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
