import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import LoadingSpinner from "@/components/ui/loading-spinner";

const GettingStartedMessage = () => {
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { data: session } = useSession();

  useEffect(() => {
    fetchMessage();
  }, []);

  const fetchMessage = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${process.env.API_URL}/getting-started`,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );
      // Find the active message from the array
      const activeMessage = response.data.gettingStartedMessages.find(
        (msg) => msg.isActive
      );
      setMessage(activeMessage);
    } catch (err) {
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
