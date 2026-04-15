from fastapi import HTTPException
from ml_model.model import recommend, movies
import pandas as pd
import ast

poster_movies = pd.read_csv("ml_model/movies_with_posters.csv")
poster_movies = poster_movies.fillna("")

class MovieManager:

    def extract_genres(genre_str):
        try:
            genres = ast.literal_eval(genre_str)
            return ", ".join([g['name'] for g in genres])
        except:
            return "Unknown"

    def get_movies(self):
        movie_list = []
        for _, row in poster_movies.iterrows():
            movie_list.append({
                "title": row['title'],
                "overview": row['overview'],
                "genres": MovieManager.extract_genres(row['genres']),
                "poster": row['poster'] if row['poster'] else None
            })
        return {"movies": movie_list}

    def recommend_movies(self, movie_name):
        movie_name = movie_name.strip()
        matched = movies[
            movies['title'].str.lower() == movie_name.lower()
        ]

        if matched.empty:
            raise HTTPException(
                status_code=404,
                detail="Movie not found"
            )
        correct_name = matched.iloc[0]['title']
        recommendations = recommend(correct_name)

        return {
            "movie": correct_name,
            "recommendations": recommendations
        }