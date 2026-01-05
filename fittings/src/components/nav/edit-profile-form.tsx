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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EditProfileForm = ({
  user,
  onClose,
  onSuccess,
  accessToken,
}: {
  user?: any;
  onClose: () => void;
  onSuccess?: () => void;
  accessToken: string;
}) => {
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
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
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

  const onSubmit = async (e: any) => {
    e.preventDefault();
    try {
      await handleEdit("", formData);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (isFetching) {
    return <div className="flex h-32 items-center justify-center"></div>;
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
        <Select
          value={formData.golf_club_size}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, golf_club_size: value }))
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select your golf club size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="standard">Standard (5'7" - 6'1")</SelectItem>
            <SelectItem value="midsize">Midsize (+0.25")</SelectItem>
            <SelectItem value="oversize">Oversize (+0.5")</SelectItem>
            <SelectItem value="jumbo">Jumbo (+0.75")</SelectItem>
            <SelectItem value="undersize">Undersize (-0.25")</SelectItem>
            <SelectItem value="junior">Junior (Under 5'7")</SelectItem>
            <SelectItem value="tall">Tall (6'1" - 6'4")</SelectItem>
            <SelectItem value="extra_tall">Extra Tall (Over 6'4")</SelectItem>
          </SelectContent>
        </Select>
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
