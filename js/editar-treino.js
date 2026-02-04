import { db } from './app_global.js';
import {
    collection,
    doc,
    getDoc,
    setDoc,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// Proteção: Verifica autenticação
window.verificarAuthDashboard();

// Estado local
let alunoEdicaoId = null;
let diaAtual = 'segunda';
let treinoCache = {};
let exerciciosBiblioteca = [];
let exercicioIndexAtual = null;
let trainerId = sessionStorage.getItem("adminId");
const diasSemana = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    alunoEdicaoId = params.get('id');
    const nome = params.get('nome');

    if (!alunoEdicaoId) {
        alert("ID do aluno não fornecido.");
        window.location.href = 'dashboard.html';
        return;
    }

    document.getElementById('alunoEmEdicao').innerText = nome || 'Aluno';
    resetCache();
    await carregarTreino();
    await carregarBiblioteca();

    // Detectar dia da semana atual
    const diasMap = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
    const hoje = new Date().getDay();
    diaAtual = diasMap[hoje];

    // Ativar a aba do dia atual
    document.querySelectorAll('.day-tab').forEach((tab, index) => {
        tab.classList.remove('active');
        if (diasSemana[index] === diaAtual) {
            tab.classList.add('active');
        }
    });

    renderizarDia();
});

function resetCache() {
    treinoCache = {};
    diasSemana.forEach(d => treinoCache[d] = []);
}

async function carregarTreino() {
    try {
        const docSnap = await getDoc(doc(db, "workouts", alunoEdicaoId));
        if (docSnap.exists()) {
            treinoCache = docSnap.data().days || {};
            diasSemana.forEach(d => { if (!treinoCache[d]) treinoCache[d] = []; });
        } else {
            resetCache();
        }
    } catch (e) {
        console.error("Erro ao carregar treinos:", e);
        showToast("Erro ao carregar treinos.", true);
    }
}

window.mudarDia = function (dia, elemento) {
    diaAtual = dia;
    document.querySelectorAll('.day-tab').forEach(tab => tab.classList.remove('active'));
    elemento.classList.add('active');
    renderizarDia();
};

function renderizarDia() {
    const container = document.getElementById('containerDias');
    container.innerHTML = '';

    const exercicios = treinoCache[diaAtual] || [];
    const divDia = document.createElement('div');
    divDia.className = 'day-content active';
    divDia.innerHTML = `
        <div class="card shadow-sm mb-3" style="border-radius: 20px;">
            <h5 class="mb-3" style="text-transform: capitalize; color: var(--primary); font-weight: 700;">${diaAtual}</h5>
            <div id="listaExercicio"></div>
            <button onclick="window.addExercicioNoDia()" class="btn btn-primary w-100 mt-3">
                <i class="bi bi-plus-lg me-1"></i> Adicionar Exercício
            </button>
        </div>
    `;
    container.appendChild(divDia);

    const lista = divDia.querySelector('#listaExercicio');
    exercicios.forEach((ex, index) => {
        const row = document.createElement('div');
        row.className = 'card mb-3 p-3 border';
        row.style.borderRadius = '16px';
        row.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="mb-0 fw-bold text-primary">Exercício ${index + 1}</h6>
                <button class="btn btn-sm btn-danger btn-icon-sm" onclick="window.removerExercicioNoDia(${index})" title="Remover">
                    <i class="bi bi-trash3"></i>
                </button>
            </div>
            <div class="row g-2">
                <div class="col-12 col-md-6">
                    <label class="form-label small text-muted fw-bold">Nome</label>
                    <div class="input-group input-group-sm">
                        <input type="text" class="form-control" value="${ex.name || ''}" onchange="window.updateExercicioNome('${diaAtual}', ${index}, this.value)">
                        <button class="btn btn-outline-primary" onclick="window.abrirBiblioteca(${index})" title="Buscar na Biblioteca">
                            <i class="bi bi-search"></i>
                        </button>
                    </div>
                </div>
                <div class="col-6 col-md-3">
                    <label class="form-label small text-muted fw-bold">Séries</label>
                    <input type="text" class="form-control form-control-sm" value="${ex.sets || ''}" onchange="window.updateExercicioSets('${diaAtual}', ${index}, this.value)">
                </div>
                <div class="col-6 col-md-3">
                    <label class="form-label small text-muted fw-bold">Reps</label>
                    <input type="text" class="form-control form-control-sm" value="${ex.reps || ''}" onchange="window.updateExercicioReps('${diaAtual}', ${index}, this.value)">
                </div>
                <div class="col-12 col-md-6">
                    <label class="form-label small text-muted fw-bold">Descanso</label>
                    <input type="text" class="form-control form-control-sm" value="${ex.rest || ''}" onchange="window.updateExercicioRest('${diaAtual}', ${index}, this.value)" placeholder="Ex: 60s">
                </div>
                <div class="col-12 col-md-6">
                    <label class="form-label small text-muted fw-bold">Vídeo (URL)</label>
                    <input type="text" class="form-control form-control-sm" value="${ex.video || ''}" onchange="window.updateExercicioVideo('${diaAtual}', ${index}, this.value)" placeholder="Link do vídeo">
                </div>
                <div class="col-12">
                    <label class="form-label small text-muted fw-bold">Foto (URL)</label>
                    <input type="text" class="form-control form-control-sm" value="${ex.photo || ''}" onchange="window.updateExercicioPhoto('${diaAtual}', ${index}, this.value)" placeholder="Link da foto">
                </div>
            </div>
        `;
        lista.appendChild(row);
    });
}

window.addExercicioNoDia = function () {
    if (!treinoCache[diaAtual]) treinoCache[diaAtual] = [];
    treinoCache[diaAtual].push({ name: '', sets: '', reps: '', rest: '', video: '', photo: '' });
    renderizarDia();
};

window.removerExercicioNoDia = function (index) {
    treinoCache[diaAtual].splice(index, 1);
    renderizarDia();
};

window.updateExercicioNome = function (dia, index, value) {
    treinoCache[dia][index].name = value;
};

window.updateExercicioSets = function (dia, index, value) {
    treinoCache[dia][index].sets = value;
};

window.updateExercicioReps = function (dia, index, value) {
    treinoCache[dia][index].reps = value;
};

window.updateExercicioRest = function (dia, index, value) {
    treinoCache[dia][index].rest = value;
};

window.updateExercicioVideo = function (dia, index, value) {
    treinoCache[dia][index].video = value;
};

window.updateExercicioPhoto = function (dia, index, value) {
    treinoCache[dia][index].photo = value;
};

window.salvarEFechar = async function () {
    if (!alunoEdicaoId) return;

    try {
        await setDoc(doc(db, "workouts", alunoEdicaoId), {
            days: treinoCache,
            updatedAt: new Date()
        });
        showToast("Treino salvo com sucesso! ✅");
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    } catch (e) {
        console.error("Erro ao salvar:", e);
        showToast("Erro ao salvar treino.", true);
    }
};

// --- BIBLIOTECA DE EXERCÍCIOS ---

async function carregarBiblioteca() {
    if (!trainerId) return;

    try {
        const q = query(collection(db, "exercises"), where("trainerId", "==", trainerId));
        const snapshot = await getDocs(q);
        exerciciosBiblioteca = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            .sort((a, b) => (a.nome || "").localeCompare(b.nome || ""));
    } catch (e) {
        console.error("Erro ao carregar biblioteca:", e);
    }
}

window.abrirBiblioteca = function (index) {
    exercicioIndexAtual = index;
    renderizarBiblioteca(exerciciosBiblioteca);
    document.getElementById('modalBiblioteca').style.display = 'block';
};

window.fecharBiblioteca = function () {
    document.getElementById('modalBiblioteca').style.display = 'none';
};

function renderizarBiblioteca(lista) {
    const container = document.getElementById('listaBiblioteca');
    container.innerHTML = '';

    if (lista.length === 0) {
        container.innerHTML = '<div class="text-center w-100 p-4 text-muted">Nenhum exercício encontrado na biblioteca.</div>';
        return;
    }

    lista.forEach(ex => {
        const card = document.createElement('div');
        card.className = 'exercise-card';
        card.style.cursor = 'pointer';
        card.style.transition = 'all 0.3s ease';

        card.addEventListener('click', () => selecionarDaBiblioteca(ex));
        card.addEventListener('mouseover', () => {
            card.style.transform = 'translateY(-4px)';
            card.style.boxShadow = '0 8px 24px rgba(99, 102, 241, 0.25)';
        });
        card.addEventListener('mouseout', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '';
        });

        const imgUrl = ex.urlImagem || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=200&auto=format&fit=crop';

        card.innerHTML = `
            <div class="card-image-wrapper">
                <div class="category-badge">${ex.categoria}</div>
                <img src="${imgUrl}" class="exercise-img" alt="${ex.nome}" loading="lazy">
                ${ex.urlVideo ? '<div class="video-badge"><i class="bi bi-play-fill"></i></div>' : ''}
            </div>
            <div class="exercise-info">
                <div class="exercise-name">${ex.nome}</div>
            </div>
        `;

        container.appendChild(card);
    });
}

function selecionarDaBiblioteca(ex) {
    if (exercicioIndexAtual === null) return;

    treinoCache[diaAtual][exercicioIndexAtual].name = ex.nome || ex.name || '';
    treinoCache[diaAtual][exercicioIndexAtual].video = ex.urlVideo || '';
    treinoCache[diaAtual][exercicioIndexAtual].photo = ex.urlImagem || '';

    fecharBiblioteca();
    renderizarDia();
    showToast("Exercício importado!");
}

window.filtrarBiblioteca = function () {
    const busca = document.getElementById('buscaBiblioteca').value.toLowerCase();
    const categoria = document.getElementById('filtroCategoriaModal').value;

    const filtrados = exerciciosBiblioteca.filter(ex => {
        const matchesBusca = (ex.nome || '').toLowerCase().includes(busca);
        const matchesCategoria = !categoria || ex.categoria === categoria;
        return matchesBusca && matchesCategoria;
    });

    renderizarBiblioteca(filtrados);
};

// Fechar modal ao clicar fora
window.onclick = function (event) {
    const modal = document.getElementById('modalBiblioteca');
    if (event.target == modal) {
        fecharBiblioteca();
    }
};

// --- UTILITÁRIOS ---

function showToast(msg, erro = false) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.innerText = msg;
    toast.style.backgroundColor = erro ? '#ef4444' : '#10b981';
    toast.className = "show";
    setTimeout(() => { toast.className = toast.className.replace("show", ""); }, 3000);
}
