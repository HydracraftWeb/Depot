import Link from "next/link";

export const dynamic = "force-dynamic";

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

async function getMovie(id) {
  if (!API_KEY) {
    return { title: "Depot Feature" };
  }

  try {
    const response = await fetch(`${TMDB_BASE_URL}/movie/${id}?api_key=${API_KEY}&language=en-US`, {
      next: { revalidate: 60 * 60 },
    });

    if (!response.ok) {
      return { title: "Depot Feature" };
    }

    return response.json();
  } catch {
    return { title: "Depot Feature" };
  }
}

export default async function WatchMovie({ params }) {
  const { id } = await params;
  const movie = await getMovie(id);
  const embedUrl = `https://vsembed.ru/embed/movie/${id}`;

  return (
    <main className="min-h-screen bg-[#050507] px-5 py-6 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link href={`/movie/${id}`} className="text-sm font-black uppercase tracking-[0.28em] text-amber-300 hover:text-amber-200">← Details</Link>
            <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] sm:text-5xl">{movie.title}</h1>
          </div>
          <Link href="/" className="rounded-full border border-white/15 px-5 py-3 font-black text-zinc-200 hover:border-amber-300 hover:text-amber-200">
            Depot Home
          </Link>
        </div>
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-black shadow-2xl shadow-black/60">
          <iframe
            title={`Watch ${movie.title}`}
            className="h-[72vh] w-full border-none"
            allowFullScreen
            src={embedUrl}
          />
        </div>
      </div>
    </main>
  );
}
