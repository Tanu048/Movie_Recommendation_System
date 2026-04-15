from pydantic import BaseModel, Field

class MovieRequest(BaseModel):
    movie_name: str = Field(
        min_length=1,
        max_length=200
    )