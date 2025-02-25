"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import LoadingSpinner from "@/components/ui/loading-spinner";
import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  StopCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const Page = () => {
  const router = useRouter();
  const [swingAnalyses, setSwingAnalyses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session?.accessToken) {
      fetchSwingAnalyses();
    }
  }, [currentPage, status, session]);

  const fetchSwingAnalyses = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${process.env.API_URL}/swing-analysis`,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
          params: {
            page: currentPage,
            limit: 5,
          },
        },
      );
      setSwingAnalyses(response.data.data || []);
      setTotalPages(response.data.meta.totalPages || 1);
    } catch (err) {
      setError("Failed to fetch swing analyses. Please try again later.");
      console.error("Error fetching swing analyses:", err);
    } finally {
      setIsLoading(false);
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

  if (isLoading) return <div>Loading swing analysis...</div>;
  if (error) return <div>{error}</div>;

  return (
    <main className={"flex flex-col items-center justify-center"}>
      <section className={"w-[90%]"}>
        <h1 className={"font-bold text-lg"}>Swing Analysis</h1>
        <section className={"space-y-1"}>
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
                      <td className="border border-gray-200 p-2">
                        {new Date(analysis.date).toLocaleString()}
                      </td>
                      <td className="border border-gray-200 p-2">
                        {analysis.status}
                      </td>
                      <td className="border border-gray-200 p-2">
                        {analysis.comments}
                      </td>
                      <td className="border border-gray-200 p-2">
                        <Button className={"m-0 py-0 px-2"} variant={"ghost"}>
                          <Pencil className={"text-red"} size={"20"} />
                          Reschedule
                        </Button>
                        <Button className={"m-0 py-0 px-2"} variant={"ghost"}>
                          <XCircle color={"red"} size={"20"} />
                          <p className={"text-red-500"}>Cancel</p>
                        </Button>
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
    </main>
  );
};

export default Page;
