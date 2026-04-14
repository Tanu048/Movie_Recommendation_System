import pickle

movies = pickle.load(open('movies.pkl', 'rb'))
vectors = pickle.load(open('vectors.pkl', 'rb'))

def similarity(v1, v2):
    common = set(v1.keys()) & set(v2.keys())
    score = 0
    for word in common:
        score += min(v1[word], v2[word])
    return score

def recommend(movie_name):
    movie_index = movies[movies['title'] == movie_name].index[0]
    selected_vector = vectors.iloc[movie_index]

    scores = []
    for i in range(len(vectors)):
        score = similarity(selected_vector, vectors.iloc[i])
        scores.append((i, score))

    scores = sorted(scores, key=lambda x: x[1], reverse=True)[1:6]

    return [movies.iloc[i[0]].title for i in scores]