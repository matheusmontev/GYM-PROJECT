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
    console.log("Tentando login para:", usuario);

    // Função auxiliar para verificar se uma string parece um hash SHA-256 (64 hex chars)
    const isHash = (str) => /^[a-f0-9]{64}$/i.test(str);

    // Gera o hash da senha fornecida
    const senhaFornecidaHash = await window.hashSenha(senha);
    const senhaFornecidaHashUpper = senhaFornecidaHash.toUpperCase();

    try {
        // 1. TENTA LOGIN COMO TREINADOR (ADMIN)
        let adminSnapshot = await db.collection("admins")
            .where("username", "==", usuario)
            .get();

        if (!adminSnapshot.empty) {
            const adminDoc = adminSnapshot.docs[0];
            const adminData = adminDoc.data();
            const storedPass = adminData.password;

            let logadoAdmin = false;

            // Comparação robusta (Hash Case-Insensitive ou Texto Puro)
            if (storedPass === senhaFornecidaHash || storedPass.toUpperCase() === senhaFornecidaHashUpper || storedPass === senha) {
                logadoAdmin = true;
            }

            if (logadoAdmin) {
                // Se logou e a senha no DB não era o hash padrão (lowercase), atualiza.
                // Mas apenas se a senha fornecida NÃO for um hash puro (evita double-hash)
                if (storedPass !== senhaFornecidaHash && !isHash(senha)) {
                    await db.collection("admins").doc(adminDoc.id).update({ password: senhaFornecidaHash });
                    console.log("Senha do administrador normalizada para Hash.");
                }

                sessionStorage.setItem("isAdmin", "true");
                sessionStorage.setItem("adminId", adminDoc.id);
                sessionStorage.setItem("adminName", usuario);
                window.location.href = "telas/dashboard.html";
                return;
            }
        }

        // Caso especial: Admin Inicial
        const allAdmins = await db.collection("admins").limit(1).get();
        if (allAdmins.empty && usuario === "rafael" && senha === "123") {
            const newAdmin = { username: "rafael", password: senhaFornecidaHash };
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

    // 2. TENTA LOGIN COMO ALUNO
    try {
        let studentSnapshot = await db.collection("students")
            .where("login", "==", usuario)
            .get();

        if (!studentSnapshot.empty) {
            const studentDoc = studentSnapshot.docs[0];
            const studentData = studentDoc.data();
            const storedPass = studentData.password;

            let logadoEstudante = false;

            // Logica de comparação robusta
            if (storedPass === senhaFornecidaHash || storedPass.toUpperCase() === senhaFornecidaHashUpper || storedPass === senha) {
                logadoEstudante = true;
            }

            if (logadoEstudante) {
                // Atualiza/Migra se necessário
                // IMPORTANTE: Só atualiza se o que o usuário digitou NÃO for um hash
                // Isso resolve o problema de "entrar com hash" e gerar "hash do hash"
                if (storedPass !== senhaFornecidaHash && !isHash(senha)) {
                    await db.collection("students").doc(studentDoc.id).update({
                        password: senhaFornecidaHash,
                        passwordPlain: senha
                    });
                    console.log("Senha do aluno migrada/normalizada com sucesso.");
                }

                sessionStorage.setItem("studentId", studentDoc.id);
                sessionStorage.setItem("studentName", studentData.name);
                window.location.href = "telas/student.html";
                return;
            }
        }

        // Se chegou aqui, não encontrou admin nem aluno válido
        alert("Usuário ou senha incorretos.");

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
