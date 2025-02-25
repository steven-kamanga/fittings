import Video from "next-video";
import golf from "../../../../videos/golf.mkv?thumbnailTime=0";

export default function Page() {
  return (
    <main className="relative w-full h-screen overflow-hidden">
      <div className="absolute inset-0">
        <Video autoPlay loop muted src={golf} controls={false} />
      </div>
      <section className="absolute bottom-56 left-4 z-10">
        <div className="text-xl backdrop-blur-md p-3 rounded">
          <h1 className="font-bold text-white text-3xl text-left mb-2 drop-shadow-lg">
            Tailored <span className="text-yellow-600">Golf Club</span>{" "}
            Experience
          </h1>
          <p className="text-white text-lg text-left italic">
            Perfectly fitted clubs for your best game yet.
          </p>
        </div>
      </section>
    </main>
  );
}
