"use client";
import { useState } from "react";
import axios from "axios";

interface UseEditProps {
  endpoint: string;
  onSuccess?: (data: any) => void;
  accessToken: string;
  hasId?: boolean;
}

export const useEdit = ({
  endpoint,
  onSuccess,
  accessToken,
  hasId = true,
}: UseEditProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEdit = async (id: string | number, data: any) => {
    setIsLoading(true);
    setError(null);

    const requestUrl = hasId
      ? `${process.env.NEXT_PUBLIC_API_URL}${endpoint}/${id}`
      : `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`;

    try {
      console.log("Request URL: ", requestUrl);
      const response = await axios.put(requestUrl, data, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        onSuccess?.(response.data);
        return response.data;
      }
    } catch (err) {
      console.log("Error: ", err);
      const errorMessage =
        (err as any).response?.data?.message ||
        "An error occurred while updating";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleEdit,
    isLoading,
    error,
    setError,
  };
};
