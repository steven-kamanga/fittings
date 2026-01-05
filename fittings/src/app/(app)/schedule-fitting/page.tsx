"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import LoadingSpinner from "@/components/ui/loading-spinner";
import {
  BookA,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Pencil,
  Plus,
  Trash,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getStatusStyles } from "@/lib/helper";
import EditSheet from "@/components/edit-sheet";
import RescheduleForm from "@/components/RescheduleForm";
import FittingCalendar from "@/components/fitting-activity-calendar";
import Link from "next/link";
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/modal";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

interface Fitting {
  id: string;
  date: string;
  status: "submitted" | "scheduled" | "completed" | "canceled";
  comments: string;
  user: User;
}

interface Pagination {
  totalPages: number;
  currentPage: number;
}

interface FittingResponse {
  fittingRequests: Fitting[];
  pagination: Pagination;
}

const Page = () => {
  const router = useRouter();
  const [fittings, setFittings] = useState<Fitting[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [selectedFittingId, setSelectedFittingId] = useState<string | null>(
    null
  );
  const [selectFittingDate, setSelectFittingDate] = useState<string | null>(
    null
  );
  const [viewMode, setViewMode] = useState<"table" | "calendar">("table");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [fittingToCancel, setFittingToCancel] = useState<Fitting | null>(null);
  const [isCanceling, setIsCanceling] = useState(false);

  const { data: session, status } = useSession();

  const handleReschedule = (fittingId: string, prevAppointment: string) => {
    setIsEditSheetOpen(true);
    setSelectedFittingId(fittingId);
    setSelectFittingDate(prevAppointment);
  };

  const handleCancelFitting = async () => {
    if (!fittingToCancel) return;

    setIsCanceling(true);
    try {
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/fitting-request/${fittingToCancel.id}/canceled`,
        {},
        {
          headers: {
            Authorization: `Bearer ${(session as any)?.accessToken}`,
          },
        }
      );

      if (response.status === 200) {
        setFittings(
          fittings.map((fitting) =>
            fitting.id === fittingToCancel.id
              ? { ...fitting, status: "canceled" }
              : fitting
          )
        );
        toast.success("Fitting canceled successfully");
      }
    } catch (error: unknown) {
      toast.error("Failed to cancel fitting. Please try again later.");
      console.error("Error canceling fitting:", error);
    } finally {
      setIsCanceling(false);
      setIsDeleteModalOpen(false);
      setFittingToCancel(null);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && (session as any)?.accessToken) {
      fetchFittings();
    }
  }, [currentPage, status, session]);

  const fetchFittings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const url =
        (session?.user as any)?.role === "admin"
          ? "/fitting-requests"
          : `/fitting-requests/${(session?.user as any)?.id}`;
      const response = await axios.get<FittingResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}${url}`,
        {
          headers: {
            Authorization: `Bearer ${(session as any)?.accessToken}`,
          },
          params: {
            page: currentPage,
            limit: 5,
          },
        }
      );
      setFittings(response.data.fittingRequests as Fitting[]);
      setTotalPages(response.data.pagination.totalPages);
      setCurrentPage(response.data.pagination.currentPage);
    } catch (err: unknown) {
      setError("Failed to fetch fitting requests. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (fittingId: string, newStatus: string) => {
    try {
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/fitting-request/${fittingId}/${newStatus}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${(session as any)?.accessToken}`,
          },
        }
      );

      if (response.status === 200) {
        setFittings(
          fittings.map((fitting) =>
            fitting.id === fittingId
              ? { ...fitting, status: newStatus as Fitting["status"] }
              : fitting
          )
        );
      }
    } catch (error: unknown) {
      console.error("Error updating status:", error);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  if (status === "loading" || isLoading) {
    return <div className={""}></div>;
  }

  if (status === "unauthenticated") {
    return <div>You are not signed in.</div>;
  }

  if (error) return <div>{error}</div>;

  return (
    <main className={"flex flex-col items-center justify-center"}>
      <section className={"w-[90%] flex-col flex space-y-2"}>
        <div className={"font-bold text-base uppercase flex space-x-1"}>
          <p>{(session?.user as any)?.role === "consumer" && "Schedule"}</p>
          <p>Fitting</p>
        </div>
        <section className={"space-y-1"}>
          <div className={"flex flex-row justify-between"}>
            <div className="flex space-x-2">
              <Button
                variant={viewMode === "table" ? "default" : "outline"}
                onClick={() => setViewMode("table")}
                className="m-0 py-0 px-3"
              >
                Table View
              </Button>
              <Button
                variant={viewMode === "calendar" ? "default" : "outline"}
                onClick={() => setViewMode("calendar")}
                className="m-0 py-0 px-3"
              >
                Calendar View
              </Button>
            </div>
            {(session?.user as any)?.role === "consumer" && (
              <Link href="/schedule-fitting/create">
                <Button className={"m-0 py-0 px-2 pr-3"} variant={"default"}>
                  <Plus />
                  Schedule
                </Button>
              </Link>
            )}
          </div>

          {viewMode === "calendar" ? (
            <div className="w-full h-[calc(100vh-200px)]">
              <FittingCalendar fittings={fittings} />
            </div>
          ) : (
            <>
              <div className="w-full border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="uppercase font-medium text-xs border text-gray-500 text-left border-gray-200 p-2">
                        #
                      </th>
                      {session?.user.role === "admin" && (
                        <>
                          <th className="uppercase text-xs border text-gray-500 text-left border-gray-200 p-2">
                            Customer Name
                          </th>
                          <th className="uppercase text-xs border text-gray-500 text-left border-gray-200 p-2">
                            Email
                          </th>
                          <th className="uppercase text-xs border text-gray-500 text-left border-gray-200 p-2">
                            Phone
                          </th>
                        </>
                      )}
                      <th className="uppercase text-xs border text-gray-500 text-left border-gray-200 p-2">
                        Date
                      </th>
                      <th className="uppercase text-xs border text-gray-500 text-left border-gray-200 p-2">
                        Status
                      </th>
                      <th className="uppercase text-xs border text-gray-500 text-left border-gray-200 p-2">
                        Comments
                      </th>
                      <th className="uppercase w-56 text-xs border text-gray-500 text-left border-gray-200 p-2">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {fittings.length > 0 ? (
                      fittings.map((fitting, idx) => (
                        <tr key={fitting.id}>
                          <td className="border border-gray-200 p-2">
                            {idx + 1}
                          </td>
                          {(session?.user as any)?.role === "admin" && (
                            <>
                              <td className="border border-gray-200 p-2">
                                {fitting.user.name}
                              </td>
                              <td className="border border-gray-200 p-2">
                                {fitting.user.email}
                              </td>
                              <td className="border border-gray-200 p-2 text-right">
                                {fitting.user.phone}
                              </td>
                            </>
                          )}
                          <td className="border border-gray-200 p-2">
                            {new Date(fitting.date).toLocaleString()}
                          </td>
                          <td
                            className={`border border-gray-200 p-2 text-center ${getStatusStyles(
                              fitting.status
                            )}`}
                          >
                            {fitting.status}
                          </td>
                          <td className="border border-gray-200 p-2">
                            {fitting.comments}
                          </td>
                          <td className="border-t flex space-x-1 border-gray-200 p-2">
                            {(session?.user as any)?.role === "admin" ? (
                              <Select
                                onValueChange={(value) =>
                                  handleStatusChange(fitting.id, value)
                                }
                                defaultValue={fitting.status}
                              >
                                <SelectTrigger className="w-fit">
                                  <SelectValue placeholder="Update status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="submitted">
                                    <div
                                      className={
                                        "flex space-x-1 font-medium text-green-600 items-center"
                                      }
                                    >
                                      <BookA size={19} />
                                      <p>Acknowledge Request</p>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="scheduled">
                                    <div
                                      className={
                                        "flex font-medium text-amber-700 space-x-1 items-center"
                                      }
                                    >
                                      <CalendarCheck size={18} />
                                      <p>Schedule Fitting</p>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="completed">
                                    <div
                                      className={
                                        "flex space-x-1 font-medium text-blue-700 items-center"
                                      }
                                    >
                                      <CircleCheck size={18} />
                                      <p>Fitting Completed</p>
                                    </div>
                                  </SelectItem>
                                  <SelectItem
                                    className={"text-red-500 font-medium"}
                                    value="canceled"
                                  >
                                    <div
                                      className={"flex space-x-1 items-center"}
                                    >
                                      <Trash size={15} />
                                      <p>Cancel Fitting</p>
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <>
                                <Button
                                  onClick={() =>
                                    handleReschedule(fitting.id, fitting.date)
                                  }
                                  className={"m-0 py-0 px-2"}
                                  variant={"outline"}
                                >
                                  <Pencil className={"text-red"} size={"20"} />
                                  Reschedule
                                </Button>
                              </>
                            )}
                            {(session?.user as any)?.role === "consumer" && (
                              <Button
                                className={"m-0 bg-red-500 py-0 px-2 pr-3"}
                                variant={"default"}
                                disabled={fitting.status === "canceled"}
                                onClick={() => {
                                  setFittingToCancel(fitting);
                                  setIsDeleteModalOpen(true);
                                }}
                              >
                                <XCircle
                                  color={"white"}
                                  className={"px-0 mx-0"}
                                  size={"20"}
                                />
                                <p className={"text-white"}>Cancel</p>
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className="border border-gray-200 p-2 text-center"
                        >
                          No fitting requests found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                <div className="bg-gray-100 py-1 px-1 flex justify-end">
                  <Button
                    variant={"ghost"}
                    className={"m-0 py-0 px-2"}
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || totalPages === 0}
                  >
                    <ChevronLeft />
                  </Button>
                  <Button
                    variant={"ghost"}
                    className={"m-0 py-0 px-2"}
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || totalPages === 0}
                  >
                    <ChevronRight />
                  </Button>
                </div>
              </div>
            </>
          )}
        </section>
      </section>
      <EditSheet
        isOpen={isEditSheetOpen}
        onClose={() => setIsEditSheetOpen(false)}
        title="Reschedule Fitting"
        subtitle="Select a new date and time for the fitting"
      >
        <RescheduleForm
          fittingId={selectedFittingId}
          prevTime={selectFittingDate}
          onClose={() => setIsEditSheetOpen(false)}
          onSuccess={() => {
            fetchFittings();
            setIsEditSheetOpen(false);
          }}
        />
      </EditSheet>
      <Modal open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Cancel Fitting</ModalTitle>
            <ModalDescription>
              {fittingToCancel
                ? `Are you sure you want to cancel your fitting scheduled for ${new Date(
                    fittingToCancel.date
                  ).toLocaleString()}? You'll have to reschedule for another review.`
                : ""}
            </ModalDescription>
          </ModalHeader>
          <ModalFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setFittingToCancel(null);
              }}
              disabled={isCanceling}
            >
              No, Keep It
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelFitting}
              disabled={isCanceling}
            >
              {isCanceling ? "Canceling..." : "Yes, Cancel Fitting"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </main>
  );
};

export default Page;
