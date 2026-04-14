from fastapi import HTTPException

from ml_model.model import recommend, movies


class MovieManager:

    def get_movies(self):
        movie_list = movies['title'].tolist()
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