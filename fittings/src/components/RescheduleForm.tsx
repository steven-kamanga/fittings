import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useSession } from "next-auth/react";
import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { DateTimePickerForm } from "@/components/ui/date-time-picker";

interface RescheduleFormProps {
  fittingId: string | null;
  prevTime: string | null;
  onClose: () => void;
  onSuccess?: () => void;
}

const RescheduleForm: React.FC<RescheduleFormProps> = ({ fittingId, prevTime, onClose, onSuccess }) => {
  console.log("RescheduleForm: ", fittingId, prevTime, onClose, onSuccess);
  const { data: session } = useSession();
  const form = useForm({
    defaultValues: {
      appointmentTime: prevTime ? new Date(prevTime) : new Date(),
    },
  });

  const onSubmit = async (data: any) => {
    try {
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/fitting-request/${fittingId}/reschedule`,
        { appointmentTime: data.appointmentTime },
        {
          headers: {
            Authorization: `Bearer ${(session as any)?.accessToken}`,
          },
        }
      );

      console.log("Response: ", response);

      if (response.status === 200) {
        toast.success("Appointment rescheduled successfully");
        onSuccess?.();
        onClose?.();
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Error rescheduling appointment"
      );
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <FormField
            control={form.control}
            name="appointmentTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Appointment Time <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <DateTimePickerForm control={form.control} name="appointmentTime" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="mt-4">
            Reschedule <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default RescheduleForm;
