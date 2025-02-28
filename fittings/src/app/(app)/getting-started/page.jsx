"use client";
import React from "react";
import { useSession } from "next-auth/react";
import LoadingSpinner from "@/components/ui/loading-spinner";
import GettingStartedMessage from "@/components/getting-started-message";
import SetGettingStartedMessage from "@/components/set-getting-started-message";

const Page = () => {
  const { data: session, status } = useSession();
  if (status === "loading") {
    return <div></div>;
  }

  if (status === "unauthenticated") {
    return <div>You are not signed in.</div>;
  }
  return (
    <main className={"px-10 flex flex-col justify-center items-center"}>
      <section className={"w-[80%]"}>
        <section>
          <h2 className={"font-bold text-yellow-600 uppercase text-lg"}>
            Getting Started
          </h2>
        </section>
        {session.user?.role.toLowerCase() === "consumer" ? (
          <GettingStartedMessage />
        ) : (
          <SetGettingStartedMessage />
        )}
      </section>
    </main>
  );
};
export default Page;
