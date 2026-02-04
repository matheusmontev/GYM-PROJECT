import { db, auth } from './app_global.js';
import {
    collection,
    query,
    where,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    doc
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// Estado local
let trainerId = sessionStorage.getItem("adminId");

// Verificar autenticação
window.verificarAuthDashboard();

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (id) {
        document.getElementById('pageTitle').innerText = 'Editar Exercício';
        document.getElementById('btnSubmitText').innerText = 'Atualizar Exercício';
        await carregarParaEdicao(id);
    }
});

async function carregarParaEdicao(id) {
    try {
        const docRef = doc(db, "exercises", id);
        const sn = await getDoc(docRef);

        if (sn.exists()) {
            const ex = sn.data();
            document.getElementById('editExercicioId').value = id;
            document.getElementById('nomeExercicio').value = ex.nome;
            document.getElementById('categoriaExercicio').value = ex.categoria;
            document.getElementById('urlImagem').value = ex.urlImagem || '';
            document.getElementById('urlVideo').value = ex.urlVideo || '';
        }
    } catch (e) {
        console.error("Erro ao carregar para edição:", e);
        mostrarToast("Erro ao carregar dados.", true);
    }
}

document.getElementById('formExercicioNovo').addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!trainerId) {
        alert("Sessão expirada. Faça login novamente.");
        return;
    }

    const id = document.getElementById('editExercicioId').value;
    const dados = {
        nome: document.getElementById('nomeExercicio').value,
        categoria: document.getElementById('categoriaExercicio').value,
        urlImagem: document.getElementById('urlImagem').value,
        urlVideo: document.getElementById('urlVideo').value,
        trainerId: trainerId,
        dataAtualizacao: new Date().toISOString()
    };

    try {
        if (id) {
            await updateDoc(doc(db, "exercises", id), dados);
            mostrarToast("Exercício atualizado!");
        } else {
            dados.dataCriacao = new Date().toISOString();
            await addDoc(collection(db, "exercises"), dados);
            mostrarToast("Novo exercício salvo!");
        }

        setTimeout(() => {
            window.location.href = 'exercicios.html';
        }, 1500);

    } catch (error) {
        console.error("Erro ao salvar:", error);
        mostrarToast("Erro ao salvar exercício.", true);
    }
});

function mostrarToast(msg, erro = false) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.innerText = msg;
    toast.style.backgroundColor = erro ? 'var(--danger)' : 'var(--success)';
    toast.className = "show";
    setTimeout(() => { toast.className = toast.className.replace("show", ""); }, 3000);
}
