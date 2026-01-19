
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
    getDoc
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// Verificação Importante de Segurança
async function checkSuperAdmin() {
    const isAdmin = sessionStorage.getItem("isAdmin") === "true";
    const adminId = sessionStorage.getItem("adminId");

    if (!isAdmin || !adminId) {
        window.location.href = "../index.html";
        return;
    }

    // Verifica no banco se é realmente super_admin
    try {
        const adminDoc = await getDoc(doc(db, "admins", adminId));
        if (adminDoc.exists()) {
            const data = adminDoc.data();
            if (data.role !== "super_admin") {
                // Se for admin comum tentando acessar, manda pro dashboard dele
                window.location.href = "dashboard.html"; 
            }
        } else {
            window.location.href = "../index.html";
        }
    } catch (e) {
        console.error("Erro auth admin:", e);
        window.location.href = "../index.html";
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    await checkSuperAdmin();
    loadTrainers();

    // Setup Logout
    document.getElementById('btnLogout').addEventListener('click', () => {
        window.fazerLogout();
    });

    // Setup Save Button
    document.getElementById('btnSaveTrainer').addEventListener('click', saveTrainer);
});

// Carregar Treinadores
async function loadTrainers() {
    const tbody = document.getElementById('trainerListBody');
    tbody.innerHTML = '<tr><td colspan="6" class="text-center py-5"><div class="spinner-border text-primary" role="status"></div></td></tr>';

    try {
        const q = query(collection(db, "admins")); // Pega todos
        const querySnapshot = await getDocs(q);
        
        tbody.innerHTML = '';
        let count = 0;

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            // Ignorar o próprio super admin na lista ou mostrar diferente
            if (data.role === 'super_admin') return; 

            count++;
            
            // Verifica status da licença
            const isExpired = new Date(data.licenseExpiration) < new Date();
            let statusBadge = '';
            let statusText = '';
            
            if (data.licenseActive === false) {
                statusBadge = 'status-inactive';
                statusText = 'Desativado';
            } else if (isExpired) {
                statusBadge = 'status-expired';
                statusText = 'Expirada';
            } else {
                statusBadge = 'status-active';
                statusText = 'Ativa';
            }

            const tr = document.createElement('tr');
            tr.className = 'trainer-row';
            tr.innerHTML = `
                <td class="ps-4 fw-semibold">${data.name || 'Sem nome'}</td>
                <td>${data.username}</td>
                <td><span class="status-badge ${statusBadge}">${statusText}</span></td>
                <td>${formatDate(data.licenseExpiration)}</td>
                <td>N/A</td> <!-- Futuro: Contar alunos -->
                <td class="text-end pe-4">
                    <button class="action-btn me-2" onclick="editTrainer('${doc.id}')" title="Editar">
                        <i class="bi bi-pencil-square"></i>
                    </button>
                    <!-- <button class="action-btn text-danger" onclick="deleteTrainer('${doc.id}')" title="Excluir">
                        <i class="bi bi-trash"></i>
                    </button> -->
                </td>
            `;
            tbody.appendChild(tr);
        });

        if (count === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center py-5 text-muted">Nenhum personal trainer cadastrado.</td></tr>';
        }

    } catch (error) {
        console.error("Erro ao carregar treinadores:", error);
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger py-5">Erro ao carregar dados.</td></tr>';
    }
}

// Salvar (Novo ou Edição)
async function saveTrainer() {
    const btn = document.getElementById('btnSaveTrainer');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Salvando...';
    btn.disabled = true;

    const id = document.getElementById('trainerId').value;
    const name = document.getElementById('trainerName').value.trim();
    const user = document.getElementById('trainerUser').value.trim();
    const pass = document.getElementById('trainerPass').value.trim();
    const status = document.getElementById('licenseStatus').value === 'active';
    const expiration = document.getElementById('expirationDate').value;

    if (!name || !user || !expiration) {
        alert("Preencha todos os campos obrigatórios.");
        btn.innerHTML = originalText;
        btn.disabled = false;
        return;
    }

    try {
        const adminData = {
            name: name,
            username: user,
            licenseActive: status,
            licenseExpiration: expiration,
            role: 'trainer' // Garante que é trainer
        };

        if (pass) {
            // Gera Hash da senha
            adminData.password = await window.hashSenha(pass);
        }

        if (id) {
            // Update
            if (!pass) delete adminData.password; // Se não digitou senha, não altera
            await updateDoc(doc(db, "admins", id), adminData);
        } else {
            // Create
            if (!pass) {
                alert("Senha é obrigatória para novos usuários.");
                btn.innerHTML = originalText;
                btn.disabled = false;
                return;
            }
            // Verifica se usuário já existe
            const qCheck = query(collection(db, "admins"), where("username", "==", user));
            const checkSnaps = await getDocs(qCheck);
            if (!checkSnaps.empty) {
                alert("Nome de usuário já existe.");
                btn.innerHTML = originalText;
                btn.disabled = false;
                return;
            }

            adminData.createdAt = new Date();
            await addDoc(collection(db, "admins"), adminData);
        }

        // Fecha modal e recarrega
        const modalEl = document.getElementById('modalTrainer');
        const modal = bootstrap.Modal.getInstance(modalEl);
        modal.hide();
        
        loadTrainers();
        document.getElementById('trainerForm').reset();
        document.getElementById('trainerId').value = '';

    } catch (error) {
        console.error("Erro ao salvar:", error);
        alert("Erro ao salvar: " + error.message);
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

// Função Global para Editar (acessível pelo onclick no HTML)
window.editTrainer = async function(id) {
    try {
        const docRef = await getDoc(doc(db, "admins", id));
        if (docRef.exists()) {
            const data = docRef.data();
            
            document.getElementById('trainerId').value = docRef.id;
            document.getElementById('trainerName').value = data.name || '';
            document.getElementById('trainerUser').value = data.username || '';
            document.getElementById('trainerPass').value = ''; // Senha não é mostrada
            document.getElementById('licenseStatus').value = data.licenseActive ? 'active' : 'inactive';
            document.getElementById('expirationDate').value = data.licenseExpiration || '';

            document.getElementById('modalTitle').innerText = "Editar Personal Trainer";
            
            const modal = new bootstrap.Modal(document.getElementById('modalTrainer'));
            modal.show();
        }
    } catch (e) {
        console.error(e);
        alert("Erro ao carregar dados do treinador.");
    }
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const parts = dateString.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dateString;
}
