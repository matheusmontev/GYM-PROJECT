import { db } from './app_global.js';
import {
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// Verificar autenticação
window.verificarAuthDashboard();

// Estado local
let exerciciosCache = [];
let trainerId = sessionStorage.getItem("adminId");
let exercicioIndexAtual = null;
let diaAtual = null;

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    exercicioIndexAtual = params.get('index');
    diaAtual = params.get('dia');

    if (!exercicioIndexAtual || !diaAtual) {
        alert("Parâmetros inválidos.");
        window.history.back();
        return;
    }

    await carregarExercicios();
});

async function carregarExercicios() {
    if (!trainerId) return;

    try {
        const q = query(
            collection(db, "exercises"),
            where("trainerId", "==", trainerId)
        );

        const snapshot = await getDocs(q);
        const docs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        exerciciosCache = docs.sort((a, b) => (a.nome || "").localeCompare(b.nome || ""));

        document.getElementById('loadingState').style.display = 'none';
        renderizarExercicios(exerciciosCache);
    } catch (error) {
        console.error("Erro ao carregar exercícios:", error);
        document.getElementById('loadingState').innerHTML = `<div class="alert alert-danger">Erro ao carregar dados: ${error.message}</div>`;
    }
}

function renderizarExercicios(lista) {
    const grid = document.getElementById('exerciseGrid');
    const empty = document.getElementById('emptyState');

    grid.innerHTML = '';

    if (lista.length === 0) {
        empty.style.display = 'block';
        return;
    }

    empty.style.display = 'none';

    lista.forEach((ex, index) => {
        const card = document.createElement('div');
        card.className = 'exercise-card';
        card.style.cursor = 'pointer';
        card.style.transition = 'all 0.3s ease';

        // Adicionar evento de clique no card inteiro
        card.addEventListener('click', () => selecionarExercicio(ex));
        card.addEventListener('mouseover', () => {
            card.style.transform = 'translateY(-4px)';
            card.style.boxShadow = '0 8px 24px rgba(99, 102, 241, 0.25)';
        });
        card.addEventListener('mouseout', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '';
        });

        const imgUrl = ex.urlImagem || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400&auto=format&fit=crop';

        card.innerHTML = `
            <div class="card-image-wrapper">
                <div class="category-badge">${ex.category || ex.categoria}</div>
                <img src="${imgUrl}" class="exercise-img" alt="${ex.nome}" loading="lazy">
                ${ex.urlVideo ? '<div class="video-badge"><i class="bi bi-play-fill"></i></div>' : ''}
            </div>
            <div class="exercise-info">
                <div class="exercise-name">${ex.nome}</div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function selecionarExercicio(ex) {
    console.log('Selecionando exercício:', ex);

    // Armazenar dados no sessionStorage para retornar à página de edição
    const dadosExercicio = {
        nome: ex.nome || ex.name || '',
        video: ex.urlVideo || '',
        photo: ex.urlImagem || ''
    };

    sessionStorage.setItem('exercicioSelecionado', JSON.stringify(dadosExercicio));
    sessionStorage.setItem('exercicioIndex', exercicioIndexAtual);
    sessionStorage.setItem('exercicioDia', diaAtual);

    console.log('Dados salvos no sessionStorage:', {
        exercicio: dadosExercicio,
        index: exercicioIndexAtual,
        dia: diaAtual
    });

    showToast("Exercício selecionado! Retornando...");

    setTimeout(() => {
        window.history.back();
    }, 800);
}

// Expor função globalmente caso necessário
window.selecionarExercicio = selecionarExercicio;

window.filtrarExercicios = function () {
    const busca = document.getElementById('inputBusca').value.toLowerCase();
    const categoria = document.getElementById('filtroCategoria').value;

    const filtrados = exerciciosCache.filter(ex => {
        const matchesBusca = (ex.nome || '').toLowerCase().includes(busca);
        const matchesCategoria = !categoria || ex.categoria === categoria;
        return matchesBusca && matchesCategoria;
    });

    renderizarExercicios(filtrados);
};

function showToast(msg, erro = false) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.innerText = msg;
    toast.style.backgroundColor = erro ? '#ef4444' : '#10b981';
    toast.className = "show";
    setTimeout(() => { toast.className = toast.className.replace("show", ""); }, 3000);
}
