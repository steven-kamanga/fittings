"use client";
import React, { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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

const statusColors = {
  submitted: "bg-green-200",
  scheduled: "bg-yellow-200",
  completed: "bg-blue-200",
  canceled: "bg-red-200",
};

const FittingCalendar = ({ fittings }) => {
  const fittingsByMonthAndDay = useMemo(() => {
    const fittingMap = {};

    fittings.forEach((fitting) => {
      if (fitting.date) {
        const fittingDate = new Date(fitting.date);
        const month = months[fittingDate.getMonth()];
        const day = fittingDate.getDate();

        if (!fittingMap[month]) fittingMap[month] = {};
        if (!fittingMap[month][day]) fittingMap[month][day] = [];

        fittingMap[month][day].push(fitting);
      }
    });

    return fittingMap;
  }, [fittings]);

  return (
    <div className="flex h-full border bg-highlight rounded border-outline">
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
                      const fittingsForDay =
                        fittingsByMonthAndDay[month]?.[day + 1] || [];
                      const fittingCount = fittingsForDay.length;

                      return (
                        <td
                          key={`${month}-${day}`}
                          className="border-b text-sm border-r border-solid border-outline h-16 w-72 text-gray-700 flex items-center justify-center"
                        >
                          {fittingCount > 0 && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <div
                                  className={`m-1 w-[270px] h-14 ${
                                    fittingCount === 1
                                      ? statusColors[fittingsForDay[0].status]
                                      : "bg-blue-500"
                                  } rounded text-xs ${
                                    fittingCount === 1
                                      ? "text-gray-700"
                                      : "text-primary-foreground"
                                  } flex flex-col items-center justify-center cursor-pointer`}
                                >
                                  <div className="font-bold">
                                    {fittingCount} Fitting
                                    {fittingCount > 1 ? "s" : ""}
                                  </div>
                                  <div className="text-[10px] mt-1">
                                    {fittingsForDay
                                      .map((fitting) => fitting.user.name)
                                      .join(", ")}
                                  </div>
                                </div>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl bg-secondary max-h-[vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle className="text-md">
                                    Fittings for {month} {day + 1}
                                  </DialogTitle>
                                </DialogHeader>
                                <section className="px-4 rounded-[6px] border bg-highlight border-outline">
                                  <Accordion
                                    type="single"
                                    collapsible
                                    className="w-full"
                                  >
                                    {fittingsForDay.map((fitting, index) => (
                                      <AccordionItem
                                        className="border-none"
                                        key={fitting.id}
                                        value={`item-${index}`}
                                      >
                                        <AccordionTrigger>
                                          Customer: {fitting.user.name}
                                        </AccordionTrigger>
                                        <AccordionContent>
                                          <div className="rounded grid grid-cols-2 border-outline rounded border p-3">
                                            <p>
                                              <strong>Status:</strong>{" "}
                                              {fitting.status}
                                            </p>
                                            <p>
                                              <strong>Email:</strong>{" "}
                                              {fitting.user.email}
                                            </p>
                                            <p>
                                              <strong>Phone:</strong>{" "}
                                              {fitting.user.phone}
                                            </p>
                                            <p>
                                              <strong>Date:</strong>{" "}
                                              {new Date(
                                                fitting.date,
                                              ).toLocaleString()}
                                            </p>
                                            <p>
                                              <strong>Comments:</strong>{" "}
                                              {fitting.comments}
                                            </p>
                                          </div>
                                        </AccordionContent>
                                      </AccordionItem>
                                    ))}
                                  </Accordion>
                                </section>
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

export default FittingCalendar;
