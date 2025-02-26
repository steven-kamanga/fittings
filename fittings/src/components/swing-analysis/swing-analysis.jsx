"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEdit } from "@/hooks/use-edit";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";

const EditSwingAnalysisForm = ({
  analysis,
  onClose,
  onSuccess,
  accessToken,
}) => {
  const [formData, setFormData] = useState({
    date: format(new Date(analysis.date), "yyyy-MM-dd'T'HH:mm"),
    status: analysis.status,
    comments: analysis.comments || "",
  });

  const { handleEdit, isLoading, error } = useEdit({
    endpoint: "/swing-analysis",
    onSuccess: () => {
      toast.success("Swing analysis updated successfully");
      onSuccess?.();
      onClose();
    },
    accessToken,
  });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await handleEdit(analysis.id, {
        ...formData,
        date: new Date(formData.date).toISOString(),
      });
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="date">Date and Time</Label>
        <Input
          id="date"
          type="datetime-local"
          value={formData.date}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, date: e.target.value }))
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="comments">Comments</Label>
        <Textarea
          id="comments"
          value={formData.comments}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, comments: e.target.value }))
          }
          placeholder="Add any comments about the swing analysis"
          rows={4}
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

export default EditSwingAnalysisForm;
