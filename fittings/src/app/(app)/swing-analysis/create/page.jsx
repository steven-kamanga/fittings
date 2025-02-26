"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import React, { useState } from "react";
import { z } from "zod";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { DateTimePickerForm } from "@/components/ui/date-time-picker";
import { ChevronLeft, ChevronRight, SaveIcon } from "lucide-react";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  appointmentTime: z.date({
    required_error: "A date and time is required.",
  }),
  comments: z.string().optional(),
});

const Page = () => {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const { data: session, status } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      appointmentTime: undefined,
      comments: "",
    },
  });

  async function onSubmit(values) {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const response = await axios.post(
        `${process.env.API_URL}/swing-analysis`,
        {
          userId: session.user.id,
          date: values.appointmentTime.toISOString(),
          comments: values.comments,
        },
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );

      if (response.status === 201) {
        console.log("Swing Analysis Scheduled:", response.data);
        router.push("/swing-analysis");
      } else {
        console.error("Unexpected response status:", response.status);
        setSubmitError("An unexpected error occurred. Please try again.");
      }
    } catch (error) {
      console.error("Error scheduling swing analysis:", error);
      setSubmitError("Failed to schedule swing analysis. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (status === "loading") {
    return (
      <div className={"h-6 w-6"}>
        <LoadingSpinner color={true} />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <div>You are not signed in.</div>;
  }

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <main>
      <Button
        onClick={() => {
          router.back();
        }}
      >
        <ChevronLeft /> Back
      </Button>
      <section className="mx-auto p-4 lg:w-[50%] w-[80%]">
        {session.user?.token}
        <h1 className="text-xl font-bold mb-4">Schedule a Swing Analysis</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {step === 1 && (
              <div>
                <h2 className="text-base mb-4 font-medium">
                  Step 1: Select Appointment Time
                </h2>
                <section className={"px-10"}>
                  <FormField
                    control={form.control}
                    name="appointmentTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Appointment Time
                          <span className={"text-red-500"}>*</span>
                        </FormLabel>
                        <FormControl>
                          <>
                            <DateTimePickerForm {...field} />
                            <FormDescription>
                              Select a date and time for your appointment.
                            </FormDescription>
                          </>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="button" onClick={nextStep} className="mt-4">
                    <p>Next</p>
                    <ChevronRight />
                  </Button>
                </section>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="text-base mb-4 font-medium">
                  Step 2: Add Comments
                </h2>
                <section className={"px-10"}>
                  <FormField
                    control={form.control}
                    name="comments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Comments</FormLabel>
                        <FormControl>
                          <>
                            <Textarea
                              placeholder="Add any comments or questions here"
                              {...field}
                            />
                            <FormDescription>Add Comments</FormDescription>
                          </>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-between mt-4">
                    <Button type="button" onClick={prevStep}>
                      <ChevronLeft />
                      <p>Previous</p>
                    </Button>
                    <Button type="submit">
                      <p>Save</p>
                      <SaveIcon />
                    </Button>
                  </div>
                </section>
              </div>
            )}
          </form>
        </Form>
      </section>
    </main>
  );
};

export default Page;
