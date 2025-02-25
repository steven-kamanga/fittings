import React from "react";

const Page = () => {
  return (
    <main className={"px-10 flex flex-col justify-center items-center"}>
      <section className={"w-[80%]"}>
        <section>
          <h2 className={"font-bold text-yellow-600 uppercase text-lg"}>
            Getting Started
          </h2>
        </section>
        <section>
          <p className="text-base leading-relaxed text-justify">
            Welcome to your personalized golf club fitting experience. During
            your session, our expert fitters will analyze your swing dynamics,
            body measurements, and playing style to recommend the perfect club
            specifications for you. We'll use state-of-the-art technology to
            measure your swing speed, ball spin, and launch angle. You'll have
            the opportunity to test various club heads, shafts, and grips to
            find the ideal combination that maximizes your performance on the
            course. Whether you're a seasoned pro or a beginner, our goal is to
            enhance your game and boost your confidence with clubs tailored
            specifically to you.
          </p>
        </section>
      </section>
    </main>
  );
};
export default Page;
