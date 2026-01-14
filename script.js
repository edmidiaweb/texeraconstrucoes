// --- CONFIG E ESTADO ---
let CONFIG = JSON.parse(localStorage.getItem('texera_config')) || {
    whatsapp: "5513988742647",
    senhaAdmin: "1234"
};
let STATS = JSON.parse(localStorage.getItem('texera_stats')) || { visitas: 0, orçamentos: 0 };
let chatStep = 0; 
let userData = { nome: "", necessidade: "", prazo: "" };

// --- NAVEGAÇÃO SPA ---
function mostrarPagina(id) {
    document.querySelectorAll('.overlay-page').forEach(p => p.style.display = 'none');
    const pg = document.getElementById(id);
    if(pg) pg.style.display = 'flex';
}

function voltarHome() {
    document.querySelectorAll('.overlay-page').forEach(p => p.style.display = 'none');
    fecharZoom();
}

function fecharAoClicarFora(e) {
    if (e.target.classList.contains('overlay-page')) voltarHome();
}

// --- GALERIA E ZOOM ---
function expandirImagem(card) {
    const img = card.querySelector('img');
    const modal = document.getElementById('image-light-box');
    document.getElementById('img-zoom-target').src = img.src;
    document.getElementById('text-zoom-target').innerText = img.getAttribute('data-desc');
    modal.style.display = 'flex';
}

function fecharZoom() {
    const modal = document.getElementById('image-light-box');
    if(modal) modal.style.display = 'none';
}

// --- CHATBOT FAQ INTELIGENTE ---
function toggleChat(e) {
    if(e) e.stopPropagation();
    const modal = document.getElementById('modal-chat');
    if(modal.style.display === 'block') {
        modal.style.display = 'none';
    } else {
        modal.style.display = 'block';
        if(document.getElementById('chat-box').innerHTML.trim() === "") iniciarChat();
    }
}

function iniciarChat() {
    chatStep = 0;
    addMessage("bot", "Olá! Sou o assistente da **Texera**. Como posso ajudar hoje?");
    setTimeout(() => {
        const faq = `
            <button class="btn-faq" onclick="handleFAQ('atendimento')">Onde atendem?</button>
            <button class="btn-faq" onclick="handleFAQ('pagamento')">Formas de pagamento?</button>
            <button class="btn-faq" style="background:var(--primary); color:white;" onclick="iniciarOrcamento()">Quero um Orçamento!</button>
        `;
        addMessage("bot", faq);
    }, 600);
}

function handleFAQ(tipo) {
    if(tipo === 'atendimento') {
        addMessage("user", "Onde vocês atendem?");
        setTimeout(() => addMessage("bot", "Atendemos em todo o **Litoral Sul e Baixada Santista** (Itanhaém, Santos, Guarujá, etc). 📍"), 500);
    } else {
        addMessage("user", "Quais as formas de pagamento?");
        setTimeout(() => addMessage("bot", "Pix, Transferência e Cartão de Crédito. Facilitamos sua obra! 💳"), 500);
    }
}

function iniciarOrcamento() {
    addMessage("user", "Quero um orçamento!");
    chatStep = 1;
    setTimeout(() => addMessage("bot", "Excelente! Qual é o seu **nome**?"), 600);
}

function handleBotLogic() {
    const input = document.getElementById('bot-input');
    const text = input.value.trim();
    if(!text) return;
    addMessage("user", text);
    input.value = "";

    setTimeout(() => {
        if(chatStep === 1) { userData.nome = text; chatStep = 2; addMessage("bot", `Prazer, **${text}**! O que você precisa fazer na obra?`); }
        else if(chatStep === 2) { userData.necessidade = text; chatStep = 3; addMessage("bot", "E para **quando** você precisa desse serviço?"); }
        else if(chatStep === 3) {
            userData.prazo = text; chatStep = 4;
            addMessage("bot", "Anotado! Agora clique abaixo para concluir no WhatsApp:");
            const link = `https://wa.me/${CONFIG.whatsapp}?text=*CONTATO SITE*%0A*Nome:* ${userData.nome}%0A*Serviço:* ${userData.necessidade}%0A*Prazo:* ${userData.prazo}`;
            addMessage("bot", `<a href="${link}" target="_blank" class="btn-concluir-chat">CONCLUIR ATENDIMENTO <i class="fab fa-whatsapp"></i></a>`);
        }
    }, 800);
}

function fecharChatExterno(e) { if(e.target.id === 'modal-chat') toggleChat(); }
function addMessage(sender, text) {
    const box = document.getElementById('chat-box');
    const msg = document.createElement('div');
    msg.className = `msg ${sender}`;
    msg.innerHTML = text;
    box.appendChild(msg);
    box.scrollTop = box.scrollHeight;
}

// --- ORÇAMENTO E ADMIN ---
document.addEventListener('input', (e) => {
    if(e.target.id === 'telefone') {
        let v = e.target.value.replace(/\D/g,'');
        v = v.replace(/^(\d{2})(\d)/g,"($1) $2").replace(/(\d{5})(\d)/,"$1-$2");
        e.target.value = v.substring(0,15);
    }
});

const formOrcamento = document.getElementById('formOrcamento');
if(formOrcamento) {
    formOrcamento.onsubmit = function(e) {
        e.preventDefault();
        STATS.orçamentos++;
        localStorage.setItem('texera_stats', JSON.stringify(STATS));
        const msg = `*ORÇAMENTO GRÁTIS*%0A*Nome:* ${document.getElementById('nome').value}%0A*Serviço:* ${document.getElementById('servico').value}`;
        window.open(`https://wa.me/${CONFIG.whatsapp}?text=${msg}`);
    };
}

let clicks = 0;
document.getElementById('secret-trigger').onclick = (e) => {
    e.stopPropagation();
    clicks++;
    if(clicks >= 5) {
        clicks = 0;
        if(prompt("Senha:") === CONFIG.senhaAdmin) {
            document.getElementById('stats-area').innerHTML = `Visitas: ${STATS.visitas} | Pedidos: ${STATS.orçamentos}`;
            mostrarPagina('admin-page');
        }
    }
};

function salvarConfig() {
    const wa = document.getElementById('admin-whatsapp').value.replace(/\D/g,'');
    if(wa) CONFIG.whatsapp = wa;
    const ns = document.getElementById('admin-password-input').value;
    if(ns) CONFIG.senhaAdmin = ns;
    localStorage.setItem('texera_config', JSON.stringify(CONFIG));
    alert("Dados salvos!");
    voltarHome();
}

window.onload = () => { STATS.visitas++; localStorage.setItem('texera_stats', JSON.stringify(STATS)); };