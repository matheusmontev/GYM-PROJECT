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

/**
 * Utilitário para gerar Hash SHA-256 (Segurança de senhas)
 */
window.hashSenha = async function (senha) {
    const msgUint8 = new TextEncoder().encode(senha);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Função Global de Login
 * Trata tanto o login administrativo do treinador quanto o login dos alunos.
 * @param {string} usuario - Nome de usuário (aluno) ou Email (treinador)
 * @param {string} senha - Senha do usuário
 */
window.fazerLogin = async function (usuario, senha) {
    console.log("Tentando login...");

    const senhaHash = await window.hashSenha(senha);

    try {
        // 1. Tenta login como Treinador via Firestore (Coleção 'admins')
        // Tenta achar com a senha já criptografada (padrão novo)
        let adminSnapshot = await db.collection("admins")
            .where("username", "==", usuario)
            .where("password", "==", senhaHash)
            .get();

        // Se não achou com Hash, tenta achar com a senha em texto puro (migração do admin)
        if (adminSnapshot.empty) {
            adminSnapshot = await db.collection("admins")
                .where("username", "==", usuario)
                .where("password", "==", senha)
                .get();

            if (!adminSnapshot.empty) {
                // Encontrou admin com senha antiga! Vamos atualizar.
                const adminId = adminSnapshot.docs[0].id;
                await db.collection("admins").doc(adminId).update({ password: senhaHash });
                console.log("Senha do administrador migrada para Hash.");
            }
        }

        if (!adminSnapshot.empty) {
            const adminDoc = adminSnapshot.docs[0];
            sessionStorage.setItem("isAdmin", "true");
            sessionStorage.setItem("adminId", adminDoc.id);
            sessionStorage.setItem("adminName", usuario);
            window.location.href = "telas/dashboard.html";
            return;
        }

        const allAdmins = await db.collection("admins").limit(1).get();
        if (allAdmins.empty && usuario === "rafael" && senha === "123") {
            const newAdmin = { username: "rafael", password: senhaHash };
            const docRef = await db.collection("admins").add(newAdmin);
            sessionStorage.setItem("isAdmin", "true");
            sessionStorage.setItem("adminId", docRef.id);
            sessionStorage.setItem("adminName", "rafael");
            window.location.href = "telas/dashboard.html";
            return;
        }
    } catch (e) {
        console.error("Erro ao verificar admins:", e);
    }

    // 2. Verifica se é um Aluno via Firestore (login por apelido/username)
    try {
        // Primeiro: tenta achar com a senha já criptografada (padrão novo)
        let snapshot = await db.collection("students")
            .where("login", "==", usuario)
            .where("password", "==", senhaHash)
            .get();

        // Segundo: se não achou, tenta achar com a senha em texto puro (migração)
        if (snapshot.empty) {
            snapshot = await db.collection("students")
                .where("login", "==", usuario)
                .where("password", "==", senha)
                .get();

            if (!snapshot.empty) {
                // Encontrou com senha antiga! Vamos atualizar para a nova automaticamente.
                const docId = snapshot.docs[0].id;
                await db.collection("students").doc(docId).update({
                    password: senhaHash,
                    passwordPlain: senha // Salva o texto puro para o treinador
                });
                console.log("Senha do aluno migrada para Hash com sucesso.");
            }
        }

        if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            const data = doc.data();

            // Salva a sessão do aluno no sessionStorage
            sessionStorage.setItem("studentId", doc.id);
            sessionStorage.setItem("studentName", data.name);
            window.location.href = "telas/student.html";
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
 * Garante que apenas o treinador acesse o painel via sessionStorage.
 */
window.verificarAuthDashboard = function () {
    if (sessionStorage.getItem("isAdmin") !== "true") {
        window.location.href = "../index.html";
    }
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
