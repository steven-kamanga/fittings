"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEdit } from "@/hooks/use-edit";
import { toast } from "sonner";
import axios from "axios";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Textarea } from "../ui/textarea";

const EditProfileForm = ({ user, onClose, onSuccess, accessToken }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    golf_club_size: "",
  });
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await axios.get(`${process.env.API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setFormData({
          name: response.data.name || "",
          phone: response.data.phone || "",
          address: response.data.address || "",
          golf_club_size: response.data.golf_club_size || "",
        });
      } catch (error) {
        toast.error("Failed to fetch user details");
        console.error("Error fetching user details:", error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchUserDetails();
  }, [accessToken]);

  const { handleEdit, isLoading, error } = useEdit({
    endpoint: "/auth/users/me",
    onSuccess: () => {
      toast.success("Profile updated successfully");
      onSuccess?.();
      onClose();
    },
    accessToken,
  });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await handleEdit("", formData);
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (isFetching) {
    return (
      <div className="flex h-32 items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          placeholder="Enter your name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, phone: e.target.value }))
          }
          placeholder="Enter your phone number"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, address: e.target.value }))
          }
          placeholder="Enter your address"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="golf_club_size">Golf Club Size</Label>
        <Input
          id="golf_club_size"
          type="number"
          value={formData.golf_club_size}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, golf_club_size: e.target.value }))
          }
          placeholder="Enter your golf club size"
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
};

export default EditProfileForm;
