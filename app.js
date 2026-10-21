// CineFind V3 — recherche TMDB + reconnaissance expérimentale locale par CLIP.
const API_URL = 'https://cinefind-api.tonysadoun43.workers.dev';
const $ = selector => document.querySelector(selector);
const quoteInput = $('#quoteInput'), sceneInput = $('#sceneInput');
const resultsSection = $('#resultsSection'), results = $('#results');
const resultsTitle = $('#resultsTitle'), resultCount = $('#resultCount');
const status = $('#imageStatus');
const knownQuotes = [
  {title:'Titanic', quote:'je suis le roi du monde'},
  {title:'Le Parrain', quote:"je vais lui faire une offre qu il ne pourra pas refuser"},
  {title:'Star Wars', quote:'que la force soit avec toi'},
  {title:'Retour vers le futur', quote:'nom de zeus'},
  {title:'Jurassic Park', quote:'la vie trouve toujours un chemin'},
  {title:'Harry Potter', quote:'tu es un sorcier harry'}
];
// Des descriptions visuelles sont utilisées comme hypothèses, pas comme preuves.
const candidates = [
  ['Titanic','a romantic scene on an ocean liner ship, early 1900s, ship deck'],
  ['Jurassic Park','a giant dinosaur in a tropical jungle amusement park'],
  ['Star Wars','a space battle with spaceships and glowing laser swords'],
  ['Harry Potter','a young wizard with round glasses in a magical castle school'],
  ['Retour vers le futur','a futuristic sports car and time travel in a 1980s town'],
  ['Avatar','blue humanoid aliens in a glowing fantasy forest'],
  ['Le Seigneur des anneaux','a fantasy journey with elves and a medieval castle'],
  ['Batman Begins','a dark masked superhero in a black bat suit in a city'],
  ['Spider-Man','a red and blue masked superhero swinging among skyscrapers'],
  ['La Reine des neiges','an animated princess with ice powers in a snowy castle'],
  ['Le Roi Lion','animated lions on the African savanna'],
  ['Toy Story','animated plastic toys including a cowboy and an astronaut'],
  ['Pirates des Caraïbes','a pirate ship at sea with pirates wearing tricorn hats'],
  ['Interstellar','astronauts in space near a strange planet'],
  ['Matrix','a man wearing sunglasses and a black coat in a green tinted city'],
  ['Les Dents de la mer','a large shark swimming in the ocean'],
  ['Indiana Jones','an adventurer wearing a fedora exploring an ancient temple'],
  ['La La Land','a dancing couple in a colorful Los Angeles city at night'],
  ['Gladiator','a Roman gladiator fighting in an ancient arena'],
  ['Barbie','a pink fashion doll world with bright pink houses']
];
function normalize(text) {
  return text.toLocaleLowerCase('fr').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[’']/g,' ').replace(/[^a-z0-9\s-]/g,' ').replace(/\s+/g,' ').trim();
}
function reveal(title, count='') {
  resultsTitle.textContent = title;
  resultCount.textContent = count;
  resultsSection.classList.remove('hidden');
  resultsSection.scrollIntoView({behavior:'smooth',block:'start'});
}
function message(text, title='Recherche') {
  results.replaceChildren();
  const card=document.createElement('article'); card.className='movie-card'; card.textContent=text;
  results.append(card); reveal(title);
}
function showMovies(movies, title) {
  results.replaceChildren();
  if (!movies.length) {message('Aucun film trouvé.',title);return;}
  for (const movie of movies) {
    const card=document.createElement('article');card.className='movie-card';
    if(movie.poster_path && /^\/[a-zA-Z0-9/_-]+\.(jpg|png|webp)$/.test(movie.poster_path)) {
      const img=document.createElement('img');img.src='https://image.tmdb.org/t/p/w342'+movie.poster_path;
      img.alt='Affiche de '+movie.title;img.loading='lazy';
      img.style.cssText='width:130px;max-width:100%;border-radius:10px;margin-bottom:12px';card.append(img);
    }
    const year=document.createElement('div');year.className='movie-year';
    year.textContent=movie.release_date?.slice(0,4)||'Date inconnue';
    const h=document.createElement('h3');h.textContent=movie.title;
    const p=document.createElement('p');p.textContent=movie.overview||'Aucun résumé disponible.';
    card.append(year,h,p);results.append(card);
  }
  reveal(title,`${movies.length} résultat${movies.length>1?'s':''}`);
}
async function searchMovies(query,title) {
  message('Recherche en cours…',title);
  try {
    const response=await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}`);
    if(!response.ok)throw Error('API indisponible');
    const data=await response.json();showMovies(data.results||[],title);
  } catch(e) {message('Impossible de contacter CineFind API. Réessaie dans un instant.',title);console.error(e);}
}
$('#quoteSearch').addEventListener('click',()=>{
  const query=quoteInput.value.trim();if(!query){quoteInput.focus();return;}
  const norm=normalize(query);
  const match=knownQuotes.find(x=>normalize(x.quote).includes(norm)||norm.includes(normalize(x.quote)));
  searchMovies(match?.title||query,match?'Réplique connue : film possible':'Recherche par titre');
});
$('#sceneSearch').addEventListener('click',()=>{
  const q=sceneInput.value.trim();if(!q){sceneInput.focus();return;}searchMovies(q,'Recherche par titre');
});
$('#demoButton').addEventListener('click',()=>{
  quoteInput.value='Je suis le roi du monde';$('#quoteTab').click();$('#quoteSearch').click();
});
function tab(which) {
  for(const name of ['quote','image']) {
    const selected=name===which;
    $(`#${name}Tab`).classList.toggle('active',selected);
    $(`#${name}Tab`).setAttribute('aria-selected',String(selected));
    $(`#${name}Panel`).classList.toggle('hidden',!selected);
  }
}
$('#quoteTab').addEventListener('click',()=>tab('quote'));
$('#imageTab').addEventListener('click',()=>tab('image'));
const imageInput=$('#imageInput'), preview=$('#preview'), previewWrap=$('#previewWrap');
let currentImageUrl=null, classifierPromise=null;
imageInput.addEventListener('change',()=>{
  const file=imageInput.files?.[0];if(!file)return;
  if(!file.type.startsWith('image/')||file.size>8*1024*1024){
    status.textContent='Choisis une image JPG, PNG ou WebP de moins de 8 Mo.';imageInput.value='';return;
  }
  if(currentImageUrl)URL.revokeObjectURL(currentImageUrl);
  currentImageUrl=URL.createObjectURL(file);preview.src=currentImageUrl;
  previewWrap.classList.remove('hidden');status.textContent='Image prête pour analyse.';
});
$('#removeImage').addEventListener('click',()=>{
  if(currentImageUrl)URL.revokeObjectURL(currentImageUrl);
  currentImageUrl=null;preview.removeAttribute('src');imageInput.value='';
  previewWrap.classList.add('hidden');status.textContent='';
});
async function getClassifier() {
  if(!classifierPromise) {
    classifierPromise=import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2')
      .then(({pipeline,env})=>{
        env.allowLocalModels=false;
        return pipeline('zero-shot-image-classification','Xenova/clip-vit-base-patch32',{quantized:true});
      }).catch(err=>{classifierPromise=null;throw err;});
  }
  return classifierPromise;
}
$('#recognizeImage').addEventListener('click',async()=>{
  if(!currentImageUrl){status.textContent='Ajoute d’abord une capture d’écran.';imageInput.focus();return;}
  const button=$('#recognizeImage');button.disabled=true;
  status.textContent='Chargement du modèle IA (première fois : téléchargement volumineux)…';
  try {
    const classifier=await getClassifier();
    status.textContent='Analyse locale de la capture en cours…';
    // Le navigateur compare l'image aux descriptions ; ce n'est pas une recherche d'images de films.
    const scores=await classifier(currentImageUrl,candidates.map(x=>x[1]));
    const ranked=scores.slice(0,3).map(item=>({
      title:candidates.find(x=>x[1]===item.label)?.[0],score:item.score
    })).filter(x=>x.title);
    if(!ranked.length)throw Error('Aucun candidat');
    status.textContent='Hypothèses (pas des identifications certaines) : '+ranked.map(x=>x.title).join(' · ');
    // Recherche TMDB du candidat le mieux classé ; l'utilisateur peut essayer les autres.
    sceneInput.value=ranked[0].title;
    await searchMovies(ranked[0].title,'Suggestion IA : '+ranked[0].title);
  } catch(err) {
    console.error(err);
    status.textContent='Analyse indisponible sur ce navigateur ou ce réseau. Essaie sur Chrome récent, ou recherche par titre.';
  } finally {button.disabled=false;}
});
