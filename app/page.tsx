import Image from "next/image";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1495640452828-3df6795cf69b?auto=format";

export default function Home() {
  return (
    <div className="relative flex min-h-0 flex-1 w-full flex-col">
      <Image
        src={HERO_IMAGE}
        alt="Books on a windowsill in sunset light"
        fill
        priority
        sizes="100vw"
        className="object-cover object-bottom"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-linear-to-r from-black/70 via-black/40 to-black/15"
      />
      <main className="relative z-10 flex flex-1 w-full flex-col items-start justify-center gap-8 px-8 py-12 sm:pl-20 md:pl-28 lg:pl-36">
        <div className="flex w-full max-w-2xl flex-col items-start gap-8">
          <h1 className="max-w-xl text-5xl font-semibold leading-tight tracking-tight text-white sm:text-6xl">
            Pick a book. Connect with others.
          </h1>
          <p className="max-w-lg text-xl leading-8 text-white/80 sm:text-2xl">
            A place to organize your book club and then take it offline.
          </p>
        </div>
      </main>
    </div>
  );
}
