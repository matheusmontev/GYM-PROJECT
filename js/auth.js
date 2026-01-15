import { auth, db } from './firebase-config.js';
import { signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// Credenciais fixas do Treinador (Rafael)
const TRAINER_LOGIN = "rafael";
const TRAINER_PASS = "123";

// Email interno para o Firebase Auth associado ao perfil administrativo
const TRAINER_EMAIL_REAL = "rafael@trainer.com";

/**
 * Função de Login Modular
 * Utilizada para autenticação via ES Modules (v9 SDK).
 * @param {string} usuario - Login informado pelo usuário
 * @param {string} senha - Senha informada pelo usuário
 */
export async function login(usuario, senha) {
    // 1. Verifica se as credenciais batem com o perfil do Treinador
    if (usuario === TRAINER_LOGIN && senha === TRAINER_PASS) {
        try {
            // Tenta realizar o login administrativo real no Firebase Auth
            await signInWithEmailAndPassword(auth, TRAINER_EMAIL_REAL, "senha123padrao");
            window.location.href = "telas/dashboard.html"; // Redireciona se for treinador
            return;
        } catch (e) {
            console.log("Tentando criar conta de Admin automática...", e);
            // Tenta criar a conta automaticamente caso seja o primeiro acesso do sistema
            try {
                const { createUserWithEmailAndPassword } = await import("https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js");
                await createUserWithEmailAndPassword(auth, TRAINER_EMAIL_REAL, "senha123padrao");

                window.location.href = "telas/dashboard.html";
                return;
            } catch (createError) {
                console.error("Erro fatal ao criar Admin:", createError);
                alert("Erro ao entrar. Verifique o console (F12) para detalhes.");
                throw createError;
            }
        }
    }

    // 2. Caso não seja o treinador, busca o aluno na coleção 'students' do Firestore
    try {
        const q = query(collection(db, "students"),
            where("login", "==", usuario),
            where("password", "==", senha)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            // Se encontrou o documento do aluno
            const alunoDoc = querySnapshot.docs[0];
            const alunoData = alunoDoc.data();

            // Salva dados básicos da sessão no SessionStorage
            sessionStorage.setItem("studentId", alunoDoc.id);
            sessionStorage.setItem("studentName", alunoData.name);

            window.location.href = "telas/student.html"; // Redireciona para área do aluno
            return;
        } else {
            throw new Error("Usuário ou senha inválidos.");
        }

    } catch (error) {
        console.error("Erro Login:", error);
        throw error;
    }
}

/**
 * Função de Logout Modular
 * Encerra a sessão no Firebase e limpa dados locais.
 */
export async function logout() {
    await signOut(auth);
    sessionStorage.clear();
    window.location.href = "index.html";
}

/**
 * Verifica permissão na página em tempo de execução
 * @param {string} tipo - 'trainer' para dashboard ou 'student' para área do aluno
 */
export function checkAuth(tipo) {
    // Para o treinador, o Firebase gerencia o estado via currentUser ou observer
    if (tipo === 'trainer') {
        const user = auth.currentUser;
        // Nota: Idealmente usar onAuthStateChanged em apps SPA
    }

    // Para o aluno, verificamos a existência do ID no sessionStorage
    if (tipo === 'student') {
        if (!sessionStorage.getItem("studentId")) {
            window.location.href = "index.html";
        }
    }
}
