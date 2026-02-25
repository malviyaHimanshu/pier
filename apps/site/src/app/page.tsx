import { geistMono, jetbrains, spaceGrotesk } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen">
      <section className="h-screen relative py-40">
        {/* <Image 
          src={'/background.png'}
          alt=""
          fill
          className="object-cover h-full w-full mask-b-from-black"
        /> */}
        <div className="absolute inset-0 bg-linear-to-b from-emerald-950 via-emerald-700 to-white" />

        <div className="relative w-full max-w-xl mx-auto text-white flex flex-col items-start">
          <div className="flex items-center gap-3">
            <Image 
              src={'/logo.png'}
              alt=""
              height={300}
              width={300}
              className="object-contain h-5 w-auto pointer-events-none select-none"
            />
            <h1 className={cn("text-xl font-medium")}>Pier</h1>
          </div>

          <h1 className={cn("text-4xl mt-10 font-medium")}>
            {/* An in-browser local terminal bridge */}
            Your app, terminal and project context inside the same tab
          </h1>

          <p className="mt-7 font-medium text-white/80">{"Pier brings a real terminal panel into localhost pages and routes each session to the correct repo based on hostname. It is built for local-first product development and agent-heavy workflows."}</p>
        </div>

        <div className="h-80 w-auto relative mt-32">
          <Image 
            src={'/product.png'}
            alt=""
            height={1137}
            width={1736}
            className="object-contain w-full max-w-6xl h-auto mx-auto"
          />
        </div>
      </section>

      <section>

      </section>
    </main>
  );
}
