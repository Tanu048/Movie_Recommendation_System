/**
 * CineVault — script.js
 * Movie Recommendation System
 * Handles: data, rendering, search, genre filter,
 *          favorites (localStorage), hero carousel,
 *          modal, theme toggle, skeleton loader.
 */

const API_BASE = "";

/* ===========================================
   MOVIE DATASET
   =========================================== */
let MOVIES = [];

async function fetchMovies() {
  try {
    const response = await fetch(`${API_BASE}/movies/`);
    const data = await response.json();
    const rawMovies = data.movies || (Array.isArray(data) ? data : []);

    MOVIES = rawMovies.map((movie, index) => ({
      id: movie.movie_id || index,
      title: movie.title || "Untitled",
      genre: movie.genres || "Unknown",
      rating: movie.rating || 8,
      year: movie.year || 2020,
      runtime: "120 min",

      poster: movie.poster ||
        `https://placehold.co/500x750?text=${movie.title}`,

      backdrop: movie.poster ||
        `https://placehold.co/1200x700?text=${movie.title}`,

      description: movie.overview,
      featured: index < 5
    }));

    init();

  } catch (error) {
    console.error("Error fetching movies:", error);
    hideSkeleton();
  }
}

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

function init() {

  FEATURED = MOVIES.filter(m => m.featured || m.id < 5);
  GENRES = ["All", ...new Set(MOVIES.map(m => m.genre).filter(Boolean))];

  // FEATURED = MOVIES.filter(m => m.featured);
  // GENRES = ["All", ...new Set(MOVIES.map(m => m.genre))];

  console.log("MOVIES:", MOVIES.length)
  console.log("FEATURED:", FEATURED.length)

  if (FEATURED.length > 0) {
    renderHero(0);
    startHeroAutoPlay();
  }
  renderGenreFilters();
  renderMovies();
}
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
  const section = document.getElementById("searchResultsSection");
  const grid = document.getElementById("searchResultsGrid");
  const noRes = document.getElementById("noResults");
  const noQuery = document.getElementById("noResultsQuery");

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
  const grid = document.getElementById("favoritesGrid");
  const empty = document.getElementById("emptyFavorites");
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

  if (!FEATURED.length) return;

  const movie = FEATURED[index];
  if (!movie) return;

  const bg = document.getElementById("heroBg");
  const content = document.getElementById("heroContent");

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
  const movie = MOVIES.find(m => m.id === id);
  if (!movie) return;

  const starsStr = starsHTML(movie.rating);
  const fav = isFav(movie.id);

  document.getElementById("modalBody").innerHTML = `
    <div class="modal-hero">
      <img src="${movie.poster}" alt="${movie.title} backdrop"
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
  document.getElementById("moviesGrid").style.display = "none";
}

function hideSkeleton() {
  document.getElementById("skeletonGrid").style.display = "none";
  document.getElementById("moviesGrid").style.display = "grid";
}

/* ===========================================
   INIT
   =========================================== */

// recommendation function
async function getRecommendations(movieName) {
  try {
    const response = await fetch(`${API_BASE}/movies/recommend`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        movie_name: movieName
      })
    });

    const data = await response.json();
    return data.recommendations;

  } catch (error) {
    console.error("Recommendation error:", error);
    return [];
  }
}

// ── Boot ──

document.addEventListener("DOMContentLoaded", () => {
  fetchMovies(); // Start the data fetch

  // 1. Theme Toggle Logic
  const themeBtn = document.getElementById("themeToggle");
  themeBtn.addEventListener("click", () => {
    state.isDark = !state.isDark;
    document.body.classList.toggle("light-mode", !state.isDark);
    themeBtn.querySelector(".theme-icon").textContent = state.isDark ? "🌙" : "☀️";
  });

  // 2. Mobile Menu Logic
  const hamburger = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobileMenu");
  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("open");
    mobileMenu.classList.toggle("open");
  });

  // 3. Search Bar Logic
  const searchInput = document.getElementById("searchInput");
  searchInput.addEventListener("input", (e) => {
    renderSearchResults(e.target.value);
  });
});