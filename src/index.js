import React, {useState} from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import StarRating from './StarRating';

function Test() {
  const [movieRating, setMovieRating] = useState(0); // Fix: Import useState
  return (
    <div>
      <StarRating color="red" onSetRating={setMovieRating}></StarRating>
      <p>
        {movieRating ? (
          `You rated the movie ${movieRating} stars`
        ) : "No ratings yet."}
      </p>
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
