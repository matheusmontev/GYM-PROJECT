import { db, auth } from './app_global.js';
import {
    collection,
    query,
    where,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    orderBy,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// Estado local
let exerciciosCache = [];
let trainerId = sessionStorage.getItem("adminId");

// Verificar autenticação
window.verificarAuthDashboard();

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    carregarExercicios();
});

// --- FUNÇÕES DE DADOS (FIRESTORE) ---

async function carregarExercicios() {
    if (!trainerId) return;

    const q = query(
        collection(db, "exercises"),
        where("trainerId", "==", trainerId)
    );

    // Snapshot em tempo real para atualizações instantâneas
    onSnapshot(q, (snapshot) => {
        const docs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Ordenação manual no JS para evitar erro de índice no Firestore
        exerciciosCache = docs.sort((a, b) => (a.nome || "").localeCompare(b.nome || ""));

        document.getElementById('loadingState').style.display = 'none';
        renderizarExercicios(exerciciosCache);
    }, (error) => {
        console.error("Erro ao carregar exercícios:", error);
        const loadingState = document.getElementById('loadingState');
        if (loadingState) {
            loadingState.innerHTML = `<div class="alert alert-danger">Erro ao carregar dados: ${error.message}</div>`;
        }
    });
}

window.salvarExercicio = async function (event) {
    event.preventDefault();

    const id = document.getElementById('editExercicioId').value;
    const dados = {
        nome: document.getElementById('nomeExercicio').value,
        categoria: document.getElementById('categoriaExercicio').value,
        urlImagem: document.getElementById('urlImagem').value,
        urlVideo: document.getElementById('urlVideo').value,
        descricao: document.getElementById('descricaoExercicio').value,
        trainerId: trainerId,
        dataCriacao: new Date().toISOString()
    };

    try {
        if (id) {
            // Editar
            await updateDoc(doc(db, "exercises", id), dados);
            mostrarToast("Exercício atualizado com sucesso!");
        } else {
            // Criar novo
            await addDoc(collection(db, "exercises"), dados);
            mostrarToast("Exercício criado com sucesso!");
        }
        fecharModalExercicio();
    } catch (error) {
        console.error("Erro ao salvar:", error);
        mostrarToast("Erro ao salvar exercício.", true);
    }
};

window.excluirExercicio = async function (id) {
    if (!confirm("Tem certeza que deseja excluir este exercício?")) return;

    try {
        await deleteDoc(doc(db, "exercises", id));
        mostrarToast("Exercício excluído com sucesso!");
    } catch (error) {
        console.error("Erro ao excluir:", error);
        mostrarToast("Erro ao excluir exercício.", true);
    }
};

// --- RENDERIZAÇÃO E UI ---

function renderizarExercicios(lista) {
    const grid = document.getElementById('exerciseGrid');
    const empty = document.getElementById('emptyState');

    grid.innerHTML = '';

    if (lista.length === 0) {
        empty.style.display = 'block';
        return;
    }

    empty.style.display = 'none';

    lista.forEach(ex => {
        const card = document.createElement('div');
        card.className = 'exercise-card';

        const imgUrl = ex.urlImagem || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400&auto=format&fit=crop';

        card.innerHTML = `
            <div class="card-image-wrapper">
                <div class="category-badge">${ex.category || ex.categoria}</div>
                <img src="${imgUrl}" class="exercise-img" alt="${ex.nome}" loading="lazy">
                ${ex.urlVideo ? '<div class="video-badge"><i class="bi bi-play-fill"></i></div>' : ''}
            </div>
            <div class="exercise-info">
                <div class="exercise-name">${ex.nome}</div>
                <div class="exercise-desc">${ex.descricao || 'Sem descrição disponível.'}</div>
            </div>
            <div class="exercise-actions">
                <button onclick="window.abrirModalExercicio('${ex.id}')" class="btn btn-light btn-icon-sm border" title="Editar">
                    <i class="bi bi-pencil-square text-primary"></i>
                </button>
                <button onclick="window.excluirExercicio('${ex.id}')" class="btn btn-light btn-icon-sm border" title="Excluir">
                    <i class="bi bi-trash3 text-danger"></i>
                </button>
                <div style="margin-left: auto;">
                    <span class="badge bg-light text-primary border" style="font-size: 0.65rem;">ID: ${ex.id.substring(0, 5)}</span>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

window.filtrarExercicios = function () {
    const busca = document.getElementById('inputBusca').value.toLowerCase();
    const categoria = document.getElementById('filtroCategoria').value;

    const filtrados = exerciciosCache.filter(ex => {
        const matchesBusca = ex.nome.toLowerCase().includes(busca);
        const matchesCategoria = !categoria || ex.categoria === categoria;
        return matchesBusca && matchesCategoria;
    });

    renderizarExercicios(filtrados);
};

// --- MODAIS ---

window.abrirModalExercicio = function (id = null) {
    if (id) {
        window.location.href = `novo-exercicio.html?id=${id}`;
    } else {
        window.location.href = `novo-exercicio.html`;
    }
};

// --- UTILITÁRIOS ---

function mostrarToast(msg, erro = false) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.innerText = msg;
    toast.style.backgroundColor = erro ? 'var(--danger)' : 'var(--success)';
    toast.className = "show";
    setTimeout(() => { toast.className = toast.className.replace("show", ""); }, 3000);
}
