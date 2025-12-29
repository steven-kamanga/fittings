import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import LoadingSpinner from "@/components/ui/loading-spinner";

interface GettingStartedMessage {
  id: string;
  message: string;
  isActive: boolean;
}

interface ApiResponse {
  gettingStartedMessages: GettingStartedMessage[];
}

const GettingStartedMessage = () => {
  const [message, setMessage] = useState<GettingStartedMessage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    fetchMessage();
  }, []);

  const fetchMessage = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get<ApiResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}/getting-started`,
        {
          headers: {
            Authorization: `Bearer ${(session as any)?.accessToken}`,
          },
        }
      );
      // Find the active message from the array
      const activeMessage = response.data.gettingStartedMessages.find(
        (msg: GettingStartedMessage) => msg.isActive
      );
      setMessage(activeMessage || null);
    } catch (err: unknown) {
      setError(
        "Failed to fetch getting started message. Please try again later."
      );
      console.error("Error fetching getting started message:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (!message) {
    return <p>No active getting started message available.</p>;
  }

  return (
    <section className="space-y-4">
      <p className="text-base leading-relaxed text-justify">
        {message.message}
      </p>
    </section>
  );
};

export default GettingStartedMessage;
