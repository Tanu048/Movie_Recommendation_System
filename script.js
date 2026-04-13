/**
 * CineVault — script.js
 * Movie Recommendation System
 * Handles: data, rendering, search, genre filter,
 *          favorites (localStorage), hero carousel,
 *          modal, theme toggle, skeleton loader.
 */

/* ===========================================
   MOVIE DATASET
   =========================================== */
const MOVIES = [
  {
    id: 1,
    title: "Dune: Part Two",
    genre: "Sci-Fi",
    rating: 8.7,
    year: 2024,
    runtime: "166 min",
    poster: "https://image.tmdb.org/t/p/w500/czembW0Rk1ae5NoCV2m7GBpSZMp.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg",
    description: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family, facing a choice between the love of his life and the fate of the universe.",
    cast: ["Timothée Chalamet", "Zendaya", "Rebecca Ferguson", "Javier Bardem"],
    featured: true
  },
  {
    id: 2,
    title: "Oppenheimer",
    genre: "Drama",
    rating: 8.9,
    year: 2023,
    runtime: "180 min",
    poster: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/rLb2cwF3Pazuxaj0sRXQ037tGI1.jpg",
    description: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.",
    cast: ["Cillian Murphy", "Emily Blunt", "Matt Damon", "Robert Downey Jr."],
    featured: true
  },
  {
    id: 3,
    title: "Poor Things",
    genre: "Comedy",
    rating: 8.1,
    year: 2023,
    runtime: "141 min",
    poster: "https://image.tmdb.org/t/p/w500/kCGlIMHnOm8JPXSmZfd0QRn4i5x.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/5qE4sYjBhEtDQIOoLFBIzEbY6Ct.jpg",
    description: "The incredible tale about the fantastical evolution of Bella Baxter, a young woman brought back to life by the brilliant and unorthodox scientist Dr. Godwin Baxter.",
    cast: ["Emma Stone", "Mark Ruffalo", "Willem Dafoe", "Ramy Youssef"],
    featured: true
  },
  {
    id: 4,
    title: "The Batman",
    genre: "Action",
    rating: 7.9,
    year: 2022,
    runtime: "176 min",
    poster: "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg",
    description: "When a sadistic serial killer begins murdering key political figures in Gotham, Batman is forced to investigate the city's hidden corruption and question his family's involvement.",
    cast: ["Robert Pattinson", "Zoë Kravitz", "Jeffrey Wright", "Colin Farrell"],
    featured: false
  },
  {
    id: 5,
    title: "Everything Everywhere All at Once",
    genre: "Sci-Fi",
    rating: 8.1,
    year: 2022,
    runtime: "139 min",
    poster: "https://image.tmdb.org/t/p/w500/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/4Like6elApVbE9rBfJCl5YbJQaS.jpg",
    description: "An aging Chinese immigrant is swept up in an insane adventure, where she alone can save the world by exploring other universes connecting with the lives she could have led.",
    cast: ["Michelle Yeoh", "Ke Huy Quan", "Jamie Lee Curtis", "Stephanie Hsu"],
    featured: false
  },
  {
    id: 6,
    title: "Interstellar",
    genre: "Sci-Fi",
    rating: 8.6,
    year: 2014,
    runtime: "169 min",
    poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg",
    description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival as Earth faces extinction.",
    cast: ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain", "Michael Caine"],
    featured: false
  },
  {
    id: 7,
    title: "Parasite",
    genre: "Thriller",
    rating: 8.5,
    year: 2019,
    runtime: "132 min",
    poster: "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/TU9NIjwzjoKPwQHoHshkFcQUCG.jpg",
    description: "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.",
    cast: ["Song Kang-ho", "Lee Sun-kyun", "Cho Yeo-jeong", "Choi Woo-shik"],
    featured: false
  },
  {
    id: 8,
    title: "The Grand Budapest Hotel",
    genre: "Comedy",
    rating: 8.1,
    year: 2014,
    runtime: "99 min",
    poster: "https://image.tmdb.org/t/p/w500/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/l6GmGilAWffTQjTHMFbwVwEjYG.jpg",
    description: "A writer encounters the owner of an aging high-class hotel, who tells him of his early years serving as a lobby boy in the company of an exceptional concierge.",
    cast: ["Ralph Fiennes", "Tony Revolori", "Saoirse Ronan", "F. Murray Abraham"],
    featured: false
  },
  {
    id: 9,
    title: "Mad Max: Fury Road",
    genre: "Action",
    rating: 8.1,
    year: 2015,
    runtime: "120 min",
    poster: "https://image.tmdb.org/t/p/w500/hA2ple9q4qnwxp3hKVNhroipsir.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/phszHPFPGCct1HMDPdFBaCuM0Iu.jpg",
    description: "In a post-apocalyptic wasteland, a woman rebels against a tyrannical ruler in search for her homeland with the aid of a group of female prisoners and a drifter.",
    cast: ["Tom Hardy", "Charlize Theron", "Nicholas Hoult", "Hugh Keays-Byrne"],
    featured: false
  },
  {
    id: 10,
    title: "Get Out",
    genre: "Horror",
    rating: 7.7,
    year: 2017,
    runtime: "104 min",
    poster: "https://image.tmdb.org/t/p/w500/qbaHfEFlQGjECVVgJQwVKaBp3Eg.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/jk5rTJMCXlYXRs1rUa7NjmjN7Cc.jpg",
    description: "A young African-American visits his white girlfriend's parents for the weekend, where his simmering unease about their family's suggestive behavior finally reaches a boiling point.",
    cast: ["Daniel Kaluuya", "Allison Williams", "Catherine Keener", "Bradley Whitford"],
    featured: false
  },
  {
    id: 11,
    title: "Spirited Away",
    genre: "Animation",
    rating: 8.6,
    year: 2001,
    runtime: "125 min",
    poster: "https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/bSXfU4dwZyBA1vMmXvejdRXBvuF.jpg",
    description: "During her family's move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits—a world where humans are changed into beasts.",
    cast: ["Daveigh Chase", "Suzanne Pleshette", "Jason Marsden", "Susan Egan"],
    featured: false
  },
  {
    id: 12,
    title: "La La Land",
    genre: "Romance",
    rating: 8.0,
    year: 2016,
    runtime: "128 min",
    poster: "https://image.tmdb.org/t/p/w500/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/nadTnvYSzmfQECVHFLnNMDYgkQg.jpg",
    description: "While navigating their careers in Los Angeles, a pianist and an actress fall in love while attempting to reconcile their aspirations for the future.",
    cast: ["Ryan Gosling", "Emma Stone", "John Legend", "Rosemarie DeWitt"],
    featured: false
  },
  {
    id: 13,
    title: "Joker",
    genre: "Drama",
    rating: 8.4,
    year: 2019,
    runtime: "122 min",
    poster: "https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/sf4GIWT8DmBMOKCHMfBrNBe9FDG.jpg",
    description: "A mentally troubled stand-up comedian embarks on a downward spiral of revolution and bloody crime in this character study of the iconic Batman villain.",
    cast: ["Joaquin Phoenix", "Robert De Niro", "Zazie Beetz", "Frances Conroy"],
    featured: false
  },
  {
    id: 14,
    title: "Arrival",
    genre: "Sci-Fi",
    rating: 7.9,
    year: 2016,
    runtime: "116 min",
    poster: "https://image.tmdb.org/t/p/w500/x2FJsf1ElAgr63Y3PNPtJrcmpoe.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/kJm4Sl0xBVSNcMnhS4DIWL6YvZS.jpg",
    description: "A linguist works with the military to communicate with alien lifeforms after twelve mysterious spacecraft appear around the world.",
    cast: ["Amy Adams", "Jeremy Renner", "Forest Whitaker", "Michael Stuhlbarg"],
    featured: false
  },
  {
    id: 15,
    title: "The Shawshank Redemption",
    genre: "Drama",
    rating: 9.3,
    year: 1994,
    runtime: "142 min",
    poster: "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg",
    description: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
    cast: ["Tim Robbins", "Morgan Freeman", "Bob Gunton", "William Sadler"],
    featured: false
  },
  {
    id: 16,
    title: "A Quiet Place",
    genre: "Horror",
    rating: 7.5,
    year: 2018,
    runtime: "90 min",
    poster: "https://image.tmdb.org/t/p/w500/nAU74GmpUk7t5iklEp3bufwDq4n.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/roYyPiQOcobOAzFkQfNXFqG5sZ2.jpg",
    description: "In a post-apocalyptic world, a family is forced to live in near silence while hiding from creatures that hunt purely by sound.",
    cast: ["Emily Blunt", "John Krasinski", "Millicent Simmonds", "Noah Jupe"],
    featured: false
  },
  {
    id: 17,
    title: "Knives Out",
    genre: "Thriller",
    rating: 7.9,
    year: 2019,
    runtime: "130 min",
    poster: "https://image.tmdb.org/t/p/w500/pThyQovXQrws2Q07t16tegGrmjA.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/uVg9qZ7B2gbOnLvTuqUGNUOAIGm.jpg",
    description: "A detective investigates the death of a patriarch of an eccentric, combative family.",
    cast: ["Daniel Craig", "Chris Evans", "Ana de Armas", "Jamie Lee Curtis"],
    featured: false
  },
  {
    id: 18,
    title: "Coco",
    genre: "Animation",
    rating: 8.4,
    year: 2017,
    runtime: "105 min",
    poster: "https://image.tmdb.org/t/p/w500/gGEsBPAijhVUFoiNpgZXqRVWJt2.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/askg3SMvhqEl4OL52YuvdtY40Yb.jpg",
    description: "Aspiring musician Miguel, confronted with his family's ban on music, enters the Land of the Dead to find his great-great-grandfather.",
    cast: ["Anthony Gonzalez", "Gael García Bernal", "Benjamin Bratt", "Alanna Ubach"],
    featured: false
  }
];

/* ===========================================
   STATE
   =========================================== */
let state = {
  activeGenre: "All",
  searchQuery: "",
  favorites: JSON.parse(localStorage.getItem("cinevault_favorites") || "[]"),
  viewMode: "grid",          // "grid" | "row"
  heroIndex: 0,
  heroInterval: null,
  isDark: true
};

/* Compute genre list from movies */
const GENRES = ["All", ...new Set(MOVIES.map(m => m.genre))].sort((a, b) =>
  a === "All" ? -1 : b === "All" ? 1 : a.localeCompare(b)
);

/* Featured movies for hero carousel */
const FEATURED = MOVIES.filter(m => m.featured);

/* ===========================================
   UTILITIES
   =========================================== */

/** Build star HTML string for a given rating (out of 10 → 5 stars) */
function starsHTML(rating) {
  const filled = Math.round(rating / 2);
  let html = '';
  for (let i = 1; i <= 5; i++) {
    html += `<span class="${i <= filled ? 'star-filled' : 'star-empty'}">★</span>`;
  }
  return html;
}

/** Check if a movie is in favorites */
function isFav(id) {
  return state.favorites.includes(id);
}

/** Save favorites to localStorage */
function saveFavorites() {
  localStorage.setItem("cinevault_favorites", JSON.stringify(state.favorites));
}

/** Toggle favorite and re-render relevant sections */
function toggleFavorite(id) {
  const idx = state.favorites.indexOf(id);
  if (idx === -1) {
    state.favorites.push(id);
    showToast("Added to Watchlist ♡");
  } else {
    state.favorites.splice(idx, 1);
    showToast("Removed from Watchlist");
  }
  saveFavorites();

  // Update all fav buttons for this movie across the page
  document.querySelectorAll(`.fav-btn[data-id="${id}"]`).forEach(btn => {
    btn.classList.toggle("active", isFav(id));
    btn.title = isFav(id) ? "Remove from Watchlist" : "Add to Watchlist";
    btn.setAttribute("aria-pressed", isFav(id));
  });

  renderFavorites();
  updateFavCount();
}

/** Show a toast notification */
function showToast(msg) {
  const container = document.getElementById("toastContainer") ||
    (() => {
      const el = document.createElement("div");
      el.id = "toastContainer";
      el.className = "toast-container";
      document.body.appendChild(el);
      return el;
    })();

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

/** Update favorites count badge */
function updateFavCount() {
  document.getElementById("favCount").textContent = state.favorites.length;
}

/* ===========================================
   MOVIE CARD TEMPLATE
   =========================================== */
function movieCardHTML(movie) {
  const fav = isFav(movie.id);
  const starsStr = starsHTML(movie.rating);
  // Stagger animation delay based on card position
  return `
    <article class="movie-card" data-id="${movie.id}" role="button" tabindex="0" aria-label="View details for ${movie.title}">
      <div class="movie-poster">
        <img src="${movie.poster}" alt="${movie.title} poster" loading="lazy"
             onerror="this.src='https://via.placeholder.com/300x450/16161f/e8a020?text=${encodeURIComponent(movie.title)}'" />
        <div class="movie-poster-overlay">
          <button class="play-btn" aria-label="Open details for ${movie.title}">▶</button>
        </div>
        <span class="rating-badge">★ ${movie.rating}</span>
        <button class="fav-btn ${fav ? 'active' : ''}"
          data-id="${movie.id}"
          title="${fav ? 'Remove from Watchlist' : 'Add to Watchlist'}"
          aria-label="${fav ? 'Remove from Watchlist' : 'Add to Watchlist'}"
          aria-pressed="${fav}"
          onclick="event.stopPropagation(); toggleFavorite(${movie.id})">
          ${fav ? '♥' : '♡'}
        </button>
      </div>
      <div class="movie-info">
        <div class="movie-title">${movie.title}</div>
        <p class="movie-desc-preview">${movie.description}</p>
        <div class="movie-meta-row">
          <span class="movie-genre-tag">${movie.genre}</span>
          <div class="stars">${starsStr}</div>
        </div>
      </div>
    </article>
  `;
}

/* ===========================================
   RENDER FUNCTIONS
   =========================================== */

/** Render genre filter buttons */
function renderGenreFilters() {
  const container = document.getElementById("genreFilters");
  container.innerHTML = GENRES.map(g => `
    <button class="genre-btn ${g === state.activeGenre ? 'active' : ''}"
            data-genre="${g}"
            aria-pressed="${g === state.activeGenre}">
      ${g}
    </button>
  `).join('');
}

/** Render the main movies grid (with optional genre filter) */
function renderMovies() {
  const grid = document.getElementById("moviesGrid");
  const noResults = document.getElementById("noFilterResults");
  const title = document.getElementById("moviesTitle");

  let filtered = MOVIES;
  if (state.activeGenre !== "All") {
    filtered = MOVIES.filter(m => m.genre === state.activeGenre);
  }

  title.textContent = state.activeGenre === "All" ? "All Movies" : state.activeGenre;

  // Apply view mode class
  grid.className = `movies-grid${state.viewMode === "row" ? " row-view" : ""}`;

  if (filtered.length === 0) {
    grid.innerHTML = '';
    noResults.style.display = "block";
  } else {
    noResults.style.display = "none";
    grid.innerHTML = filtered.map((m, i) => {
      const card = movieCardHTML(m);
      // Inject animation delay via inline style
      return card.replace('<article', `<article style="animation-delay:${i * 0.04}s"`);
    }).join('');
  }
}

/** Render search results */
function renderSearchResults(query) {
  const section  = document.getElementById("searchResultsSection");
  const grid     = document.getElementById("searchResultsGrid");
  const noRes    = document.getElementById("noResults");
  const noQuery  = document.getElementById("noResultsQuery");

  if (!query.trim()) {
    section.style.display = "none";
    return;
  }

  section.style.display = "block";
  const q = query.toLowerCase().trim();
  const results = MOVIES.filter(m =>
    m.title.toLowerCase().includes(q) ||
    m.genre.toLowerCase().includes(q) ||
    m.description.toLowerCase().includes(q)
  );

  if (results.length === 0) {
    grid.innerHTML = '';
    noRes.style.display = "block";
    noQuery.textContent = query;
  } else {
    noRes.style.display = "none";
    grid.innerHTML = results.map((m, i) =>
      movieCardHTML(m).replace('<article', `<article style="animation-delay:${i * 0.04}s"`)
    ).join('');
  }

  section.scrollIntoView({ behavior: "smooth", block: "start" });
}

/** Render favorites watchlist */
function renderFavorites() {
  const grid    = document.getElementById("favoritesGrid");
  const empty   = document.getElementById("emptyFavorites");
  const favMovies = MOVIES.filter(m => isFav(m.id));

  if (favMovies.length === 0) {
    grid.innerHTML = '';
    empty.style.display = "block";
  } else {
    empty.style.display = "none";
    grid.innerHTML = favMovies.map((m, i) =>
      movieCardHTML(m).replace('<article', `<article style="animation-delay:${i * 0.04}s"`)
    ).join('');
  }
}

/* ===========================================
   HERO CAROUSEL
   =========================================== */
function renderHero(index) {
  const movie   = FEATURED[index];
  const bg      = document.getElementById("heroBg");
  const content = document.getElementById("heroContent");
  const starsStr = starsHTML(movie.rating);

  // Background image
  bg.style.backgroundImage = `url('${movie.backdrop || movie.poster}')`;
  setTimeout(() => bg.classList.add("zoom"), 50);

  // Content
  content.innerHTML = `
    <div class="hero-badge">⭐ Featured Film</div>
    <h1 class="hero-title">${movie.title}</h1>
    <div class="hero-meta">
      <span class="hero-rating">★ ${movie.rating}/10</span>
      <span class="hero-genre">${movie.genre}</span>
      <span class="hero-year">${movie.year} · ${movie.runtime}</span>
    </div>
    <p class="hero-desc">${movie.description}</p>
    <div class="hero-actions">
      <button class="btn-primary" onclick="openModal(${movie.id})">
        ▶ Watch Now
      </button>
      <button class="btn-secondary" onclick="toggleFavorite(${movie.id})">
        ${isFav(movie.id) ? '♥ In Watchlist' : '♡ Add to Watchlist'}
      </button>
    </div>
  `;

  // Dots
  renderHeroDots(index);
}

function renderHeroDots(activeIdx) {
  const dotsEl = document.getElementById("heroDots");
  dotsEl.innerHTML = FEATURED.map((_, i) => `
    <button class="hero-dot ${i === activeIdx ? 'active' : ''}"
            onclick="goToHero(${i})"
            aria-label="Go to featured movie ${i + 1}"
            aria-pressed="${i === activeIdx}">
    </button>
  `).join('');
}

function goToHero(idx) {
  document.getElementById("heroBg").classList.remove("zoom");
  state.heroIndex = idx;
  clearInterval(state.heroInterval);
  renderHero(idx);
  startHeroAutoPlay();
}

function nextHero() {
  document.getElementById("heroBg").classList.remove("zoom");
  state.heroIndex = (state.heroIndex + 1) % FEATURED.length;
  renderHero(state.heroIndex);
}

function startHeroAutoPlay() {
  state.heroInterval = setInterval(nextHero, 6000);
}

/* ===========================================
   MODAL
   =========================================== */
function openModal(id) {
  const movie   = MOVIES.find(m => m.id === id);
  if (!movie) return;

  const starsStr = starsHTML(movie.rating);
  const fav = isFav(movie.id);

  document.getElementById("modalBody").innerHTML = `
    <div class="modal-hero">
      <img src="${movie.backdrop || movie.poster}" alt="${movie.title} backdrop"
           onerror="this.src='${movie.poster}'" />
      <div class="modal-hero-overlay"></div>
    </div>
    <div class="modal-details">
      <div class="modal-genre-badge">${movie.genre}</div>
      <h2 class="modal-title">${movie.title}</h2>
      <div class="modal-meta">
        <div class="modal-rating">
          <span>★</span> ${movie.rating}/10
        </div>
        <div class="modal-stars">${starsStr}</div>
        <span class="modal-year">${movie.year}</span>
        <span class="modal-runtime">⏱ ${movie.runtime}</span>
      </div>
      <p class="modal-description">${movie.description}</p>
      <div class="modal-actions">
        <button class="btn-primary" onclick="showToast('Playback not available in demo ▶')">
          ▶ Watch Now
        </button>
        <button class="btn-secondary fav-btn ${fav ? 'active' : ''}"
                data-id="${movie.id}"
                onclick="toggleFavorite(${movie.id}); this.textContent = isFav(${movie.id}) ? '♥ In Watchlist' : '♡ Add to Watchlist'; this.classList.toggle('active', isFav(${movie.id}))">
          ${fav ? '♥ In Watchlist' : '♡ Add to Watchlist'}
        </button>
      </div>
      ${movie.cast && movie.cast.length ? `
        <div class="modal-cast">
          <h4>Cast</h4>
          <div class="cast-list">
            ${movie.cast.map(c => `<span class="cast-tag">${c}</span>`).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;

  const overlay = document.getElementById("modalOverlay");
  overlay.style.display = "flex";
  document.body.style.overflow = "hidden";
}

function closeModal() {
  document.getElementById("modalOverlay").style.display = "none";
  document.body.style.overflow = "";
}

/* ===========================================
   EVENT DELEGATION — Movie Card Clicks
   =========================================== */
function bindCardClicks(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.addEventListener("click", e => {
    const card = e.target.closest(".movie-card");
    const favBtn = e.target.closest(".fav-btn");
    if (favBtn) return; // handled inline
    if (card) {
      openModal(Number(card.dataset.id));
    }
  });
  // Keyboard accessibility
  container.addEventListener("keydown", e => {
    if (e.key === "Enter" || e.key === " ") {
      const card = e.target.closest(".movie-card");
      if (card) { e.preventDefault(); openModal(Number(card.dataset.id)); }
    }
  });
}

/* ===========================================
   SKELETON LOADER
   =========================================== */
function showSkeleton() {
  document.getElementById("skeletonGrid").style.display = "grid";
  document.getElementById("moviesGrid").style.display   = "none";
}

function hideSkeleton() {
  document.getElementById("skeletonGrid").style.display = "none";
  document.getElementById("moviesGrid").style.display   = "grid";
}

/* ===========================================
   INIT
   =========================================== */
function init() {
  // Render initial hero
  renderHero(0);
  startHeroAutoPlay();

  // Render genre filters
  renderGenreFilters();

  // Show skeleton, then render movies after brief delay (simulates load)
  showSkeleton();
  setTimeout(() => {
    renderMovies();
    hideSkeleton();
  }, 900);

  // Render favorites
  renderFavorites();
  updateFavCount();

  // Bind card click events on each grid container
  bindCardClicks("moviesGrid");
  bindCardClicks("favoritesGrid");
  bindCardClicks("searchResultsGrid");

  // ── Genre filter clicks ──
  document.getElementById("genreFilters").addEventListener("click", e => {
    const btn = e.target.closest(".genre-btn");
    if (!btn) return;
    state.activeGenre = btn.dataset.genre;
    // Update button states
    document.querySelectorAll(".genre-btn").forEach(b => {
      b.classList.toggle("active", b.dataset.genre === state.activeGenre);
      b.setAttribute("aria-pressed", b.dataset.genre === state.activeGenre);
    });
    renderMovies();
    document.getElementById("movies").scrollIntoView({ behavior: "smooth" });
  });

  // ── Search ──
  const searchInput = document.getElementById("searchInput");
  let searchDebounce;
  searchInput.addEventListener("input", () => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => {
      state.searchQuery = searchInput.value;
      renderSearchResults(state.searchQuery);
    }, 300);
  });

  // ── View toggle ──
  document.getElementById("gridViewBtn").addEventListener("click", () => {
    state.viewMode = "grid";
    document.getElementById("gridViewBtn").classList.add("active");
    document.getElementById("rowViewBtn").classList.remove("active");
    renderMovies();
  });
  document.getElementById("rowViewBtn").addEventListener("click", () => {
    state.viewMode = "row";
    document.getElementById("rowViewBtn").classList.add("active");
    document.getElementById("gridViewBtn").classList.remove("active");
    renderMovies();
  });

  // ── Modal close ──
  document.getElementById("modalClose").addEventListener("click", closeModal);
  document.getElementById("modalOverlay").addEventListener("click", e => {
    if (e.target === e.currentTarget) closeModal();
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeModal();
  });

  // ── Theme toggle ──
  const themeToggle = document.getElementById("themeToggle");
  themeToggle.addEventListener("click", () => {
    state.isDark = !state.isDark;
    document.body.classList.toggle("dark-mode", state.isDark);
    document.body.classList.toggle("light-mode", !state.isDark);
    themeToggle.querySelector(".theme-icon").textContent = state.isDark ? "🌙" : "☀️";
  });

  // ── Hamburger ──
  const hamburger   = document.getElementById("hamburger");
  const mobileMenu  = document.getElementById("mobileMenu");
  hamburger.addEventListener("click", () => {
    const open = hamburger.classList.toggle("open");
    hamburger.setAttribute("aria-expanded", open);
    mobileMenu.classList.toggle("open", open);
  });

  // ── Navbar scroll effect ──
  window.addEventListener("scroll", () => {
    const scrolled = window.scrollY > 40;
    document.getElementById("navbar").classList.toggle("scrolled", scrolled);
    // Back to top
    document.getElementById("backToTop").classList.toggle("visible", window.scrollY > 400);
  }, { passive: true });

  // ── Back to top ──
  document.getElementById("backToTop").addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // ── Smooth scroll nav links ──
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener("click", e => {
      const target = document.getElementById(link.getAttribute("href").slice(1));
      if (target) {
        e.preventDefault();
        const offset = target.getBoundingClientRect().top + window.scrollY - 72;
        window.scrollTo({ top: offset, behavior: "smooth" });
      }
    });
  });

  // ── Active nav link on scroll ──
  const sections = document.querySelectorAll("section[id]");
  const navLinks  = document.querySelectorAll(".nav-link");
  const observer  = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(l => {
          l.classList.toggle("active", l.dataset.section === entry.target.id);
        });
      }
    });
  }, { rootMargin: "-40% 0px -55% 0px" });
  sections.forEach(s => observer.observe(s));
}

// ── Boot ──
document.addEventListener("DOMContentLoaded", init);