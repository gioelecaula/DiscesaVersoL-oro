const inputRisposta = document.getElementById("quiz-answer");
const btnControlla = document.getElementById("quiz-check");
const btnSuccessivo = document.getElementById("quiz-next");
const risultato = document.getElementById("quiz-result");
const domandaEl = document.getElementById("quiz-question");

const domande = [
  { q: "Le Olimpiadi invernali si tengono in estate o in inverno?", a: ["inverno", "winter"] },
  { q: "Quale sport si gioca su ghiaccio con un disco e dei bastoni?", a: ["hockey", "hockey su ghiaccio", "ice hockey"] },
  { q: "Come si chiama lo sport invernale fatto su una tavola, con salti e halfpipe?", a: ["snowboard", "snow board"] },
  { q: "Quale sport invernale usa una slitta per due o quattro persone su pista ghiacciata?", a: ["bob", "bobsleigh", "bobsled"] },
  { q: "Come si chiama lo sport in cui si pattina e si eseguono salti e figure?", a: ["pattinaggio di figura", "pattinaggio", "figure skating"] }
];

let corrente = 0;

function mostraDomanda(idx) {
  const item = domande[idx % domande.length];
  domandaEl.textContent = item.q;
  risultato.textContent = "";
  inputRisposta.value = "";
  inputRisposta.focus();
}

function controllaRisposta() {
  const value = (inputRisposta.value || "").trim().toLowerCase();
  if (!value) {
    risultato.innerHTML = '<span class="quiz-ko">Per favore inserisci una risposta.</span>';
    return;
  }
  const accepted = domande[corrente].a;
  if (accepted.includes(value)) {
    risultato.innerHTML = '<span class="quiz-ok">Risposta corretta! Hai guadagnato una vita extra!</span>';
  } else {
    risultato.innerHTML = '<span class="quiz-ko">Risposta sbagliata. Riprova o passa alla successiva.</span>';
  }
}

btnControlla.addEventListener("click", controllaRisposta);
btnSuccessivo.addEventListener("click", () => {
  corrente = (corrente + 1) % domande.length;
  mostraDomanda(corrente);
});

// Mostra la prima domanda all'avvio
mostraDomanda(corrente);