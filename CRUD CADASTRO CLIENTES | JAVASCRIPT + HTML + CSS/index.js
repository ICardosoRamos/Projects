const useAxios = axios;
const API_URL = 'http://localhost:3000';

const form = document.getElementById("form");

//Carrega DB.json e renderiza na tela
window.onload = () => {
    init();
};

async function init() {
    await ScreenDataRenderizer();
    addListeners();
};

//CARREGA OS DADOS EXISTENTES E MOSTRA NA TELA...
async function ScreenDataRenderizer() {
    const data = await LoadDBjson();

    data.forEach(({ id, nome, email, celular, cidade }) => {
        document.getElementById('addUsuarios').innerHTML += `
            <tr>
                <td style="display: none;">${id}</td>
                <td>${nome}</td>
                <td>${email}</td>
                <td>${celular}</td>
                <td>${cidade}</td>
                <td class="btnSpaceEditDelete">
                    <input type="button" value="Editar" updateId="${id}" class="btnCRUD_UD_">
                    <input type="button" value="Excluir" deleteId="${id}" class="btnCRUD_UD_">
                </td>
            </tr>
        `;
    })
};

//ABRE O MODAL PARA REGISTRAR CLIENTE...
async function OpenRegistrationModal(event) {
    const id = event.target.getAttribute("updateId");

    const appearModal = document.getElementById('appearModal');
    const appearForm = document.getElementById('appearForm');

    appearModal.classList.remove("backgroundToModalHidden");
    appearForm.classList.remove("modalSubmitHidden");

    appearModal.classList.add("backgroundToModal");
    appearForm.classList.add("modalSubmit");

    const saveButton = document.getElementById('btnSaveRegister');
    const invisibleId = document.getElementById("saveOrEdit");

    if (!id) {
        invisibleId.value = "";
        return saveButton.textContent = "Salvar";
    }

    invisibleId.value = id;
    saveButton.textContent = "Atualizar";

    const data = await LoadDBjson();

    const [usuario] = data.filter((d) => d.id === parseInt(id));

    document.getElementById('nameClient').value = usuario.nome;
    document.getElementById('emailClient').value = usuario.email;
    document.getElementById('celularClient').value = usuario.celular;
    document.getElementById('cityClient').value = usuario.cidade;
};

function CloseRegistrationModal() {
    const appearModal = document.getElementById('appearModal');
    const appearForm = document.getElementById('appearForm');

    appearModal.classList.remove("backgroundToModal");
    appearForm.classList.remove("modalSubmit");

    appearModal.classList.add("backgroundToModalHidden");
    appearForm.classList.add("modalSubmitHidden");

    document.getElementById("form").reset();
};

async function formSubmit(event) {
    event.preventDefault();
    const formData = new FormData(form);

    const usuario = {};

    for (const [key, value] of formData.entries()) {
        Object.assign(usuario, { [key]: value });
    };

    const isAlreadyRegistered = await VerifyExistance({email: usuario.email, celular: usuario.celular}, usuario.id);

    if (isAlreadyRegistered) {
        return window.alert("Atenção!!!\nEmail ou Celular já existem no sistema...\nPor favor tente, novamente.");
    }

    if (usuario.id) {
        return ClientUpdate(usuario);
    }

    return ClientRegister(usuario);
};

async function VerifyExistance(objToVerify, id = null) {
    try {
        const data = await LoadDBjson();

        const chavesParaVerificar = Object.keys(objToVerify);

        const isAlreadyRegistered = data.some((client) => chavesParaVerificar.some(
            (chave) => (client[chave] === objToVerify[chave]) && client.id !== parseInt(id))
        );

        return isAlreadyRegistered;
    } catch {
        throw new Error("");
    }
};

async function ClientRegister(usuario) {
    try {
        await useAxios.post(`${API_URL}/clientes`, usuario);
        window.alert("Usuario cadastrado com sucesso");
        return window.location.reload();
    }
    catch {
        return window.alert("Falha na comunicação com o servidor. Tente novamente");
    }
};

async function ClientUpdate(usuario) {
    try {
        await useAxios.patch(`${API_URL}/clientes/${usuario.id}`, usuario);
        return window.alert("Usuario editado com sucesso");
    } catch (ex) {
        return window.alert("Falha ao atualizar o usuario");
    }
}

async function ExcludeClient(event) {
    const id = event.target.getAttribute("deleteId");
    try {
        const result = window.confirm("Você têm certeza que quer excluir? Essa ação é írreversível...");
        if (result) {
            await useAxios.delete(`${API_URL}/clientes/${id}`);
            return window.location.reload();
        }
    } catch {
        alert("Erro ao excluir usuário");
    }
};

async function LoadDBjson() {
    try {
        const { data } = await useAxios.get(`${API_URL}/clientes`);

        return data;
    } catch (ex) {
        console.log(ex);
    }
};

//EVENTOS
const addListeners = () => {
    document.querySelector('#btnOpenRegisterModal').addEventListener('click', OpenRegistrationModal);
    document.querySelector('#btnCloseModal').addEventListener('click', CloseRegistrationModal);

    const editButtons = Array.from(document.querySelectorAll("[updateId]"));
    const excludeButtons = Array.from(document.querySelectorAll("[deleteId]"));

    editButtons.forEach((btn) => btn.addEventListener("click", OpenRegistrationModal));
    excludeButtons.forEach((btn) => btn.addEventListener("click", ExcludeClient));
    form.addEventListener("submit", formSubmit);
};