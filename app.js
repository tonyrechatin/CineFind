
const API_URL = "https://cinefind-api.tonysadoun43.workers.dev";

const demoMovies = [
  {
    title: "Le Parrain",
    quotes: ["je vais lui faire une offre qu'il ne pourra pas refuser"]
  },
  {
    title: "Titanic",
    quotes: ["je suis le roi du monde"]
  },
  {
    title: "Star Wars",
    quotes: ["que la force soit avec toi"]
  },
  {
    title: "Retour vers le futur",
    quotes: ["nom de zeus"]
  },
  {
    title: "Jurassic Park",
    quotes: ["la vie trouve toujours un chemin"]
  },
  {
    title: "Harry Potter à l'école des sorciers",
    quotes: ["tu es un sorcier harry"]
  }
];

const quoteInput = document.querySelector("#quoteInput");
const sceneInput = document.querySelector("#sceneInput");
const resultsSection = document.querySelector("#resultsSection");
const results = document.querySelector("#results");
const resultsTitle = document.querySelector("#resultsTitle");
const resultCount = document.querySelector("#resultCount");

function normalize(text) {
  return text.toLocaleLowerCase("fr")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, " ")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function displayMessage(message) {
  results.replaceChildren();

  const card = document.createElement("article");
  card.className = "movie-card";
  card.textContent = message;

  results.append(card);
  resultsSection.classList.remove("hidden");
  resultCount.textContent = "";
  resultsSection.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

function showMovies(movies, title) {
  results.replaceChildren();
  resultsTitle.textContent = title;
  resultCount.textContent =
    `${movies.length} résultat${movies.length > 1 ? "s" : ""}`;

  if (!movies.length) {
    displayMessage("Aucun film trouvé.");
    return;
  }

  movies.forEach(movie => {
    const card = document.createElement("article");
    card.className = "movie-card";

    if (movie.poster_path) {
      const poster = document.createElement("img");
      poster.src =
        "https://image.tmdb.org/t/p/w342" + movie.poster_path;
      poster.alt = "Affiche de " + movie.title;
      poster.loading = "lazy";
      poster.style.width = "130px";
      poster.style.maxWidth = "100%";
      poster.style.borderRadius = "10px";
      poster.style.marginBottom = "12px";
      card.append(poster);
    }

    const year = document.createElement("div");
    year.className = "movie-year";
    year.textContent = movie.release_date
      ? movie.release_date.slice(0, 4)
      : "Date inconnue";

    const heading = document.createElement("h3");
    heading.textContent = movie.title;

    const description = document.createElement("p");
    description.textContent =
      movie.overview || "Aucun résumé disponible.";

    card.append(year, heading, description);
    results.append(card);
  });

  resultsSection.classList.remove("hidden");
  resultsSection.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

async function searchMovies(query, title) {
  resultsTitle.textContent = title;
  displayMessage("Recherche en cours...");

  try {
    const response = await fetch(
      API_URL + "/search?q=" + encodeURIComponent(query)
    );

    if (!response.ok) {
      throw new Error("Erreur API");
    }

    const data = await response.json();
    showMovies(data.results || [], title);
  } catch (error) {
    resultsTitle.textContent = title;
    displayMessage(
      "Impossible de contacter le serveur CineFind. Réessaie."
    );
    console.error(error);
  }
}

// Recherche par réplique connue ou par titre
document.querySelector("#quoteSearch").addEventListener("click", () => {
  const rawQuery = quoteInput.value.trim();
  const query = normalize(rawQuery);

  if (!query) {
    quoteInput.focus();
    return;
  }

  const match = demoMovies.find(movie =>
    movie.quotes.some(quote => {
      const normalized = normalize(quote);
      return normalized.includes(query) ||
        query.includes(normalized);
    })
  );

  if (match) {
    searchMovies(match.title, "Film reconnu par sa réplique");
  } else {
    searchMovies(rawQuery, "Recherche de films par titre");
  }
});

// Recherche textuelle de films
document.querySelector("#sceneSearch").addEventListener("click", () => {
  const query = sceneInput.value.trim();

  if (!query) {
    sceneInput.focus();
    return;
  }

  searchMovies(query, "Résultats de recherche");
});

// Bouton de démonstration
document.querySelector("#demoButton").addEventListener("click", () => {
  quoteInput.value = "Je suis le roi du monde";
  document.querySelector("#quoteTab").click();
  document.querySelector("#quoteSearch").click();
});

// Navigation entre les onglets
document.querySelector("#quoteTab").addEventListener("click", () => {
  document.querySelector("#quoteTab").classList.add("active");
  document.querySelector("#imageTab").classList.remove("active");
  document.querySelector("#quoteTab").setAttribute("aria-selected", "true");
  document.querySelector("#imageTab").setAttribute("aria-selected", "false");
  document.querySelector("#quotePanel").classList.remove("hidden");
  document.querySelector("#imagePanel").classList.add("hidden");
});

document.querySelector("#imageTab").addEventListener("click", () => {
  document.querySelector("#imageTab").classList.add("active");
  document.querySelector("#quoteTab").classList.remove("active");
  document.querySelector("#imageTab").setAttribute("aria-selected", "true");
  document.querySelector("#quoteTab").setAttribute("aria-selected", "false");
  document.querySelector("#imagePanel").classList.remove("hidden");
  document.querySelector("#quotePanel").classList.add("hidden");
});

// Prévisualisation des images
const imageInput = document.querySelector("#imageInput");
const preview = document.querySelector("#preview");
const previewWrap = document.querySelector("#previewWrap");

let currentImageUrl = null;

imageInput.addEventListener("change", () => {
  const file = imageInput.files && imageInput.files[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    imageInput.value = "";
    return;
  }

  if (currentImageUrl) {
    URL.revokeObjectURL(currentImageUrl);
  }

  currentImageUrl = URL.createObjectURL(file);
  preview.src = currentImageUrl;
  previewWrap.classList.remove("hidden");
});

document.querySelector("#removeImage").addEventListener("click", () => {
  if (currentImageUrl) {
    URL.revokeObjectURL(currentImageUrl);
  }

  currentImageUrl = null;
  preview.removeAttribute("src");
  imageInput.value = "";
  previewWrap.classList.add("hidden");
});
