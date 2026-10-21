// CineFind — prototype local. La base ci-dessous est volontairement petite.
const demoMovies = [
  {
    title: "Le Parrain",
    year: "1972",
    tags: ["famille", "mafia", "parrain", "crime", "mario puzo"],
    quotes: ["je vais lui faire une offre qu'il ne pourra pas refuser"],
    description: "Un chef de la mafia transmet peu à peu son pouvoir à son fils."
  },
  {
    title: "Titanic",
    year: "1997",
    tags: ["bateau", "océan", "mer", "paquebot", "romance", "iceberg", "naufrage"],
    quotes: ["je suis le roi du monde"],
    description: "Une histoire d'amour se déroule à bord du célèbre paquebot."
  },
  {
    title: "Star Wars : Un nouvel espoir",
    year: "1977",
    tags: ["espace", "étoiles", "sabres laser", "science fiction", "vaisseau", "force"],
    quotes: ["que la force soit avec toi"],
    description: "Un jeune héros rejoint une lutte contre un empire galactique."
  },
  {
    title: "Retour vers le futur",
    year: "1985",
    tags: ["voiture", "voyage dans le temps", "delorean", "science fiction", "horloge"],
    quotes: ["nom de zeus"],
    description: "Un adolescent voyage dans le temps grâce à une voiture modifiée."
  },
  {
    title: "Jurassic Park",
    year: "1993",
    tags: ["dinosaure", "dinosaures", "parc", "île", "laboratoire", "aventure"],
    quotes: ["la vie trouve toujours un chemin"],
    description: "Des scientifiques découvrent un parc peuplé de dinosaures recréés."
  },
  {
    title: "Harry Potter à l'école des sorciers",
    year: "2001",
    tags: ["magie", "sorcier", "sorcière", "école", "château", "baguette", "hibou"],
    quotes: ["tu es un sorcier harry"],
    description: "Un jeune garçon découvre le monde des sorciers."
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
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, " ")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ").trim();
}

function showMovies(movies, title, messageIfEmpty) {
  results.replaceChildren();
  resultsTitle.textContent = title;
  resultCount.textContent = `${movies.length} résultat${movies.length > 1 ? "s" : ""}`;

  if (!movies.length) {
    const card = document.createElement("article");
    card.className = "movie-card";
    const heading = document.createElement("h3");
    heading.textContent = "Aucun résultat dans la démo";
    const paragraph = document.createElement("p");
    paragraph.textContent = messageIfEmpty;
    card.append(heading, paragraph);
    results.append(card);
  } else {
    movies.forEach(movie => {
      const card = document.createElement("article");
      card.className = "movie-card";
      const year = document.createElement("div");
      year.className = "movie-year";
      year.textContent = movie.year;
      const heading = document.createElement("h3");
      heading.textContent = movie.title;
      const paragraph = document.createElement("p");
      paragraph.textContent = movie.description;
      card.append(year, heading, paragraph);
      results.append(card);
    });
  }
  resultsSection.classList.remove("hidden");
  resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

document.querySelector("#quoteSearch").addEventListener("click", () => {
  const query = normalize(quoteInput.value);
  if (!query) {
    quoteInput.focus();
    return;
  }
  const matches = demoMovies.filter(movie =>
    movie.quotes.some(quote => {
      const normalizedQuote = normalize(quote);
      return normalizedQuote.includes(query) || query.includes(normalizedQuote);
    })
  );
  showMovies(
    matches,
    "Résultats par réplique",
    "Cette réplique n'est pas dans notre petite base de démonstration. La version complète devra utiliser une base de dialogues plus large."
  );
});

document.querySelector("#sceneSearch").addEventListener("click", () => {
  const query = normalize(sceneInput.value);
  if (!query) {
    sceneInput.focus();
    return;
  }
  const terms = query.split(" ").filter(term => term.length > 2);
  const scored = demoMovies.map(movie => {
    const searchable = normalize(movie.title + " " + movie.tags.join(" ") + " " + movie.description);
    const score = terms.reduce((total, term) => total + (searchable.includes(term) ? 1 : 0), 0);
    return { movie, score };
  }).filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.movie);
  showMovies(
    scored,
    "Résultats par description",
    "Aucun film de la démo ne correspond à cette description. Pour reconnaître automatiquement une image, il faudra intégrer un modèle d'analyse visuelle."
  );
});

document.querySelector("#demoButton").addEventListener("click", () => {
  quoteInput.value = "Je suis le roi du monde";
  document.querySelector("#quoteTab").click();
  document.querySelector("#quoteSearch").click();
});

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
  if (currentImageUrl) URL.revokeObjectURL(currentImageUrl);
  currentImageUrl = URL.createObjectURL(file);
  preview.src = currentImageUrl;
  previewWrap.classList.remove("hidden");
});

document.querySelector("#removeImage").addEventListener("click", () => {
  if (currentImageUrl) URL.revokeObjectURL(currentImageUrl);
  currentImageUrl = null;
  preview.removeAttribute("src");
  imageInput.value = "";
  previewWrap.classList.add("hidden");
});
