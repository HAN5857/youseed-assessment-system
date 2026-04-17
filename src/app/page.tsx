import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main className="kid-bg relative flex min-h-screen flex-col items-center justify-center px-6 py-12 text-center">
      <div className="relative z-10 flex flex-col items-center">
        {/* Youseed logo — same bounce motion as the previous mascot */}
        <div className="kid-bounce">
          <Image
            src="/brand/youseed-logo.png"
            alt="YouSeed"
            width={200}
            height={200}
            priority
            className="h-auto w-36 object-contain drop-shadow-lg sm:w-44"
          />
        </div>

        {/* Biggest, most-emphasized banner — now the primary visual anchor */}
        <div className="relative mt-4">
          <span
            aria-hidden
            className="absolute -left-5 -top-3 text-3xl kid-sparkle"
          >✨</span>
          <span
            aria-hidden
            className="absolute -right-6 -bottom-3 text-3xl kid-sparkle"
            style={{ animationDelay: "0.4s" }}
          >🌟</span>
          <h1 className="rounded-full bg-gradient-to-r from-pink-500 via-orange-500 to-amber-500 px-6 py-3 text-3xl font-black uppercase tracking-wider text-white shadow-2xl sm:px-10 sm:py-4 sm:text-5xl">
            🎉 Free Language Assessment
          </h1>
        </div>

        <p className="mt-6 text-balance text-3xl font-black tracking-tight text-slate-800 sm:text-4xl">
          Let&apos;s find your{" "}
          <span className="bg-gradient-to-r from-pink-500 via-orange-500 to-amber-500 bg-clip-text text-transparent">
            superpower!
          </span>
        </p>
        <p className="mt-4 max-w-xl text-balance text-lg font-semibold text-slate-700 sm:text-xl">
          Play through fun questions and discover your language level! ⭐
        </p>

        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
          <Link href="/test" className="kid-btn text-lg">
            🚀 Start my test
          </Link>
          <Link
            href="/admin/login"
            className="inline-flex items-center justify-center rounded-full border-2 border-slate-300 bg-white/80 px-6 py-3 text-sm font-bold text-slate-600 hover:bg-white"
          >
            Tutor sign in
          </Link>
        </div>

        <p className="mt-10 text-base font-semibold text-slate-600 sm:text-lg">
          Don&apos;t have a passkey? Ask your tutor! 💖
        </p>
      </div>
    </main>
  );
}
