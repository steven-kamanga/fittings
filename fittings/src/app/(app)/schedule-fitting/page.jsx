"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Calendar } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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

const Page = () => {
  const router = useRouter();
  const [fittings, setFittings] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [selectedFittingId, setSelectedFittingId] = useState(null);
  const [selectFittingDate, setSelectFittingDate] = useState(null);

  const { data: session, status } = useSession();

  const handleReschedule = (fittingId, prevAppointment) => {
    setIsEditSheetOpen(true);
    setSelectedFittingId(fittingId);
    setSelectFittingDate(prevAppointment);
  };

  useEffect(() => {
    if (status === "authenticated" && session?.accessToken) {
      fetchFittings();
    }
  }, [currentPage, status, session]);

  const fetchFittings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const url =
        session.user.role === "admin"
          ? "/fitting-requests"
          : `/fitting-requests/${session.user.id}`;
      const response = await axios.get(`${process.env.API_URL}${url}`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
        params: {
          page: currentPage,
          limit: 5,
        },
      });
      setFittings(response.data.fittingRequests);
      setTotalPages(response.data.pagination.totalPages);
      setCurrentPage(response.data.pagination.currentPage);
    } catch (err) {
      setError("Failed to fetch fitting requests. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (fittingId, newStatus) => {
    try {
      const response = await axios.patch(
        `${process.env.API_URL}/fitting-request/${fittingId}/${newStatus}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        },
      );

      if (response.status === 200) {
        setFittings(
          fittings.map((fitting) =>
            fitting.id === fittingId
              ? { ...fitting, status: newStatus }
              : fitting,
          ),
        );
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  if (status === "loading") {
    return (
      <div className={"h-6 w-6"}>
        <LoadingSpinner color={true} />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <div>You are not signed in.</div>;
  }

  if (isLoading) return <div>Loading fittings...</div>;
  if (error) return <div>{error}</div>;

  return (
    <main className={"flex flex-col items-center justify-center"}>
      <section className={"w-[90%] flex-col flex space-y-2"}>
        <div className={"font-bold text-base uppercase flex space-x-1"}>
          <p>{session.user.role === "consumer" && "Schedule"}</p>
          <p>Fitting</p>
        </div>
        <section className={"space-y-1"}>
          <div className="w-full flex justify-end">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Calendar size={16} />
                  View Calendar
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="w-full">
                <SheetHeader>
                  <SheetTitle>Fitting Calendar</SheetTitle>
                  <SheetDescription>
                    Calendar view of all scheduled fittings
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-4">
                  <FittingCalendar fittings={fittings} />
                </div>
              </SheetContent>
            </Sheet>
          </div>
          {session.user.role === "consumer" ? (
            <section className={"flex flex-row justify-between"}>
              <div></div>
              <Button
                onClick={() => {
                  router.push("/schedule-fitting/create");
                }}
                className={"m-0 py-0 px-2 pr-3"}
                variant={"default"}
              >
                <Plus />
                Schedule
              </Button>
            </section>
          ) : (
            <></>
          )}

          <div className="w-full border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="uppercase font-medium text-xs border text-gray-500 text-left border-gray-200 p-2">
                    #
                  </th>
                  {session.user.role === "admin" && (
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
                      <td className="border border-gray-200 p-2">{idx + 1}</td>
                      {session.user.role === "admin" && (
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
                        className={`border border-gray-200 p-2 text-center ${getStatusStyles(fitting.status)}`}
                      >
                        {fitting.status}
                      </td>
                      <td className="border border-gray-200 p-2">
                        {fitting.comments}
                      </td>
                      <td className="border-t flex space-x-1 border-gray-200 p-2">
                        {session.user.role === "admin" ? (
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
                                <div className={"flex space-x-1 items-center"}>
                                  <Trash size={15} />
                                  <p>Cancel Fitting</p>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Button
                            onClick={() =>
                              handleReschedule(fitting.id, fitting.date)
                            }
                            disabled={fitting.status === "canceled"}
                            className={"m-0 py-0 px-2"}
                            variant={"outline"}
                          >
                            <Pencil className={"text-red"} size={"20"} />
                            Reschedule
                          </Button>
                        )}
                        {session.user.role === "consumer" && (
                          <Button
                            className={"m-0 bg-red-500 py-0 px-2 pr-3"}
                            variant={"default"}
                            disabled={fitting.status === "canceled"}
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
                      colSpan="5"
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
        />
      </EditSheet>
    </main>
  );
};

export default Page;
