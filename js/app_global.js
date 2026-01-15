// ============================================================
// CONFIGURAÇÃO FIREBASE (Versão Compatibilidade Global)
// Esta seção contém as credenciais do seu projeto Firebase.
// ============================================================
const firebaseConfig = {
    apiKey: "AIzaSyB-EUEKc_7zzszou9qP83ic7DZV-1CBrZw",
    authDomain: "saas-treino-andre.firebaseapp.com",
    projectId: "saas-treino-andre",
    storageBucket: "saas-treino-andre.firebasestorage.app",
    messagingSenderId: "629928465846",
    appId: "1:629928465846:web:f78a04948113efed17dd17",
    measurementId: "G-CKG3HGYKL2"
};

// Inicializa o Firebase Globalmente usando a versão compat (v8/v9 compat)
firebase.initializeApp(firebaseConfig);

// Atalhos globais para os serviços do Firebase
const auth = firebase.auth();
const db = firebase.firestore();

// ============================================================
// LÓGICA DE AUTENTICAÇÃO E UTILITÁRIOS
// ============================================================

// Credenciais fixas para o perfil do treinador (Rafael)
const TRAINER_LOGIN = "rafael";
const TRAINER_PASS = "123";
const TRAINER_EMAIL_REAL = "rafael@gym.com"; // Email para autenticação interna do Firebase

/**
 * Função Global de Login
 * Trata tanto o login administrativo do treinador quanto o login dos alunos.
 * @param {string} usuario - Nome de usuário ou login
 * @param {string} senha - Senha do usuário
 */
window.fazerLogin = async function (usuario, senha) {
    console.log("Tentando logar com:", usuario, senha);

    // 1. Verifica se é o Admin (Rafael)
    if (usuario === TRAINER_LOGIN && senha === TRAINER_PASS) {
        try {
            // Tenta logar no Firebase Authentication com e-mail fixo
            await auth.signInWithEmailAndPassword(TRAINER_EMAIL_REAL, "senha123padrao");
            window.location.href = "telas/dashboard.html"; // Redireciona para o painel do personal
            return;
        } catch (e) {
            console.log("Conta admin não achada, criando...", e);
            try {
                // Caso a conta não exista, cria automaticamente para o primeiro acesso
                await auth.createUserWithEmailAndPassword(TRAINER_EMAIL_REAL, "senha123padrao");
                window.location.href = "telas/dashboard.html";
            } catch (err2) {
                // Erros comuns de configuração no console do Firebase
                if (err2.code === 'auth/configuration-not-found' || err2.code === 'auth/operation-not-allowed') {
                    alert("ERRO DE CONFIGURAÇÃO NO FIREBASE:\n\nVocê precisa ativar o 'Email/Senha' no painel do Firebase.\n\n1. Vá em Authentication\n2. Sign-in method\n3. Ative Email/Password");
                } else {
                    alert("Erro grave ao entrar no Admin: " + err2.message);
                }
            }
            return;
        }
    }

    // 2. Verifica se é um Aluno via Firestore
    try {
        const snapshot = await db.collection("students")
            .where("login", "==", usuario)
            .where("password", "==", senha)
            .get();

        if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            const data = doc.data();

            // Salva a sessão do aluno no sessionStorage (dura até fechar a aba)
            sessionStorage.setItem("studentId", doc.id);
            sessionStorage.setItem("studentName", data.name);
            window.location.href = "telas/student.html"; // Redireciona para a tela do aluno
        } else {
            alert("Usuário ou senha incorretos.");
        }
    } catch (error) {
        console.error("Erro login aluno:", error);
        alert("Erro ao conectar no banco de dados.");
    }
};

/**
 * Função Global de Logout
 * Limpa a sessão do Firebase e o sessionStorage local.
 */
window.fazerLogout = function () {
    auth.signOut();
    sessionStorage.clear();
    window.location.href = "../index.html"; // Volta para a tela de login
};

/**
 * Verifica Autenticação no Dashboard
 * Garante que apenas usuários logados acessem o painel do personal.
 */
window.verificarAuthDashboard = function () {
    auth.onAuthStateChanged(user => {
        if (!user) {
            // Se não houver usuário logado no Firebase, expulsa para o login
            window.location.href = "../index.html";
        }
    });
};

/**
 * Verifica Autenticação do Aluno
 * Garante que o aluno tenha um ID de sessão válido no sessionStorage.
 */
window.verificarAuthAluno = function () {
    if (!sessionStorage.getItem("studentId")) {
        window.location.href = "../index.html";
    }
};
