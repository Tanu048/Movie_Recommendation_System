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
let FEATURED = [];
let GENRES = [];

async function fetchMovies() {
  try {
    const response = await fetch(`${API_BASE}/movies/`);
    const data = await response.json();
    const rawMovies = data.movies || (Array.isArray(data) ? data : []);

    MOVIES = rawMovies.map((movie, index) => ({
      id: movie.movie_id || index,
      title: movie.title || "Untitled",
      // BUG FIX: store raw genre string for splitting later
      genre: movie.genres || "Unknown",
      rating: movie.rating || 8,
      year: movie.year || 2020,
      runtime: "120 min",
      poster: movie.poster ||
        `https://placehold.co/500x750?text=${encodeURIComponent(movie.title)}`,
      // BUG FIX: use movie.backdrop first, not movie.poster
      backdrop: movie.backdrop || movie.poster ||
        `https://placehold.co/1200x700?text=${encodeURIComponent(movie.title)}`,
      // BUG FIX: guard against null/undefined overview
      description: movie.overview || "",
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
  viewMode: "grid",
  heroIndex: 0,
  heroInterval: null,
  isDark: true
};

/* ===========================================
   INIT — called after movies are fetched
   =========================================== */
function init() {
  // Build featured list
  FEATURED = MOVIES.filter(m => m.featured);

  // BUG FIX: split comma-separated genre strings into individual genres
  GENRES = [
    "All",
    ...new Set(
      MOVIES.flatMap(m =>
        m.genre ? m.genre.split(',').map(g => g.trim()).filter(Boolean) : []
      )
    )
  ].sort((a, b) => a === "All" ? -1 : b === "All" ? 1 : a.localeCompare(b));

  // Hero carousel
  if (FEATURED.length > 0) {
    renderHero(0);
    startHeroAutoPlay();
  }

  // Genre filters
  renderGenreFilters();

  // Show movies (skeleton was shown on DOMContentLoaded)
  hideSkeleton();
  renderMovies();

  // Favorites
  renderFavorites();
  updateFavCount();

  // BUG FIX: bind card clicks — was missing entirely from this version
  bindCardClicks("moviesGrid");
  bindCardClicks("favoritesGrid");
  bindCardClicks("searchResultsGrid");

  // BUG FIX: genre filter click handler — was missing from this version
  document.getElementById("genreFilters").addEventListener("click", e => {
    const btn = e.target.closest(".genre-btn");
    if (!btn) return;
    state.activeGenre = btn.dataset.genre;
    document.querySelectorAll(".genre-btn").forEach(b => {
      b.classList.toggle("active", b.dataset.genre === state.activeGenre);
      b.setAttribute("aria-pressed", b.dataset.genre === state.activeGenre);
    });
    renderMovies();
    document.getElementById("movies").scrollIntoView({ behavior: "smooth" });
  });

  // BUG FIX: view toggle buttons — were missing from this version
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

  // BUG FIX: modal close handlers — were missing from this version
  document.getElementById("modalClose").addEventListener("click", closeModal);
  document.getElementById("modalOverlay").addEventListener("click", e => {
    if (e.target === e.currentTarget) closeModal();
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeModal();
  });

  // BUG FIX: navbar scroll + back-to-top — were missing from this version
  window.addEventListener("scroll", () => {
    document.getElementById("navbar").classList.toggle("scrolled", window.scrollY > 40);
    document.getElementById("backToTop").classList.toggle("visible", window.scrollY > 400);
  }, { passive: true });

  document.getElementById("backToTop").addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // BUG FIX: smooth scroll for nav links — were missing
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

  // BUG FIX: active nav link on scroll — was missing
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-link");
  const observer = new IntersectionObserver(entries => {
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

/* ===========================================
   UTILITIES
   =========================================== */

/** Build star HTML for a rating out of 10 → 5 stars */
function starsHTML(rating) {
  const filled = Math.round(rating / 2);
  let html = '';
  for (let i = 1; i <= 5; i++) {
    html += `<span class="${i <= filled ? 'star-filled' : 'star-empty'}">★</span>`;
  }
  return html;
}

/** Returns true if movie id is in favorites */
function isFav(id) {
  return state.favorites.includes(id);
}

/** Persist favorites to localStorage */
function saveFavorites() {
  localStorage.setItem("cinevault_favorites", JSON.stringify(state.favorites));
}

/** Toggle favorite status and update all relevant UI */
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

  // BUG FIX: cache isFav result to avoid calling it 3+ times per loop iteration
  const nowFav = isFav(id);
  document.querySelectorAll(`.fav-btn[data-id="${id}"]`).forEach(btn => {
    btn.classList.toggle("active", nowFav);
    btn.title = nowFav ? "Remove from Watchlist" : "Add to Watchlist";
    btn.setAttribute("aria-pressed", nowFav);
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

/** Update the favorites count badge */
function updateFavCount() {
  document.getElementById("favCount").textContent = state.favorites.length;
}

/* ===========================================
   SHARED HELPER — animated card HTML
   =========================================== */
// BUG FIX: extracted repeated animation-delay injection into one helper
function animatedCardHTML(movie, index) {
  return movieCardHTML(movie).replace(
    '<article',
    `<article style="animation-delay:${index * 0.04}s"`
  );
}

/* ===========================================
   MOVIE CARD TEMPLATE
   =========================================== */
function movieCardHTML(movie) {
  const fav = isFav(movie.id);
  const starsStr = starsHTML(movie.rating);
  return `
    <article class="movie-card" data-id="${movie.id}" role="button" tabindex="0" aria-label="View details for ${movie.title}">
      <div class="movie-poster">
        <img src="${movie.poster}" alt="${movie.title} poster" loading="lazy"
             onerror="this.src='https://placehold.co/300x450/16161f/e8a020?text=${encodeURIComponent(movie.title)}'" />
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

  // BUG FIX 1: declare filtered with let (not implicit global)
  // BUG FIX 2: guard "All" case — previously always returned 0 movies
  let filtered = MOVIES;
  if (state.activeGenre !== "All") {
    filtered = MOVIES.filter(m =>
      m.genre.split(',').map(g => g.trim()).includes(state.activeGenre)
    );
  }

  title.textContent = state.activeGenre === "All" ? "All Movies" : state.activeGenre;

  // Apply view mode class (preserves display:grid set by hideSkeleton)
  grid.className = `movies-grid${state.viewMode === "row" ? " row-view" : ""}`;

  if (filtered.length === 0) {
    grid.innerHTML = '';
    noResults.style.display = "block";
  } else {
    noResults.style.display = "none";
    grid.innerHTML = filtered.map((m, i) => animatedCardHTML(m, i)).join('');
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
  // BUG FIX: guard description with || "" to avoid crash on null/undefined
  const results = MOVIES.filter(m =>
    m.title.toLowerCase().includes(q) ||
    m.genre.toLowerCase().includes(q) ||
    (m.description || '').toLowerCase().includes(q)
  );

  if (results.length === 0) {
    grid.innerHTML = '';
    noRes.style.display = "block";
    noQuery.textContent = query;
  } else {
    noRes.style.display = "none";
    grid.innerHTML = results.map((m, i) => animatedCardHTML(m, i)).join('');
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
    grid.innerHTML = favMovies.map((m, i) => animatedCardHTML(m, i)).join('');
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

  bg.classList.remove("zoom");
  // BUG FIX: use backdrop (not poster) for hero background
  bg.style.backgroundImage = `url('${movie.backdrop || movie.poster}')`;
  setTimeout(() => bg.classList.add("zoom"), 50);

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
  clearInterval(state.heroInterval);
  state.heroIndex = idx;
  renderHero(idx);
  startHeroAutoPlay();
}

function nextHero() {
  state.heroIndex = (state.heroIndex + 1) % FEATURED.length;
  renderHero(state.heroIndex);
}

function startHeroAutoPlay() {
  clearInterval(state.heroInterval); // prevent stacking intervals
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

  document.getElementById("modalOverlay").style.display = "flex";
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
    const favBtn = e.target.closest(".fav-btn");
    if (favBtn) return; // handled by inline onclick
    const card = e.target.closest(".movie-card");
    if (card) openModal(Number(card.dataset.id));
  });
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
   RECOMMENDATION API
   =========================================== */
async function getRecommendations(movieName) {
  try {
    const response = await fetch(`${API_BASE}/movies/recommend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ movie_name: movieName })
    });
    const data = await response.json();
    return data.recommendations || [];
  } catch (error) {
    console.error("Recommendation error:", error);
    return [];
  }
}

/* ===========================================
   BOOT — DOMContentLoaded
   =========================================== */
document.addEventListener("DOMContentLoaded", () => {

  // Show skeleton immediately while fetch is in-flight
  showSkeleton();

  // BUG FIX: fetch movies only ONCE (previously called twice)
  fetchMovies();

  // Theme toggle
  const themeBtn = document.getElementById("themeToggle");
  themeBtn.addEventListener("click", () => {
    state.isDark = !state.isDark;
    document.body.classList.toggle("dark-mode", state.isDark);
    document.body.classList.toggle("light-mode", !state.isDark);
    themeBtn.querySelector(".theme-icon").textContent = state.isDark ? "🌙" : "☀️";
  });

  // Hamburger / mobile menu
  const hamburger = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobileMenu");
  hamburger.addEventListener("click", () => {
    const open = hamburger.classList.toggle("open");
    hamburger.setAttribute("aria-expanded", open);
    mobileMenu.classList.toggle("open", open);
  });

  // Search input with debounce
  const searchInput = document.getElementById("searchInput");
  let searchDebounce;
  searchInput.addEventListener("input", (e) => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => {
      state.searchQuery = e.target.value;
      renderSearchResults(state.searchQuery);
    }, 300);
  });
});