import { useState, useEffect } from "react";
import StarRating from './StarRating';

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = '8fdeb9af';

export default function App() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  
  // Initialize state based on callback function
  // const [watched, setWatched] = useState([]);
  const [watched, setWatched] = useState(() => {
    const storedValue = localStorage.getItem('watched');
    return JSON.parse(storedValue);
  })
  
  function handleSelectMovie(id) {    
    setSelectedId((selectedId) => selectedId === id ? null : id);
  }

  function handleCloseMovie(){
    setSelectedId(null);
  } 

  function handleAddWatched(movie) {
    setWatched(watched => [...watched, movie]);

    // Adding a watched movie into the localStorage
    // localStorage.setItem('watched', JSON.stringify([...watched, movie]));
  }

  function handleDeleteWatch(id) {
    setWatched(watched => watched.filter((movie) => movie.imdbID !== id));
  }

  useEffect(() => {
    const controller = new AbortController();

    async function fetchMovies() {
      try {
        setIsLoading(true);
        setError("");
        const response = await fetch(`http://www.omdbapi.com/?apikey=${KEY}&s=${query}`, {signal: controller.signal});
        if (!response.ok) throw new Error("Something went wrong with fetching movies");
        
        const data = await response.json();
        if (data.Response === "False") throw new Error("Movie not found");
        setMovies(data.Search);
        setError("");
      } catch(error) {
        if (error.name !== "AbortError") setError(error.message)
      } finally {
        setIsLoading(false);
      }
    }
    
    if (query.length < 3) {
      setMovies([]);
      setError('');
      return;
    }
    
    handleCloseMovie();
    fetchMovies();

    // Cleanup function for fetching movies
    return function() {
      controller.abort();
    }
  }, [query]);

  useEffect(function() {
    localStorage.setItem('watched', JSON.stringify(watched));
  }, [watched])

  return (
    <>
      <NavBar>
        <Logo/>
        <Search query={query} setQuery={setQuery}/>
        <Numresults movies={movies}/>
      </NavBar>
      <Main>
        <Box>
          {/* {isLoading ? <Loader></Loader> : <MovieList movies={movies}/>} */}
          { isLoading && <Loader /> }
          { !isLoading && !error && <MovieList movies={movies} onSelectMovie={handleSelectMovie}/> }
          { error && <ErrorMessage message={error}></ErrorMessage> }
        </Box>
        <Box>
          {
            selectedId ? 
              <MovieDetails selectedId={selectedId} onCloseMovie={handleCloseMovie} onAddWatched={handleAddWatched} watched={watched}></MovieDetails>
            : 
            <>
              <WatchedSummary watched={watched}/>
              <WatchedMoviesList watched={watched} onDeleteWatched={handleDeleteWatch}/>
            </>
          }
        </Box>
      </Main>
    </>
  );
}

function ErrorMessage({message}) {
  return (
    <p className="error">
      <span>🍕</span> {message}
    </p>
  )
}

function Loader() {
  return (
    <p className="loader">Loading...</p>
  )
}

function NavBar({children}) {
  return (
    <nav className="nav-bar">
      {children}
    </nav>
  )
}

function Main({children}) {  
  return (
    <main className="main">
      {children}
    </main>
  )
}


function Search({query, setQuery}) {

  useEffect(() => {
    const el = document.querySelector('.search');
    console.log(el);
    el.focus()
  }, []);

  return (
    <input
      className="search"
      type="text"
      placeholder="🔍 Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  )
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🎬</span>
      <h1>MagicFlix</h1>
    </div>
  )
}

function Numresults({movies}) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

function Box({children}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen((open) => !open)}
      >
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && (
        children
      )}
    </div>
  );
}

function MovieList({movies, onSelectMovie}) {
  
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} onSelectMovie={onSelectMovie}/>
      ))}
    </ul>
  )
}

function Movie({movie, onSelectMovie}) {
  return (
    <li onClick={() => onSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function WatchedSummary({watched}) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedMoviesList({watched, onDeleteWatched}) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie movie={movie} key={movie.imdbID} onDeleteWatched={onDeleteWatched}/>
      ))}
    </ul>
  );
}

function WatchedMovie({movie, onDeleteWatched}) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button className="btn-delete" onClick={() => onDeleteWatched(movie.imdbID)}>X</button>
      </div>
    </li>
  )
}

function MovieDetails({selectedId, onCloseMovie, onAddWatched, watched}) {
  const [isLoading, setIsLoading] = useState(false);
  const [movie, setMovie] = useState({});
  const [userRating, setUserRating] = useState('');

  const isWatched = watched.map(movie => movie.imdbID).includes(selectedId);
  const watchedUserRating = watched.find(movie => movie.imdbID === selectedId)?.userRating;
  // const userWatchedMovie = watched.filter(movie => movie.imdbID === selectedId);
  // const userWatchedMovieRating = Number(userWatchedMovie.at(0)?.userRating) || 0;
  

  
  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
    imdbRating
  } = movie;
  
  /* eslint-disable */
  // if (imdbRating > 8) return <p>Greatest Ever!</p>;
  
  useEffect(function() {
      async function getMovieDetails() {
        try {
          setIsLoading(true);
          const response = await fetch(`http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`);
          if (!response.ok) throw new Error("Something went wrong with fetching movie details");
          const data = await response.json();
          if (data.length <= 0) throw new Error("Something went wrong with fetching movie details");
          setMovie(data);
        } catch (error) {
          // console.warn(error.message);
        } finally {
          setIsLoading(false);
        }
      }
      getMovieDetails();
    
  }, [selectedId]);

  useEffect(function() {
    if (!title) return;
    document.title = title;

    // Reset title when component unmounts (cleanup function)
    return () => {
      document.title = "usePopcorn"
      console.log('Cleanup effect for movie ' + title);
    }
  }, [title]);

  // Closing the movie component when user press the escape key
  useEffect(function() {
    function callback(e) {
      if (e.code === 'Escape') {
        onCloseMovie();
        console.log('CLOSEING');
      }
    }

    document.addEventListener('keydown', callback);

    return function() {
      document.removeEventListener('keydown', callback);
    }
  }, [onCloseMovie]);

  // const [isTop, setIsTop] = useState(imdbRating > 8);
  // console.log(isTop);

  // useEffect(() => {
  //   setIsTop(imdbRating > 8);
  // }, [imdbRating])

  // const isTop = imdbRating > 8;
  // console.log(isTop);

  // const [averageRating, setAverageRating] = useState(0);

  function handleAdd() {

    const newWatchedMovie = {
      imdbID: selectedId,
      title,
      year,
      poster, 
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      userRating: userRating
    }

    onAddWatched(newWatchedMovie);
    onCloseMovie();

    // setAverageRating(Number(imdbRating));
    // setAverageRating((averageRating) => (averageRating + userRating) / 2);
  }
  
  return (
    <div className="details">
      {
        isLoading ? <Loader /> : 
        <>
          <header>
            <button className="btn-back" onClick={onCloseMovie}>&larr;</button>
            <img src={poster} alt={`Poster of ${movie} movie`}></img>
            <div className="details-overview">
              <h2>{title}</h2>
              <p>{released} &bull; {runtime}</p>
              <p>{genre}</p>
              <p><span>⭐</span>{imdbRating} IMDb rating</p>
            </div>
          </header>
          <section>
            <div className="rating">
              <h3>My Rating:</h3>
              {!isWatched ? 
              <>
                <StarRating maxRating={10} size={24} onSetRating={setUserRating} defaultRating={watchedUserRating}/>
                { (userRating > 0) && <button className="btn-add" onClick={handleAdd}>+ Add to Watched Movies</button>}
              </> : 
                <p>You rated this movie {watchedUserRating} 🌟</p>
              }
            </div>
            <p><em>{plot}</em></p>
            <p>📍 <strong>Country: </strong>{movie.Country}</p>
            <p>🕴🏼 <strong>Starring:</strong> {actors}</p>
            <p>🎥 <strong>Directed by:</strong> {director}</p>
            <p>🏆 <strong>Awards:</strong> {movie.Awards}</p>
          </section>
        </>
      }
    </div>
  ) 
}