let rilevatoreMano;
let videoCam;
let predizioni = [];
let imgSciatoreDX, imgSciatoreSX, imgVisualizzata, imgSfondo; 
let imgBandieraBlu, imgBandieraRossa, imgCuoriPista;
let imgSfondoDOM;
let musicaSfondo;

let sciatoreY, sciatoreX;
let sciatoreW = 180;
let sciatoreH = 150;
let velocitaY = 0;
let gravita = 0.8;
let forzaSalto = -15;
let aTerra = true;
let livelloSuolo;

// Corsie di movimento (binari)
let corsiaLeft;
let corsiaCentro;
let corsiaRight;
let corsiaAttuale; // la corsaia su cui si trova attualmente lo sciatore

// Gestione ostacoli (bandierine)
let ostacoli = [];
let tempoUltimoOstacolo = 0;
let intervallOstacoli = 5500; // ogni 5.5 secondi all'inizio (più lento)
let tempoInizioGioco = 0; // per tracciare il tempo di gioco
let velocitaBaseOstacoli = 0.6; // velocità iniziale (più lenta)
let velocitaMaxOstacoli = 4; // velocità massima
let tempoUltimoCuore = 0;
let intervalloCuore = 20000; // minimo 20s tra cuori

// Sistema di vite
let vite = 3; // vite iniziali
let ultimaPerdita = 0; // per evitare perdite multiple nella stessa collisione
let fineGioco = false; // flag per fine gioco

// Quiz extra vita
let quizExtra = false;
let domandaQuiz = "";
let risposteAccettate = [];
let opzioniQuiz = [];
let quizUsato = false; // flag per permettere solo un tentativo
let btnOpzione1, btnOpzione2, btnOpzione3;

// Domande quiz
const domandeQuiz = [
  { q: "Le Olimpiadi invernali si tengono in estate o in inverno?", a: ["inverno"], options: ["estate", "inverno", "primavera"] },
  { q: "Quale sport usa una palla su ghiaccio?", a: ["hockey"], options: ["hockey", "pattinaggio", "sci"] },
  { q: "Quale sport si fa con una slitta veloce?", a: ["bob"], options: ["bob", "skeleton", "snowboard"] },
  { q: "Quale sport si fa pattinando?", a: ["pattinaggio artistico"], options: ["pattinaggio artistico", "hockey", "bob"] },
  { q: "Quale sport si fa saltando con gli sci?", a: ["salto con gli sci"], options: ["salto con gli sci", "sci di fondo", "biathlon"] },
  { q: "Quale sport si fa sparando con gli sci?", a: ["biathlon"], options: ["biathlon", "salto con gli sci", "sci di fondo"] },
  { q: "Quale sport si fa con una tavola sulla neve?", a: ["snowboard"], options: ["snowboard", "skeleton", "bob"] },
  { q: "Quale sport si fa sdraiati su una slitta?", a: ["skeleton"], options: ["skeleton", "bob", "snowboard"] },
  { q: "Quale sport si fa camminando con gli sci?", a: ["sci di fondo"], options: ["sci di fondo", "salto con gli sci", "biathlon"] },
  { q: "In quale continente sono le Olimpiadi invernali?", a: ["europa"], options: ["europa", "asia", "america"] }
];

// Sistema di punteggio
let punteggio = 0; // punteggio iniziale
let punteggioFinale = 0; // punteggio quando il gioco finisce
let record = 0; // record salvato
let nuovoRecord = false; // flag per indicare se è un nuovo record

// Coordinate pulsante "Riprova"
let btnRiprovaX = 0;
let btnRiprovaY = 0;
let btnRiprova_w = 200;
let btnRiprovaH = 60;

// Coordinate pulsante "Vita Extra"
let btnVitaExtraX = 0;
let btnVitaExtraY = 0;
let btnVitaExtraW = 200;
let btnVitaExtraH = 60;
// Pausa
let pausa = false;
let pauseBtnX = 0;
let pauseBtnY1 = 0;
let pauseBtnY2 = 0;
let pauseBtnY3 = 0;
let pauseBtnW = 260;
let pauseBtnH = 64;
// Volume slider pausa
let volumeGioco = 0.5; // 0-1
let volumeSliderX = 0;
let volumeSliderY = 0;
let volumeSliderW = 280;
let volumeSliderH = 20;
let volumeBeingDragged = false;

class Ostacolo {
  constructor(x, tipo) {
    this.x = x;
    this.y = -50;
    this.w = 120;
    this.h = 120;
    // Calcola velocità basata sul tempo di gioco (aumenta ogni 10 secondi)
    let secondiGioco = (millis() - tempoInizioGioco) / 1000;
    this.velocita = min(velocitaBaseOstacoli + (secondiGioco / 15) * 1.2, velocitaMaxOstacoli);
    // Assicurati che non sia più veloce dell'ostacolo più vicino davanti nella stessa corsia
    let maxVelocita = this.velocita;
    for (let ost of ostacoli) {
      if (ost.x === this.x && ost.y > this.y) {
        maxVelocita = min(maxVelocita, ost.velocita);
      }
    }
    this.velocita = maxVelocita;
    this.tipo = tipo; // 'blu' o 'rosso'
  }

  display() {
    if (this.tipo === 'blu') {
      image(imgBandieraBlu, this.x, this.y, this.w, this.h);
    } else if (this.tipo === 'rosso') {
      image(imgBandieraRossa, this.x, this.y, this.w, this.h);
    } else if (this.tipo === 'cuore') {
      image(imgCuoriPista, this.x, this.y, this.w, this.h);
    }
  }

  update() {
    this.y += this.velocita;
  }

  fuoriDalloSchermo() {
    return this.y > height + 50;
  }

  collisionaConSciatore(sx, sy, sw, sh) {
    return (
      this.x < sx + sw / 2 &&
      this.x + this.w > sx - sw / 2 &&
      this.y < sy + sh / 2 &&
      this.y + this.h > sy - sh / 2
    );
  }
}

// Funzione per disegnare un cuore
function disegnaCuore(x, y, dimensione) {
  push();
  fill(255, 0, 0); // Rosso
  noStroke();
  
  // Disegna un cuore semplice usando bezier
  const d = dimensione / 2;
  
  // Due semicerchi in alto
  arc(x - d * 0.5, y - d * 0.3, d, d, PI, TWO_PI, CHORD);
  arc(x + d * 0.5, y - d * 0.3, d, d, PI, TWO_PI, CHORD);
  
  // Triangolo in basso
  triangle(x - d, y - d * 0.3, x + d, y - d * 0.3, x, y + d * 0.7);
  
  pop();
}
function corsieOccupateAlloStessoPiano(altezzaSoglia = 120) {
  const corsieOccupate = {
    sinistra: false,
    centro: false,
    destra: false
  };
  
  // Controlla gli ostacoli nel raggio di altezza specificato
  for (let ostacolo of ostacoli) {
    // Considera solo ostacoli che non sono troppo alti (già passati)
    if (ostacolo.y > -100 && ostacolo.y < height + 100) {
      // Determina quale corsaia contiene questo ostacolo
      let distanzaSx = abs(ostacolo.x - (width / 4));
      let distanzaCentro = abs(ostacolo.x - (width / 2));
      let distanzaDx = abs(ostacolo.x - ((width / 4) * 3));
      
      if (distanzaSx < 150) corsieOccupate.sinistra = true;
      if (distanzaCentro < 150) corsieOccupate.centro = true;
      if (distanzaDx < 150) corsieOccupate.destra = true;
    }
  }
  
  return corsieOccupate;
}

// Funzione per scegliere una corsaia che non sia allineata con le altre
function scegliCorsiaNonAllineata() {
  const occupate = corsieOccupateAlloStessoPiano();
  const possibili = [];
  
  if (!occupate.sinistra) possibili.push('sinistra');
  if (!occupate.centro) possibili.push('centro');
  if (!occupate.destra) possibili.push('destra');
  
  // Se tutte le corsie sono occupate, scegli comunque una a caso
  if (possibili.length === 0) {
    return random(['sinistra', 'centro', 'destra']);
  }
  
  return random(possibili);
}


// Funzione per disegnare le vite in alto a sinistra
function disegnaVite() {
  push();
  
  // Disegna i cuori usando l'immagine
  imageMode(CORNER);
  for (let i = 0; i < vite; i++) {
    image(imgCuoriPista, 20 + i * 55, 15, 45, 45);
  }
  
  pop();
}

// Funzione per disegnare Game Over
function disegnaFineGioco() {
  push();
  // Overlay scuro
  fill(0, 0, 0, 200);
  rect(0, 0, width, height);
  
  // Testo GAME OVER
  fill(255, 0, 0);
  textAlign(CENTER, CENTER);
  textSize(80);
  textStyle(BOLD);
  text('GAME OVER', width / 2, height / 2 - 120);
  
  // Punteggio attuale
  fill(255, 215, 0); // Oro
  textSize(56);
  textStyle(BOLD);
  text('Punteggio: ' + punteggioFinale, width / 2, height / 2 - 30);
  
  // Record con animazione se è nuovo
  if (nuovoRecord) {
    fill(255, 100, 100); // Rosso per nuovo record
    textSize(48);
    textStyle(BOLD);
    text('🎉 NUOVO RECORD! 🎉', width / 2, height / 2 + 35);
    text('Record: ' + record, width / 2, height / 2 + 95);
  } else {
    fill(200, 200, 200); // Grigio per record precedente
    textSize(32);
    textStyle(NORMAL);
    text('Record: ' + record, width / 2, height / 2 + 50);
  }
  
  // Disegna pulsante "Riprova"
  disegnaPulsanteRiprova();
  
  // Disegna pulsante "Vita Extra" solo se non già usato
  if (!quizUsato) {
    disegnaPulsanteVitaExtra();
  }
  
  pop();
}

// Funzione per disegnare il pulsante "Riprova"
function disegnaPulsanteRiprova() {
  // Coordinate del pulsante
  btnRiprovaX = width / 2 - btnRiprova_w / 2;
  btnRiprovaY = height / 2 + 160;
  
  // Sfondo pulsante
  fill(0, 150, 0); // Verde
  stroke(255);
  strokeWeight(3);
  rectMode(CORNER);
  rect(btnRiprovaX, btnRiprovaY, btnRiprova_w, btnRiprovaH, 10);
  
  // Testo pulsante
  fill(255);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(28);
  textStyle(BOLD);
  text('RIPROVA', width / 2, btnRiprovaY + btnRiprovaH / 2);
}

// Funzione per disegnare il pulsante "Vita Extra"
function disegnaPulsanteVitaExtra() {
  // Coordinate del pulsante
  btnVitaExtraX = width / 2 - btnVitaExtraW / 2;
  btnVitaExtraY = height / 2 + 240;
  
  // Sfondo pulsante
  fill(150, 0, 150); // Viola
  stroke(255);
  strokeWeight(3);
  rectMode(CORNER);
  rect(btnVitaExtraX, btnVitaExtraY, btnVitaExtraW, btnVitaExtraH, 10);
  
  // Testo pulsante
  fill(255);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(24);
  textStyle(BOLD);
  text('VITA EXTRA', width / 2, btnVitaExtraY + btnVitaExtraH / 2);
}

// Funzione per disegnare il quiz extra
function disegnaQuizExtra() {
  push();
  // Sfondo pulito azzurro chiaro
  fill(240, 248, 255);
  rect(0, 0, width, height);
  
  // Titolo semplice
  fill(0, 100, 200);
  textAlign(CENTER, CENTER);
  textSize(50);
  textStyle(BOLD);
  text('QUIZ', width / 2, height / 2 - 200);
  
  // Riquadro grande per la domanda
  fill(255);
  stroke(0, 100, 200);
  strokeWeight(8);
  rect(width / 2 - 450, height / 2 - 140, 900, 180, 30);
  fill(0);
  noStroke();
  textSize(32);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  text(domandaQuiz, width / 2, height / 2 - 50);
  
  // Istruzioni semplici
  fill(0, 100, 200);
  textSize(24);
  textStyle(NORMAL);
  text('Scegli la risposta corretta', width / 2, height / 2 + 60);
  
  pop();
  
  // Pulsanti opzioni sono già mostrati
}

const LARG_CAM = 640;
const ALT_CAM = 480;

function preload() {
  const idScelto = localStorage.getItem('personaggioScelto');
  // Trova il personaggio, se non esiste usa il primo
  const datiGiocatore = personaggi.find(p => p.id === idScelto) || personaggi[0];
  
  imgSciatoreDX = loadImage(datiGiocatore.imgDX);
  imgSciatoreSX = loadImage(datiGiocatore.imgSX);
  // sfondo ora caricato come elemento DOM animato (createImg)
  // imgSfondo = loadImage('./img/sfondo.gif');
  imgBandieraBlu = loadImage('./img/bandieraBlu.png');
  imgBandieraRossa = loadImage('./img/bandierinaRossa.png');
  imgCuoriPista = loadImage('./img/cuoriPista.png');
  // Carica musica di sottofondo (loop)
  musicaSfondo = loadSound('./img/audiocoffee-rock-trailer-no-copyright-music-469216.mp3');
  
  // Impostazione iniziale per evitare che imgVisualizzata sia vuota all'inizio
  imgVisualizzata = imgSciatoreDX;
}

function setup() {
  const cnv = createCanvas(windowWidth, windowHeight);
  cnv.style('z-index', '1');
  cnv.style('position', 'relative');
  // Crea un elemento DOM per il GIF animato come sfondo (dietro la canvas)
  imgSfondoDOM = createImg('./img/sfondo.gif', 'sfondo');
  imgSfondoDOM.size(windowWidth, windowHeight);
  imgSfondoDOM.position(0, 0);
  imgSfondoDOM.style('z-index', '-1');
  imgSfondoDOM.style('object-fit', 'cover');
  videoCam = createCapture(VIDEO);
  videoCam.size(LARG_CAM, ALT_CAM);
  videoCam.hide();
  
  // Carica il record precedente da localStorage
  let recordSalvato = localStorage.getItem('recordGioco');
  record = recordSalvato ? parseInt(recordSalvato) : 0;
  
  // Inizializza le tre corsie
  corsiaLeft = width / 4;
  corsiaCentro = width / 2;
  corsiaRight = (width / 4) * 3;
  corsiaAttuale = corsiaCentro; // parte dalla corsia centrale
  
  livelloSuolo = height - 120; 
  sciatoreY = livelloSuolo;
  sciatoreX = corsiaAttuale;

  // Nascondi il titolo in alto (se presente) quando parte il gioco
  const titolo = document.querySelector('h1');
  if (titolo) titolo.style.display = 'none';

  // Inizia il timer di gioco
  tempoInizioGioco = millis();
  
  // Crea pulsanti per opzioni quiz
  btnOpzione1 = createButton('');
  btnOpzione1.position(width / 2 - 200, height / 2 + 100);
  btnOpzione1.size(150, 50);
  btnOpzione1.hide();
  btnOpzione1.style('z-index', '10');
  btnOpzione1.mousePressed(() => controllaRispostaQuiz(0));
  
  btnOpzione2 = createButton('');
  btnOpzione2.position(width / 2 - 50, height / 2 + 100);
  btnOpzione2.size(150, 50);
  btnOpzione2.hide();
  btnOpzione2.style('z-index', '10');
  btnOpzione2.mousePressed(() => controllaRispostaQuiz(1));
  
  btnOpzione3 = createButton('');
  btnOpzione3.position(width / 2 + 100, height / 2 + 100);
  btnOpzione3.size(150, 50);
  btnOpzione3.hide();
  btnOpzione3.style('z-index', '10');
  btnOpzione3.mousePressed(() => controllaRispostaQuiz(2));

  rilevatoreMano = ml5.handpose(videoCam, () => console.log("IA Pronta"));
  rilevatoreMano.on("predict", results => predizioni = results);

  // Avvia la musica se possibile (alcuni browser richiedono un'interazione utente)
  if (musicaSfondo) {
    let volSalvato = localStorage.getItem('gameVolume');
    // Converte da 0-100 a 0-1 (salvato come 0-100 da volume.js)
    volumeGioco = volSalvato ? parseFloat(volSalvato) / 100 : 0.5;
    musicaSfondo.setVolume(volumeGioco);
    musicaSfondo.loop();
  }
}

function controllaRispostaQuiz(index) {
  const selected = opzioniQuiz[index].toLowerCase();
  if (risposteAccettate.includes(selected)) {
    // Risposta corretta: ripristina gioco con 1 vita
    vite = 1;
    punteggio = punteggioFinale; // mantiene il punteggio
    fineGioco = false;
    quizExtra = false;
    nascondiPulsantiQuiz();
  } else {
    // Risposta sbagliata: torna a game over e disabilita futuri quiz
    quizUsato = true;
    quizExtra = false;
    nascondiPulsantiQuiz();
  }
}

function nascondiPulsantiQuiz() {
  btnOpzione1.hide();
  btnOpzione2.hide();
  btnOpzione3.hide();
}

function avviaQuizExtra() {
  // Seleziona una domanda casuale
  const idx = floor(random(domandeQuiz.length));
  const item = domandeQuiz[idx];
  domandaQuiz = item.q;
  risposteAccettate = item.a;
  opzioniQuiz = item.options;
  quizExtra = true;
  btnOpzione1.html(opzioniQuiz[0]);
  btnOpzione2.html(opzioniQuiz[1]);
  btnOpzione3.html(opzioniQuiz[2]);
  btnOpzione1.show();
  btnOpzione2.show();
  btnOpzione3.show();
}

function draw() {
  // pulisce la canvas (lo sfondo animato è gestito dal GIF DOM `imgSfondoDOM`)
  clear();
  
  // Controlla se il gioco è finito
  if (vite <= 0) {
    fineGioco = true;
    punteggioFinale = punteggio;
    
    // Controlla se è un nuovo record
    if (punteggio > record) {
      record = punteggio; // Aggiorna il record
      nuovoRecord = true; // Flag per mostrare l'animazione
      localStorage.setItem('recordGioco', record); // Salva il record
      console.log('Nuovo record: ' + record);
    }
  }
  
  // Se il gioco è finito e non è in quiz extra, mostra Game Over
  if (fineGioco && !quizExtra) {
    disegnaFineGioco();
    return; // Ferma l'esecuzione
  }
  
  // Se quiz extra, mostra quiz
  if (quizExtra) {
    disegnaQuizExtra();
    return;
  }
  
  // Se non siamo in pausa, esegui gli update
  if (!pausa) {
    // --- AUMENTO PUNTEGGIO ---
    punteggio++;

    // --- 1. FISICA SEMPRE ATTIVA ---
    sciatoreY += velocitaY;
    if (sciatoreY < livelloSuolo) {
      velocitaY += gravita;
      aTerra = false;
    } else {
      sciatoreY = livelloSuolo;
      velocitaY = 0;
      aTerra = true;
    }

    // --- 2. GESTIONE MOVIMENTO (CORSIE) ---
    if (predizioni.length > 0) {
      let prediction = predizioni[0];
      if (prediction.landmarks && prediction.landmarks.length > 0) {
        let rawX = prediction.landmarks[0][0];
        let rawY = prediction.landmarks[0][1];
        let handX = map(rawX, 0, LARG_CAM, 0, width);
        handX = width - handX;
        let handY = rawY;

        let distanzaSinistra = abs(handX - corsiaLeft);
        let distanzaCentro = abs(handX - corsiaCentro);
        let distanzaDestra = abs(handX - corsiaRight);
        let vecchiaCorsia = corsiaAttuale;
        if (distanzaSinistra < distanzaCentro && distanzaSinistra < distanzaDestra) corsiaAttuale = corsiaLeft;
        else if (distanzaDestra < distanzaCentro && distanzaDestra < distanzaSinistra) corsiaAttuale = corsiaRight;
        else corsiaAttuale = corsiaCentro;
        sciatoreX = lerp(sciatoreX, corsiaAttuale, 0.15);
        if (corsiaAttuale > vecchiaCorsia + 5) imgVisualizzata = imgSciatoreDX;
        else if (corsiaAttuale < vecchiaCorsia - 5) imgVisualizzata = imgSciatoreSX;
        if (handY < ALT_CAM * 0.30 && aTerra) velocitaY = forzaSalto;
      }
    }

    // --- GESTIONE OSTACOLI (generazione e update) ---
    if (millis() - tempoInizioGioco > 10000 && millis() - tempoUltimoOstacolo > intervallOstacoli) {
      let posizioneCasuale = random(['sinistra', 'centro', 'destra']);
      let posX;
      if (posizioneCasuale === 'sinistra') posX = width / 4;
      else if (posizioneCasuale === 'centro') posX = width / 2;
      else posX = (width / 4) * 3;
      // Conta quanti ostacoli ravvicinati nella stessa colonna
      let countRavvicinati = 0;
      for (let ost of ostacoli) {
        if (ost.x === posX && ost.y > height - 300) {
          countRavvicinati++;
        }
      }
      if (countRavvicinati < 2) {
        let tipoBandiera;
        if (vite < 3 && (millis() - tempoUltimoCuore > intervalloCuore) && random() < 0.06) { tipoBandiera = 'cuore'; tempoUltimoCuore = millis(); }
        else tipoBandiera = random() > 0.5 ? 'blu' : 'rosso';
        ostacoli.push(new Ostacolo(posX, tipoBandiera));
        tempoUltimoOstacolo = millis();
        if (punteggio > 2500) {
          let decrease = 20 + floor((punteggio - 2500) / 300);
          intervallOstacoli = max(600, intervallOstacoli - decrease);
        }
      }
    }

    for (let i = ostacoli.length - 1; i >= 0; i--) {
      ostacoli[i].update();
      // collisioni solo se in update
      if (ostacoli[i].collisionaConSciatore(sciatoreX, sciatoreY, sciatoreW, sciatoreH)) {
        if (ostacoli[i].tipo === 'cuore') {
          if (millis() - ultimaPerdita > 500) { vite = min(3, vite + 1); ultimaPerdita = millis(); }
        } else {
          if (ostacoli[i].y < sciatoreY && millis() - ultimaPerdita > 500) { vite--; ultimaPerdita = millis(); }
        }
        ostacoli.splice(i, 1);
      } else if (ostacoli[i].fuoriDalloSchermo()) {
        ostacoli.splice(i, 1);
      }
    }

    // Limiti dello schermo per non perdere lo sciatore
    sciatoreX = constrain(sciatoreX, sciatoreW/2, width - sciatoreW/2);
  }

  // Sempre: disegna ostacoli (senza aggiornarli se in pausa)
  for (let i = 0; i < ostacoli.length; i++) {
    ostacoli[i].display();
  }

  // --- VISUALIZZAZIONE VITE ---
  disegnaVite();

  // --- VISUALIZZAZIONE FEED VIDEO ---
  let videoScale = 220; // Larghezza della preview video
  let videoHeight = (videoScale * ALT_CAM) / LARG_CAM; // Mantieni aspect ratio
  let videoX = width - videoScale - 10;
  let videoY = 10;
  
  push();
  imageMode(CORNER);
  image(videoCam, videoX, videoY, videoScale, videoHeight);
  stroke(255);
  strokeWeight(2);
  noFill();
  rect(videoX, videoY, videoScale, videoHeight);
  pop();

  // --- VISUALIZZAZIONE PUNTEGGIO ---
  push();
  fill(255, 215, 0); // Oro
  textAlign(LEFT, TOP);
  textSize(28);
  textStyle(BOLD);
  text('Punteggio: ' + punteggio, videoX, videoY + videoHeight + 15);
  pop();

  // --- 3. DISEGNO ---
  push();
  imageMode(CENTER);
  if (imgVisualizzata) {
    image(imgVisualizzata, sciatoreX, sciatoreY, sciatoreW, sciatoreH);
  }
  pop();

  // Se siamo in pausa, disegna overlay pausa (sopra tutto)
  if (pausa) {
    // Calcola posizioni pulsanti in base alla finestra
    pauseBtnX = width/2 - pauseBtnW/2;
    pauseBtnY1 = height/2 - 20;
    pauseBtnY2 = pauseBtnY1 + pauseBtnH + 18;
    pauseBtnY3 = pauseBtnY2 + pauseBtnH + 18;

    // Calcola posizioni slider volume
    volumeSliderX = width/2 - volumeSliderW/2;
    volumeSliderY = pauseBtnY3 + pauseBtnH + 40;

    push();
    // Sfondo semi-trasparente
    fill(0, 0, 0, 180);
    rect(0, 0, width, height);

    // Titolo PAUSA
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(72);
    textStyle(BOLD);
    text('PAUSA', width/2, height/2 - 140);

    // Pulsante RICOMINCIA
    fill(40, 140, 40);
    stroke(255);
    strokeWeight(2);
    rectMode(CORNER);
    rect(pauseBtnX, pauseBtnY1, pauseBtnW, pauseBtnH, 10);
    fill(255);
    noStroke();
    textSize(26);
    textStyle(BOLD);
    text('RICOMINCIA', width/2, pauseBtnY1 + pauseBtnH/2);

    // Pulsante RIPRENDI
    fill(30, 120, 200);
    stroke(255);
    strokeWeight(2);
    rect(pauseBtnX, pauseBtnY2, pauseBtnW, pauseBtnH, 10);
    fill(255);
    noStroke();
    text('RIPRENDI', width/2, pauseBtnY2 + pauseBtnH/2);

    // Pulsante TORNA AL MENU
    fill(180, 40, 40);
    stroke(255);
    strokeWeight(2);
    rect(pauseBtnX, pauseBtnY3, pauseBtnW, pauseBtnH, 10);
    fill(255);
    noStroke();
    text('TORNA AL MENU', width/2, pauseBtnY3 + pauseBtnH/2);

    // --- VOLUME SLIDER ---
    fill(255);
    noStroke();
    textSize(18);
    textStyle(BOLD);
    textAlign(LEFT, CENTER);
    text('Volume', volumeSliderX, volumeSliderY);

    // Sfondo slider
    fill(80, 80, 80);
    stroke(255);
    strokeWeight(1);
    rect(volumeSliderX, volumeSliderY + 20, volumeSliderW, volumeSliderH, 5);

    // Barra riempimento
    fill(0, 150, 255);
    noStroke();
    rect(volumeSliderX, volumeSliderY + 20, volumeSliderW * volumeGioco, volumeSliderH, 5);

    // Pallina (thumb) del slider
    fill(255);
    stroke(255);
    strokeWeight(2);
    circle(volumeSliderX + volumeSliderW * volumeGioco, volumeSliderY + 20 + volumeSliderH/2, 15);

    // Percentuale volume
    fill(255);
    noStroke();
    textSize(16);
    textAlign(LEFT, CENTER);
    text(int(volumeGioco * 100) + '%', volumeSliderX + volumeSliderW + 15, volumeSliderY + 20 + volumeSliderH/2);

    pop();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  livelloSuolo = height - 120;
  // Aggiorna le corsie quando lo schermo si ridimensiona
  corsiaLeft = width / 4;
  corsiaCentro = width / 2;
  corsiaRight = (width / 4) * 3;
  sciatoreX = corsiaAttuale;
  // ridimensiona sfondo DOM se presente
  if (typeof imgSfondoDOM !== 'undefined' && imgSfondoDOM) {
    imgSfondoDOM.size(windowWidth, windowHeight);
    imgSfondoDOM.position(0, 0);
  }
}

// Funzione per resettare il gioco
function resetGioco() {
  // Reset delle variabili principali
  punteggio = 0;
  punteggioFinale = 0;
  nuovoRecord = false;
  vite = 3;
  fineGioco = false;
  quizExtra = false;
  quizUsato = false; // reset del flag quiz
  aTerra = true;
  velocitaY = 0;
  pausa = false; // Assicurati che pausa sia disattivata
  
  // Reset della posizione dello sciatore
  sciatoreY = livelloSuolo;
  sciatoreX = corsiaCentro;
  corsiaAttuale = corsiaCentro;
  
  // Reset degli ostacoli
  ostacoli = [];
  tempoUltimoOstacolo = 0;
  intervallOstacoli = 3500;
  tempoInizioGioco = millis();
  velocitaBaseOstacoli = 1;
  
  // Reset ultimo perdita
  ultimaPerdita = 0;
  
  // Resetta immagine iniziale
  imgVisualizzata = imgSciatoreDX;
  
  // Nascondi elementi quiz
  nascondiPulsantiQuiz();
  
  // Riprendi musica se in loop
  if (musicaSfondo && !musicaSfondo.isPlaying()) {
    musicaSfondo.play();
  }
  
  console.log('Gioco resettato!');
}

// Funzione mousePressed per rilevare i click
function mousePressed() {
  // Se il gioco è finito e clicca sul pulsante Riprova
  if (fineGioco) {
    if (mouseX > btnRiprovaX && mouseX < btnRiprovaX + btnRiprova_w &&
        mouseY > btnRiprovaY && mouseY < btnRiprovaY + btnRiprovaH) {
      resetGioco(); // Riprendi il gioco
      return false; // Previeni comportamenti di default
    }
    // Se clicca sul pulsante Vita Extra
    if (!quizUsato && mouseX > btnVitaExtraX && mouseX < btnVitaExtraX + btnVitaExtraW &&
        mouseY > btnVitaExtraY && mouseY < btnVitaExtraY + btnVitaExtraH) {
      avviaQuizExtra();
      return false;
    }
  }

  // Se siamo in pausa, gestisci i tre pulsanti della schermata di pausa e lo slider volume
  if (pausa) {
    // Controlla se il click è sullo slider volume
    if (mouseY > volumeSliderY + 20 && mouseY < volumeSliderY + 20 + volumeSliderH &&
        mouseX > volumeSliderX && mouseX < volumeSliderX + volumeSliderW) {
      volumeBeingDragged = true;
      // Applica il volume immediatamente
      volumeGioco = constrain((mouseX - volumeSliderX) / volumeSliderW, 0, 1);
      if (musicaSfondo) {
        musicaSfondo.setVolume(volumeGioco);
        localStorage.setItem('gameVolume', int(volumeGioco * 100));
      }
      return false;
    }

    if (mouseX > pauseBtnX && mouseX < pauseBtnX + pauseBtnW) {
      // RICOMINCIA
      if (mouseY > pauseBtnY1 && mouseY < pauseBtnY1 + pauseBtnH) {
        resetGioco();
        pausa = false;
        return false;
      }
      // RIPRENDI
      if (mouseY > pauseBtnY2 && mouseY < pauseBtnY2 + pauseBtnH) {
        pausa = false;
        return false;
      }
      // TORNA AL MENU
      if (mouseY > pauseBtnY3 && mouseY < pauseBtnY3 + pauseBtnH) {
        window.location.href = 'menu.html';
        return false;
      }
    }
  }
}

// Gestione tasti: premi ESC per attivare/disattivare la pausa
function keyPressed() {
  if (keyCode === ESCAPE) {
    if (musicaSfondo) {
      if (pausa) {
        musicaSfondo.play(); // Riprendi musica
      } else {
        musicaSfondo.pause(); // Metti in pausa musica
      }
    }
    pausa = !pausa;
    return false; // Previene comportamento di default (es. uscita fullscreen)
  }
}