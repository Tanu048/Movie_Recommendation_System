from fastapi import APIRouter
from backend.manager import MovieManager
from backend.schema import MovieRequest

router = APIRouter(
    prefix="/movies",
    tags=["Movies"]
)

manager = MovieManager()


@router.get("/")
def get_movies():
    return manager.get_movies()


@router.post("/recommend")
def recommend_movies(data: MovieRequest):
    return manager.recommend_movies(data.movie_name)