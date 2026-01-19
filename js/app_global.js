/**
 * Utilitários Globais e Configuração Firebase Modular
 */

import { auth, db } from './firebase-config.js';
import {
    collection,
    query,
    where,
    getDocs,
    addDoc,
    updateDoc,
    doc,
    limit,
    getDoc
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import {
    signOut
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

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
 */
window.fazerLogin = async function (usuario, senha) {
    console.log("Tentando login para:", usuario);

    const isHash = (str) => /^[a-f0-9]{64}$/i.test(str);
    const senhaFornecidaHash = await window.hashSenha(senha);
    const senhaFornecidaHashUpper = senhaFornecidaHash.toUpperCase();

    try {
        // 1. TENTA LOGIN COMO ADMIN/TREINADOR
        const qAdmin = query(collection(db, "admins"), where("username", "==", usuario));
        const adminSnapshot = await getDocs(qAdmin);

        if (!adminSnapshot.empty) {
            const adminDoc = adminSnapshot.docs[0];
            const adminData = adminDoc.data();
            const storedPass = adminData.password;

            let logadoAdmin = false;
            // Verifica senha (Hash ou Plain/Legacy)
            if (storedPass === senhaFornecidaHash || storedPass.toUpperCase() === senhaFornecidaHashUpper || storedPass === senha) {
                logadoAdmin = true;
            }

            if (logadoAdmin) {
                // Atualiza hash se necessário
                if (storedPass !== senhaFornecidaHash && !isHash(senha)) {
                    await updateDoc(doc(db, "admins", adminDoc.id), { password: senhaFornecidaHash });
                }

                // *** VERIFICAÇÃO DE ROLE E LICENÇA ***

                // Caso 1: Super Admin
                if (adminData.role === 'super_admin') {
                    sessionStorage.setItem("isAdmin", "true");
                    sessionStorage.setItem("isSuperAdmin", "true");
                    sessionStorage.setItem("adminId", adminDoc.id);
                    sessionStorage.setItem("adminName", usuario);

                    const basePath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
                    window.location.href = basePath + "telas/admin_license.html";
                    return;
                }

                // Caso 2: Personal Trainer (Verifica Licença)
                const licenseActive = adminData.licenseActive !== false; // Default true se undefined (mas ideal ser definido)
                const licenseExpiration = adminData.licenseExpiration ? new Date(adminData.licenseExpiration) : null;
                const now = new Date();

                // Se licença inativa OU expirada
                if (!licenseActive || (licenseExpiration && licenseExpiration < now)) {
                    const basePath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
                    window.location.href = basePath + "telas/license_expired.html";
                    return;
                }

                // Login Sucesso Trainer
                sessionStorage.setItem("isAdmin", "true");
                sessionStorage.setItem("adminId", adminDoc.id);
                sessionStorage.setItem("adminName", usuario);

                const basePath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
                window.location.href = basePath + "telas/dashboard.html";
                return;
            }
        }

        // Caso especial removido (setup inicial agora é via setup_db.html ou script de super admin)

    } catch (e) {
        console.error("Erro ao verificar admins:", e);
    }

    // 2. TENTA LOGIN COMO ALUNO
    try {
        const qStudent = query(collection(db, "students"), where("login", "==", usuario));
        const studentSnapshot = await getDocs(qStudent);

        if (!studentSnapshot.empty) {
            const studentDoc = studentSnapshot.docs[0];
            const studentData = studentDoc.data();
            const storedPass = studentData.password;

            let logadoEstudante = false;

            if (storedPass === senhaFornecidaHash || storedPass.toUpperCase() === senhaFornecidaHashUpper || storedPass === senha) {
                logadoEstudante = true;
            }

            if (logadoEstudante) {
                if (storedPass !== senhaFornecidaHash && !isHash(senha)) {
                    await updateDoc(doc(db, "students", studentDoc.id), {
                        password: senhaFornecidaHash,
                        passwordPlain: senha
                    });
                }

                // Verifica status do TREINADOR do aluno (Opcional, mas recomendado para bloqueio total)
                if (studentData.trainerId) {
                    const trainerRef = await getDoc(doc(db, "admins", studentData.trainerId));
                    if (trainerRef.exists()) {
                        const trainerData = trainerRef.data();
                        const tExpired = trainerData.licenseExpiration ? new Date(trainerData.licenseExpiration) < new Date() : false;
                        if (trainerData.licenseActive === false || tExpired) {
                            alert("O acesso do seu treinador está temporariamente suspenso. Contate-o.");
                            return;
                        }
                    }
                }

                sessionStorage.setItem("studentId", studentDoc.id);
                sessionStorage.setItem("studentName", studentData.name);

                const basePath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
                window.location.href = basePath + "telas/student.html";
                return;
            }
        }

        alert("Usuário ou senha incorretos.");

    } catch (error) {
        console.error("Erro login aluno:", error);
        alert("Erro ao conectar no banco de dados.");
    }
};

/**
 * Função Global de Logout
 */
window.fazerLogout = async function () {
    await signOut(auth);
    sessionStorage.clear();
    const isInsideTelas = window.location.pathname.includes('/telas/');
    window.location.href = isInsideTelas ? "../index.html" : "index.html";
};

/**
 * Verifica Autenticação no Dashboard
 */
window.verificarAuthDashboard = function () {
    if (sessionStorage.getItem("isAdmin") !== "true") {
        const isInsideTelas = window.location.pathname.includes('/telas/');
        window.location.href = isInsideTelas ? "../index.html" : "index.html";
    }
};

/**
 * Verifica Autenticação do Aluno
 */
window.verificarAuthAluno = function () {
    if (!sessionStorage.getItem("studentId")) {
        const isInsideTelas = window.location.pathname.includes('/telas/');
        window.location.href = isInsideTelas ? "../index.html" : "index.html";
    }
};

// Exporta para uso em outros módulos se necessário
export { auth, db };
