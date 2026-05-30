/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

export const dynamic = "force-dynamic";

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

const emptySections = {
  popular: [],
  trending: [],
  topRated: [],
  action: [],
  comedy: [],
  family: [],
};

const defaultHero = {
  title: "Your next obsession boards here",
  overview:
    "Connect a TMDB API key to load live movies, trending rows, and personalized discovery lanes in the Depot experience.",
  id: null,
  poster_path: null,
  backdrop_path: null,
};

async function getMovies(endpoint) {
  if (!API_KEY) {
    return [];
  }

  try {
    const response = await fetch(`${TMDB_BASE_URL}${endpoint}${endpoint.includes("?") ? "&" : "?"}api_key=${API_KEY}`, {
      next: { revalidate: 60 * 60 },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.results?.filter((movie) => movie.poster_path || movie.backdrop_path).slice(0, 14) ?? [];
  } catch {
    return [];
  }
}

function getImage(path, size = "w780") {
  return path ? `${IMAGE_BASE_URL}/${size}${path}` : null;
}

function formatYear(date) {
  return date ? new Date(date).getFullYear() : "New";
}

function MovieCard({ movie, rank }) {
  const image = getImage(movie.poster_path, "w500") || getImage(movie.backdrop_path, "w780");
  const card = (
    <article className="group movie-card min-w-[168px] max-w-[168px] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] shadow-2xl shadow-black/30 transition duration-300 hover:-translate-y-2 hover:border-amber-300/60 hover:bg-white/[0.1] sm:min-w-[210px] sm:max-w-[210px]">
      <div className="relative aspect-[2/3] overflow-hidden bg-[radial-gradient(circle_at_top,#f7c94833,transparent_35%),linear-gradient(145deg,#231018,#09090f)]">
        {image ? (
          <img
            src={image}
            alt={`${movie.title} poster`}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full flex-col justify-between p-5">
            <span className="w-fit rounded-full bg-amber-300 px-3 py-1 text-xs font-black uppercase tracking-[0.24em] text-zinc-950">
              Depot
            </span>
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-amber-200/80">Depot Pick</p>
              <h3 className="mt-2 text-2xl font-black leading-none text-white">{movie.title}</h3>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent opacity-80" />
        {rank ? (
          <div className="absolute left-3 top-3 rounded-full border border-white/20 bg-black/70 px-3 py-1 text-sm font-black text-white backdrop-blur">
            #{rank}
          </div>
        ) : null}
      </div>
      <div className="space-y-2 p-4">
        <h3 className="line-clamp-1 text-base font-bold text-white">{movie.title}</h3>
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
          <span className="text-emerald-300">{Math.round((movie.vote_average ?? 8.2) * 10)}% Match</span>
          <span>{formatYear(movie.release_date)}</span>
          <span className="rounded border border-white/20 px-1.5 py-0.5 text-[10px]">HD</span>
        </div>
        <p className="line-clamp-2 text-sm text-zinc-400">{movie.overview}</p>
      </div>
    </article>
  );

  return (
    <Link href={`/movie/${movie.id}`} aria-label={`Open ${movie.title}`}>
      {card}
    </Link>
  );
}

function MovieRow({ title, eyebrow, movies, ranked = false }) {
  if (!movies?.length) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3 px-1">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.35em] text-amber-300/80">{eyebrow}</p>
          <h2 className="mt-1 text-2xl font-black text-white sm:text-3xl">{title}</h2>
        </div>
        <button className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-zinc-200 transition hover:border-amber-300 hover:text-amber-200">
          View all
        </button>
      </div>
      <div className="depot-scroll flex gap-4 overflow-x-auto pb-5 pt-2">
        {movies.map((movie, index) => (
          <MovieCard key={`${title}-${movie.id}`} movie={movie} rank={ranked ? index + 1 : undefined} />
        ))}
      </div>
    </section>
  );
}

export default async function Home() {
  const [popular, trending, topRated, action, comedy, family] = await Promise.all([
    getMovies("/movie/popular?language=en-US&page=1"),
    getMovies("/trending/movie/week?language=en-US"),
    getMovies("/movie/top_rated?language=en-US&page=1"),
    getMovies("/discover/movie?with_genres=28&sort_by=popularity.desc&language=en-US&page=1"),
    getMovies("/discover/movie?with_genres=35&sort_by=popularity.desc&language=en-US&page=1"),
    getMovies("/discover/movie?with_genres=10751&sort_by=popularity.desc&language=en-US&page=1"),
  ]);

  const sections = {
    popular: popular.length ? popular : emptySections.popular,
    trending: trending.length ? trending : emptySections.trending,
    topRated: topRated.length ? topRated : emptySections.topRated,
    action: action.length ? action : emptySections.action,
    comedy: comedy.length ? comedy : emptySections.comedy,
    family: family.length ? family : emptySections.family,
  };

  const hero = sections.trending[0] ?? sections.popular[0] ?? defaultHero;
  const heroImage = getImage(hero.backdrop_path, "w1280") || getImage(hero.poster_path, "w780");

  return (
    <main className="min-h-screen overflow-hidden bg-[#050507] text-white">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,#f5b31b2b,transparent_35%),radial-gradient(circle_at_80%_10%,#e5091430,transparent_30%),linear-gradient(180deg,#101014,#050507_45%)]" />

      <nav className="sticky top-0 z-30 border-b border-white/10 bg-black/55 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label="Depot home">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-amber-300 via-orange-500 to-red-600 font-black text-zinc-950 shadow-lg shadow-red-950/40">
              D
            </div>
            <div>
              <p className="text-2xl font-black uppercase tracking-[-0.04em]">Depot</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-amber-300">Stream yard</p>
            </div>
          </Link>
          <div className="hidden items-center gap-6 text-sm font-bold text-zinc-300 md:flex">
            <a href="#trending" className="hover:text-white">Trending</a>
            <a href="#top-10" className="hover:text-white">Top 10</a>
            <a href="#categories" className="hover:text-white">Categories</a>
          </div>
        </div>
      </nav>

      <section className="relative mx-auto grid min-h-[680px] max-w-7xl items-center gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
        <div className="absolute inset-x-0 top-0 -z-10 h-[720px] bg-gradient-to-b from-transparent via-transparent to-[#050507]" />
        <div className="space-y-8">
          <div className="inline-flex items-center gap-3 rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-sm font-black uppercase tracking-[0.24em] text-amber-200">
            <span className="h-2 w-2 rounded-full bg-amber-300 shadow-[0_0_20px_#facc15]" />
            Now boarding
          </div>
          <div className="max-w-3xl space-y-5">
            <p className="text-sm font-black uppercase tracking-[0.45em] text-red-300">Depot featured premiere</p>
            <h1 className="text-5xl font-black tracking-[-0.08em] text-white sm:text-7xl lg:text-8xl">
              {hero.title}
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-zinc-300 sm:text-xl">{hero.overview}</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {hero.id ? (
              <Link
                href={`/movie/${hero.id}`}
                className="rounded-full bg-white px-8 py-4 text-base font-black text-zinc-950 shadow-2xl shadow-white/10 transition hover:scale-105 hover:bg-amber-300"
              >
                ▶ Play Featured
              </Link>
            ) : (
              <button className="rounded-full bg-white px-8 py-4 text-base font-black text-zinc-950 shadow-2xl shadow-white/10 transition hover:scale-105 hover:bg-amber-300">
                Add TMDB Key
              </button>
            )}
            <button className="rounded-full border border-white/20 bg-white/10 px-8 py-4 text-base font-black text-white backdrop-blur transition hover:border-amber-300 hover:text-amber-200">
              + My Depot List
            </button>
          </div>
          <div className="grid max-w-2xl grid-cols-3 gap-3 text-center sm:gap-5">
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
              <p className="text-3xl font-black text-amber-300">4K</p>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">Ultra HD</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
              <p className="text-3xl font-black text-amber-300">6</p>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">Rows</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
              <p className="text-3xl font-black text-amber-300">∞</p>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">Vibes</p>
            </div>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xl">
          <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-amber-300/30 via-red-600/20 to-purple-500/20 blur-2xl" />
          <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-zinc-950 shadow-2xl shadow-black/60">
            {heroImage ? (
              <img src={heroImage} alt={`${hero.title} backdrop`} className="aspect-[4/5] w-full object-cover" />
            ) : (
              <div className="aspect-[4/5] bg-[radial-gradient(circle_at_top,#facc1533,transparent_30%),linear-gradient(145deg,#300d15,#07070a)]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="rounded-2xl border border-white/15 bg-black/65 p-5 backdrop-blur-xl">
                <p className="text-xs font-black uppercase tracking-[0.32em] text-amber-300">Smart preview</p>
                <h2 className="mt-2 text-2xl font-black">Keep watching in the Depot</h2>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-amber-300 to-red-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-14 px-5 pb-20 sm:px-8">
        <section id="categories" className="grid gap-4 md:grid-cols-4">
          {["Action Rush", "Laugh Track", "Family Night", "Critic Picks"].map((label, index) => (
            <div key={label} className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.12] to-white/[0.03] p-6 shadow-2xl shadow-black/20 transition hover:-translate-y-1 hover:border-amber-300/50">
              <p className="text-4xl font-black text-amber-300">0{index + 1}</p>
              <h3 className="mt-6 text-xl font-black text-white">{label}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-400">Curated lanes built for instant movie-night decisions.</p>
            </div>
          ))}
        </section>

        <div id="trending">
          <MovieRow title="Trending at the Depot" eyebrow="Hot arrivals" movies={sections.trending} />
        </div>
        <div id="top-10">
          <MovieRow title="Top 10 in the Yard" eyebrow="Most boarded" movies={sections.popular.slice(0, 10)} ranked />
        </div>
        <MovieRow title="High-voltage Action" eyebrow="Adrenaline lane" movies={sections.action} />
        <MovieRow title="Comedies that hit" eyebrow="Good mood queue" movies={sections.comedy} />
        <MovieRow title="Family Night Picks" eyebrow="All ages" movies={sections.family} />
        <MovieRow title="Critically Acclaimed" eyebrow="Prestige platform" movies={sections.topRated} />
      </div>
    </main>
  );
}
