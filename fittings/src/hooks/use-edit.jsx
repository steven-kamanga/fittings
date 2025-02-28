"use client";
import { useState } from "react";
import axios from "axios";

export const useEdit = ({ endpoint, onSuccess, accessToken, hasId = true }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleEdit = async (id, data) => {
    setIsLoading(true);
    setError(null);

    const requestUrl = hasId
      ? `${process.env.API_URL}${endpoint}/${id}`
      : `${process.env.API_URL}${endpoint}`;

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
        err.response?.data?.message || "An error occurred while updating";
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
