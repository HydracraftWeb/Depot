/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

export const dynamic = "force-dynamic";

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

async function getMovie(id) {
  if (!API_KEY) {
    return null;
  }

  try {
    const response = await fetch(`${TMDB_BASE_URL}/movie/${id}?api_key=${API_KEY}&language=en-US`, {
      next: { revalidate: 60 * 60 },
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch {
    return null;
  }
}

function getImage(path, size = "w780") {
  return path ? `${IMAGE_BASE_URL}/${size}${path}` : null;
}

export default async function MovieDetail({ params }) {
  const { id } = await params;
  const movie = await getMovie(id);

  if (!movie) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#050507] px-5 text-white">
        <section className="max-w-xl rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 text-center shadow-2xl shadow-black/40">
          <p className="text-sm font-black uppercase tracking-[0.35em] text-amber-300">Depot</p>
          <h1 className="mt-4 text-4xl font-black">This title is between platforms.</h1>
          <p className="mt-4 text-zinc-300">Add a TMDB API key or head back to the Depot home yard to browse the curated experience.</p>
          <Link href="/" className="mt-8 inline-flex rounded-full bg-white px-6 py-3 font-black text-zinc-950 hover:bg-amber-300">
            Back to Depot
          </Link>
        </section>
      </main>
    );
  }

  const backdrop = getImage(movie.backdrop_path, "w1280");
  const poster = getImage(movie.poster_path, "w500");

  return (
    <main className="min-h-screen bg-[#050507] text-white">
      <section className="relative overflow-hidden px-5 py-8 sm:px-8">
        {backdrop ? (
          <img src={backdrop} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-[#050507]/80 to-black/40" />
        <div className="relative mx-auto grid max-w-6xl gap-8 py-12 md:grid-cols-[320px_1fr] md:items-end">
          <img
            src={poster || backdrop || ""}
            alt={`${movie.title} poster`}
            className="aspect-[2/3] w-full max-w-xs rounded-[2rem] border border-white/15 object-cover shadow-2xl shadow-black/60"
          />
          <div className="space-y-5">
            <Link href="/" className="text-sm font-black uppercase tracking-[0.28em] text-amber-300 hover:text-amber-200">← Depot home</Link>
            <h1 className="text-5xl font-black tracking-[-0.06em] sm:text-7xl">{movie.title}</h1>
            <div className="flex flex-wrap gap-3 text-sm font-bold text-zinc-200">
              <span className="text-emerald-300">{Math.round(movie.vote_average * 10)}% Match</span>
              <span>{movie.release_date ? new Date(movie.release_date).getFullYear() : "New"}</span>
              <span className="rounded border border-white/20 px-2 py-0.5">HD</span>
              <span>{movie.runtime ? `${movie.runtime} min` : "Feature"}</span>
            </div>
            <p className="max-w-3xl text-lg leading-8 text-zinc-300">{movie.overview}</p>
            <div className="flex flex-wrap gap-4">
              <Link href={`/watch/${id}`} className="rounded-full bg-white px-8 py-4 font-black text-zinc-950 hover:bg-amber-300">
                ▶ Watch Now
              </Link>
              <button className="rounded-full border border-white/20 bg-white/10 px-8 py-4 font-black text-white hover:border-amber-300 hover:text-amber-200">
                + My Depot List
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
