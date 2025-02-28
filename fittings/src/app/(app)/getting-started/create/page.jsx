"use client";
import React, { useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import LoadingSpinner from "@/components/ui/loading-spinner";

const CreateGettingStartedMessage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await axios.post(
        `${process.env.API_URL}/getting-started`,
        {
          userId: session.user.id,
          message: message,
        },
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        },
      );

      router.back();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to create message. Please try again.",
      );
      console.error("Error creating message:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="h-6 w-6">
        <LoadingSpinner color={true} />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <div>You are not signed in.</div>;
  }

  return (
    <main className="flex flex-col items-center justify-center p-4">
      <section className="w-full max-w-2xl space-y-4">
        <h1 className="text-2xl font-bold">Create Getting Started Message</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="message" className="block text-sm font-medium">
              Message
            </label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your getting started message..."
              required
              className="min-h-[200px]"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? (
                <LoadingSpinner color={false} />
              ) : (
                "Create Message"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
          </div>
        </form>
      </section>
    </main>
  );
};

export default CreateGettingStartedMessage;
