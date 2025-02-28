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
import EditSheet from "@/components/edit-sheet";
import EditSwingAnalysisForm from "@/components/swing-analysis/swing-analysis";
import DeleteConfirmationModal from "@/components/delete-confirmation";
import { toast } from "sonner";
import { getStatusStyles } from "@/lib/helper";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Page = () => {
  const router = useRouter();
  const [swingAnalyses, setSwingAnalyses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { data: session, status } = useSession();
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [analysisToEdit, setAnalysisToEdit] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [analysisToDelete, setAnalysisToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!analysisToDelete) return;

    setIsDeleting(true);
    try {
      await axios.delete(
        `${process.env.API_URL}/swing-analysis/${analysisToDelete.id}`,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        },
      );

      fetchSwingAnalyses();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to cancel swing analysis",
      );
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setAnalysisToDelete(null);
    }
  };

  const handleStatusChange = async (analysisId, newStatus) => {
    try {
      const response = await axios.patch(
        `${process.env.API_URL}/swing-analysis/${analysisId}/${newStatus}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        },
      );

      if (response.status === 200) {
        setSwingAnalyses(
          swingAnalyses.map((swingAnalyses) =>
            swingAnalyses.id === analysisId
              ? { ...swingAnalyses, status: newStatus }
              : swingAnalyses,
          ),
        );
      }
    } catch (error) {
      console.log("Error updating status:", error);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && session?.accessToken) {
      fetchSwingAnalyses();
    }
  }, [currentPage, status, session]);

  const fetchSwingAnalyses = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const url =
        session.user.role === "admin"
          ? "/swing-analysis"
          : `/swing-analysis/user/${session.user.id}`;
      const response = await axios.get(`${process.env.API_URL}${url}`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
        params: {
          page: currentPage,
          limit: 5,
        },
      });

      const { swingAnalyses, pagination } = response.data;

      console.log("response:", response);

      if (swingAnalyses && pagination) {
        setSwingAnalyses(swingAnalyses);
        setTotalPages(pagination.totalPages);
      } else {
        setSwingAnalyses([]);
        setTotalPages(0);
      }
    } catch (err) {
      setError("Failed to fetch swing analyses. Please try again later.");
      console.error("Error fetching swing analyses:", err);
      setSwingAnalyses([]);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  if (status === "loading") {
    return <></>;
  }

  if (status === "unauthenticated") {
    return <div>You are not signed in.</div>;
  }

  if (isLoading)
    return (
      <div className={"h-6 w-6"}>
        <LoadingSpinner color={true} />
      </div>
    );
  if (error) return <div>{error}</div>;

  return (
    <main className={"flex flex-col items-center justify-center"}>
      <section className={"w-[90%] space-y-2"}>
        <h1 className={"font-bold text-base uppercase"}>Swing Analysis</h1>
        <section className={"space-y-1"}>
          {session.user.role === "admin" ? (
            <></>
          ) : (
            <section className={"flex flex-row justify-between"}>
              <div></div>
              <Button
                onClick={() => {
                  router.push("/swing-analysis/create");
                }}
                className={"m-0 py-0 px-2 pr-3"}
                variant={"default"}
              >
                <Plus />
                Schedule
              </Button>
            </section>
          )}

          {swingAnalyses.length === 0 ? (
            <div className="text-center py-4">
              No swing analyses found. Click 'Schedule' to create a new one.
            </div>
          ) : (
            <div className="w-full border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="uppercase text-xs border text-gray-500 text-left border-gray-200 p-2">
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
                  {swingAnalyses.map((analysis, idx) => (
                    <tr key={analysis.id}>
                      <td className="border border-gray-200 p-2">{idx + 1}</td>
                      {session.user.role === "admin" && (
                        <>
                          <td className="border border-gray-200 p-2">
                            {analysis.user.name}
                          </td>
                          <td className="border border-gray-200 p-2">
                            {analysis.user.email}
                          </td>
                          <td className="border border-gray-200 p-2 text-right">
                            {analysis.user.phone}
                          </td>
                        </>
                      )}
                      <td className="border border-gray-200 p-2">
                        {new Date(analysis.date).toLocaleString()}
                      </td>
                      <td
                        className={`border border-gray-200 p-2 text-left ${getStatusStyles(analysis.status)}`}
                      >
                        {analysis.status}
                      </td>
                      <td className="border border-gray-200 p-2">
                        {analysis.comments}
                      </td>
                      <td className="border border-gray-200 p-2">
                        {session.user.role === "consumer" && (
                          <div className={"flex space-x-1"}>
                            <Button
                              disabled={analysis.status === "canceled"}
                              onClick={() => {
                                setAnalysisToEdit(analysis);
                                setIsEditSheetOpen(true);
                              }}
                              className={"m-0 py-0 px-2"}
                              variant={"outline"}
                            >
                              <Pencil className={"text-red"} size={"20"} />
                              Reschedule
                            </Button>
                            <Button
                              disabled={analysis.status === "canceled"}
                              className={"m-0 bg-red-500 py-0 px-2 pr-3"}
                              variant={"default"}
                              onClick={() => {
                                setAnalysisToDelete(analysis);
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
                          </div>
                        )}
                        {session.user.role === "admin" && (
                          <Select
                            onValueChange={(value) =>
                              handleStatusChange(analysis.id, value)
                            }
                            defaultValue={analysis.status}
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
                                  <p>Schedule Swing Analysis</p>
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
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="bg-gray-100 py-1 px-1 flex justify-end">
                <Button
                  variant={"ghost"}
                  className={"m-0 py-0 px-2"}
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft />
                </Button>
                <Button
                  variant={"ghost"}
                  className={"m-0 py-0 px-2"}
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight />
                </Button>
              </div>
            </div>
          )}
        </section>
      </section>
      {analysisToEdit && (
        <EditSheet
          isOpen={isEditSheetOpen}
          onClose={() => {
            setIsEditSheetOpen(false);
            setAnalysisToEdit(null);
          }}
          title="Reschedule Swing Analysis"
          subtitle={`Originally scheduled for: ${new Date(
            analysisToEdit.date,
          ).toLocaleString()}`}
        >
          <EditSwingAnalysisForm
            analysis={analysisToEdit}
            onClose={() => {
              setIsEditSheetOpen(false);
              setAnalysisToEdit(null);
            }}
            onSuccess={() => {
              fetchSwingAnalyses().then(() => {
                toast.success("Swing analysis updated successfully");
              });
            }}
            accessToken={session.accessToken}
          />
        </EditSheet>
      )}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setAnalysisToDelete(null);
        }}
        onConfirm={handleDelete}
        title="Cancel Swing Analysis"
        description={
          analysisToDelete
            ? `Are you sure you want to cancel your swing analysis scheduled for ${new Date(
                analysisToDelete.date,
              ).toLocaleString()}? This action cannot be undone.`
            : ""
        }
        isLoading={isDeleting}
      />
    </main>
  );
};

export default Page;
