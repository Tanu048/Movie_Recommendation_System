# 🎬 CineVault — Movie Recommendation System

A full-stack movie discovery and recommendation web app with a dark cinema aesthetic. Browse movies by genre, search, manage a personal watchlist, and get AI-powered recommendations — all served from a single FastAPI backend.

**Live Demo:** https://movie-recommendation-system-6vyr.onrender.com/

---

## Features

- **Movie Browser** — Grid and row view with poster images, ratings, and genre tags
- **Smart Recommendations** — ML-powered suggestions based on content similarity
- **Genre Filtering** — Browse movies by individual genres
- **Search** — Real-time search across titles, genres, and descriptions
- **Watchlist** — Add/remove favorites, persisted in localStorage
- **Hero Carousel** — Auto-rotating featured films with backdrop images
- **Movie Detail Modal** — Full info including cast, rating, overview, and backdrop
- **Light/Dark Mode** — Toggle between themes
- **Responsive Design** — Works on desktop and mobile

---

## Tech Stack

| Layer      | Technology                                  |
|------------|---------------------------------------------|
| Backend    | FastAPI (Python)                            |
| ML Model   | scikit-learn, pandas, numpy                 |
| Frontend   | Vanilla JS, HTML5, CSS3                     |
| Data       | TMDB-sourced CSV with posters and backdrops |
| Deployment | Render                                      |

---

## Project Structure

```
Movie_Recommendation_System/
├── main.py                  # FastAPI app entry point
├── requirements.txt
├── backend/
│   ├── manager.py           # Business logic & data layer
│   ├── routers.py           # API route definitions
│   └── schema.py            # Pydantic request models
├── frontend/
│   ├── index.html
│   ├── script.js            # All UI logic
│   └── style.css
└── ml_model/
    ├── model.py             # Similarity & recommendation logic
    ├── movies.pkl           # Preprocessed movie data
    ├── vectors.pkl          # Feature vectors
    └── movies_with_posters.csv
```

---

## API Endpoints

| Method | Endpoint            | Description                                  |
|--------|---------------------|----------------------------------------------|
| `GET`  | `/movies/`          | Returns all movies with posters and metadata |
| `POST` | `/movies/recommend` | Returns 5 similar movies for a given title   |

**Recommend request body:**
```json
{ "movie_name": "Inception" }
```

---

## Running Locally

```bash
# 1. Clone the repo
git clone https://github.com/your-username/Movie_Recommendation_System.git
cd Movie_Recommendation_System

# 2. Create and activate a virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# 3. Install dependencies
pip install -r requirements.txt

# 4. Start the server
uvicorn main:app --reload

# 5. Open in browser
# http://127.0.0.1:8000
```

---

## Deployment (Render)

1. Push your code to GitHub
2. Create a new **Web Service** on [Render](https://render.com)
3. Set the build command: `pip install -r requirements.txt`
4. Set the start command: `uvicorn main:app --host 0.0.0.0 --port 10000`
5. Deploy — Render auto-detects the port and serves the app

---

## How Recommendations Work

Movies are vectorized using a bag-of-words approach over genres, keywords, cast, and overview. When you request recommendations for a title, the model computes a similarity score between that movie's vector and every other movie's vector, then returns the top 5 closest matches.

---
