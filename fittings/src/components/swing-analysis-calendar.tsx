"use client";
import React, { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BidirectionalScroll } from "@/components/bi-directional-scroll";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

interface User {
  name: string;
  email: string;
  phone: string;
}

interface SwingAnalysis {
  id: string;
  date: string;
  status: "submitted" | "scheduled" | "completed" | "canceled";
  comments: string;
  user: User;
}

interface SwingAnalysisCalendarProps {
  swingAnalyses: SwingAnalysis[];
}

const statusColors: Record<SwingAnalysis["status"], string> = {
  submitted: "bg-green-200",
  scheduled: "bg-yellow-200",
  completed: "bg-blue-200",
  canceled: "bg-red-200",
};

const SwingAnalysisCalendar: React.FC<SwingAnalysisCalendarProps> = ({
  swingAnalyses,
}) => {
  const analysesByMonthAndDay = useMemo(() => {
    const analysisMap: Record<string, Record<number, SwingAnalysis[]>> = {};

    swingAnalyses.forEach((analysis) => {
      if (analysis.date) {
        const analysisDate = new Date(analysis.date);
        const month = months[analysisDate.getMonth()];
        const day = analysisDate.getDate();

        if (!analysisMap[month]) analysisMap[month] = {};
        if (!analysisMap[month][day]) analysisMap[month][day] = [];

        analysisMap[month][day].push(analysis);
      }
    });

    return analysisMap;
  }, [swingAnalyses]);

  return (
    <div className="flex h-full border bg-highlight rounded border-outline max-w-[calc(100vw-300px)]">
      <BidirectionalScroll width="100%">
        <div className="flex">
          <aside className="sticky left-0 z-20 bg-highlight rounded-l">
            <div className="h-14 w-20 border-b border-r border-solid border-outline"></div>
            {[...Array(31)].map((_, i) => (
              <div
                key={i}
                className="w-20 text-sm h-16 border-b border-r border-solid border-outline font-semibold text-heading-text flex items-center justify-center"
              >
                {`Day ${i + 1}`}
              </div>
            ))}
          </aside>
          <section className="overflow-x-auto">
            <table className="border-collapse">
              <thead className="sticky top-0 z-10">
                <tr className="flex">
                  {months.map((month) => (
                    <th
                      key={month}
                      className="w-72 text-heading-text font-semibold h-14 border-b border-r border-solid border-outline flex items-center justify-center"
                    >
                      {month}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...Array(31)].map((_, day) => (
                  <tr key={day} className="flex">
                    {months.map((month) => {
                      const analysesForDay =
                        analysesByMonthAndDay[month]?.[day + 1] || [];
                      const analysisCount = analysesForDay.length;

                      return (
                        <td
                          key={`${month}-${day}`}
                          className="border-b text-sm border-r border-solid border-outline h-16 w-72 text-gray-700 flex items-center justify-center"
                        >
                          {analysisCount > 0 && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <div
                                  className={`m-1 w-[270px] h-14 ${
                                    analysisCount === 1
                                      ? statusColors[analysesForDay[0].status]
                                      : "bg-blue-500"
                                  } rounded text-xs ${
                                    analysisCount === 1
                                      ? "text-gray-700"
                                      : "text-primary-foreground"
                                  } flex flex-col items-center justify-center cursor-pointer`}
                                >
                                  <div className="font-bold">
                                    {analysisCount} Swing Analysis
                                    {analysisCount > 1 ? " Sessions" : ""}
                                  </div>
                                  <div className="text-[10px] mt-1">
                                    {analysesForDay
                                      .map((analysis) => analysis.user.name)
                                      .join(", ")}
                                  </div>
                                </div>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
                                <DialogHeader className="border-b pb-4">
                                  <DialogTitle className="text-xl font-semibold">
                                    Swing Analysis for {month} {day + 1}
                                  </DialogTitle>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {analysisCount} session
                                    {analysisCount > 1 ? "s" : ""} scheduled for
                                    this day
                                  </p>
                                </DialogHeader>
                                <div className="flex-1 overflow-y-auto py-4 space-y-3">
                                  {analysesForDay.map((analysis, index) => (
                                    <div
                                      key={analysis.id}
                                      className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                                    >
                                      <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-semibold text-lg">
                                          {analysis.user.name}
                                        </h3>
                                        <span
                                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                                            analysis.status === "submitted"
                                              ? "bg-green-100 text-green-700"
                                              : analysis.status === "scheduled"
                                              ? "bg-yellow-100 text-yellow-700"
                                              : analysis.status === "completed"
                                              ? "bg-blue-100 text-blue-700"
                                              : "bg-red-100 text-red-700"
                                          }`}
                                        >
                                          {analysis.status.toUpperCase()}
                                        </span>
                                      </div>
                                      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                                        <div className="flex flex-col">
                                          <span className="text-muted-foreground text-xs mb-1">
                                            Email
                                          </span>
                                          <span className="font-medium">
                                            {analysis.user.email}
                                          </span>
                                        </div>
                                        <div className="flex flex-col">
                                          <span className="text-muted-foreground text-xs mb-1">
                                            Phone
                                          </span>
                                          <span className="font-medium">
                                            {analysis.user.phone}
                                          </span>
                                        </div>
                                        <div className="flex flex-col">
                                          <span className="text-muted-foreground text-xs mb-1">
                                            Date & Time
                                          </span>
                                          <span className="font-medium">
                                            {new Date(
                                              analysis.date
                                            ).toLocaleString()}
                                          </span>
                                        </div>
                                        <div className="flex flex-col col-span-2">
                                          <span className="text-muted-foreground text-xs mb-1">
                                            Comments
                                          </span>
                                          <span className="font-medium">
                                            {analysis.comments || "No comments"}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      </BidirectionalScroll>
    </div>
  );
};

export default SwingAnalysisCalendar;
