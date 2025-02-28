"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useEdit } from "@/hooks/use-edit";
import { Textarea } from "./ui/textarea";

const EditGettingStartedForm = ({
  message,
  onClose,
  onSuccess,
  accessToken,
}) => {
  const [formData, setFormData] = useState({
    message: message.message,
    isActive: message.isActive,
  });

  const { handleEdit, isLoading, error } = useEdit({
    endpoint: "/getting-started",
    onSuccess: () => {
      onSuccess?.();
      onClose();
    },
    accessToken,
  });

  const onSubmit = async (e) => {
    e.preventDefault();
    await handleEdit(message.id, formData);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          value={formData.message}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, message: e.target.value }))
          }
          placeholder="Enter message"
          required
        />
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) =>
            setFormData((prev) => ({ ...prev, isActive: checked }))
          }
        />
        <Label htmlFor="isActive">Active</Label>
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

export default EditGettingStartedForm;
