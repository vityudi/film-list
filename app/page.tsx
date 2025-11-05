export default function Home() {
  return (
    <div className="bg-black min-h-screen pt-20">
      <div className="px-4 md:px-8 py-8">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
          Welcome to FilmList
        </h1>
        <p className="text-gray-400 text-lg mb-8">
          Sign in to discover and save your favorite movies
        </p>

        {/* Placeholder for future content */}
        <div className="grid grid-cols-1 gap-8">
          <div className="h-96 bg-gray-800 rounded-lg flex items-center justify-center">
            <p className="text-gray-400">Content loading...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
