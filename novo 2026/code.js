const CANDIDATOS = {
  "10": { nome: "Candidato oruam", img: "./img/10.jpg" },
  "20": { nome: "Candidato Bolsonaro Yagami", img: "./img/20.jpg" },
  "30": { nome: "Candidato L", img: "./img/30.jpg" },
  "40": { nome: "Candidato Mano Dayvin", img: "./img/40.jpg" },
  "50": { nome: "Candidato Jovem Tranquilão", img: "./img/50.jpg" }
};

const STORAGE_KEY = "urna_sim_votos_v1";

/* Criar mapa inicial */
function criarMapaVotosInicial() {
  return {
    BRANCO: 0,
    NULO: 0,
    ...Object.fromEntries(Object.keys(CANDIDATOS).map(k => [k, 0]))
  };
}

/* Funções de armazenamento */
function carregarVotos() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : criarMapaVotosInicial();
}

function salvarVotos(votos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(votos));
}

/* Função para tocar áudio seguro */
function playSafe(audio) {
  if (audio) audio.play().catch(() => {});
}

/* ================== Página de votação ================== */
function setupIndexPage() {
  const campo1 = document.getElementById("campo1");
  const campo2 = document.getElementById("campo2");
  const candidatoPane = document.getElementById("candidato");
  const musica = document.getElementById("musica");
  const confirmaAudio = document.getElementById("confirmaAudio");

  if (!campo1 || !campo2 || !candidatoPane) return;

  window.addEventListener("click", () => playSafe(musica), { once: true });

  function atualizarCandidato() {
    const numero = campo1.value + campo2.value;
    if (!/^\d{2}$/.test(numero)) {
      candidatoPane.innerHTML = `<p>Digite o número do candidato (2 dígitos)</p>`;
      return;
    }
    const c = CANDIDATOS[numero];
    candidatoPane.innerHTML = c
      ? `<strong>${c.nome}</strong><img src="${c.img}" alt="${c.nome}">`
      : `<strong>VOTO NULO</strong><p>Número: ${numero}</p>`;
  }

  function inserirDigito(n) {
    if (!campo1.value) campo1.value = n;
    else if (!campo2.value) campo2.value = n;
    atualizarCandidato();
  }

  function limparCampos() {
    campo1.value = "";
    campo2.value = "";
    candidatoPane.innerHTML = `<p>Digite o número do candidato (2 dígitos)</p>`;
  }

  function confirmaVoto() {
    const numero = campo1.value + campo2.value;
    const votos = carregarVotos();
    let chave = "NULO";
    if (/^\d{2}$/.test(numero) && CANDIDATOS[numero]) chave = numero;
    votos[chave]++;
    salvarVotos(votos);
    playSafe(confirmaAudio);

    alert(
      chave === "BRANCO"
        ? "Voto em BRANCO registrado."
        : chave === "NULO"
        ? "Voto NULO computado."
        : `${CANDIDATOS[chave].nome} (${chave}) — voto computado!`
    );

    limparCampos();
  }

  function votoBranco() {
    const votos = carregarVotos();
    votos.BRANCO++;
    salvarVotos(votos);
    playSafe(confirmaAudio);
    alert("Voto em BRANCO registrado.");
    limparCampos();
  }

  document.querySelectorAll(".num").forEach(btn =>
    btn.addEventListener("click", () => inserirDigito(btn.dataset.num))
  );
  document.getElementById("btnCorrige").addEventListener("click", limparCampos);
  document.getElementById("btnBranco").addEventListener("click", votoBranco);
  document.getElementById("btnConfirma").addEventListener("click", confirmaVoto);

  atualizarCandidato();
}

/* ================== Página de resultados ================== */
function setupResultadoPage() {
  const lista = document.getElementById("listaParciais");
  const totalEl = document.getElementById("totalVotos");
  const btnReset = document.getElementById("btnReset");
  const audioFim = document.getElementById("fimAudio");

  if (!lista || !totalEl) return;

  function mostrarParciais() {
    const votos = carregarVotos();
    lista.innerHTML = "";
    const total = Object.values(votos).reduce((a, b) => a + b, 0);
    totalEl.textContent = `Total de votos: ${total}`;

    Object.entries(votos).forEach(([key, qtd]) => {
      const nome = CANDIDATOS[key]?.nome || (key === "BRANCO" ? "Votos em Branco" : "Votos Nulos");
      const perc = total ? ((qtd / total) * 100).toFixed(1) : 0;

      const linha = document.createElement("div");
      linha.className = "item-parcial";
      linha.innerHTML = `
        <div class="label">${key === "BRANCO" || key === "NULO" ? nome : key + " — " + nome}</div>
        <div class="bar"><div class="fill" style="width:${perc}%;"></div></div>
        <div class="count">${qtd}</div>
      `;
      lista.appendChild(linha);
    });

    playSafe(audioFim);
  }

  btnReset.addEventListener("click", () => {
    if (confirm("Zerar todas as parciais?")) {
      salvarVotos(criarMapaVotosInicial());
      mostrarParciais();
    }
  });

  mostrarParciais();
}

/* ================== Inicialização ================== */
document.addEventListener("DOMContentLoaded", () => {
  setupIndexPage();
  setupResultadoPage();
});
