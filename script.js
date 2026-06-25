// --- CONFIG E ESTADO ---
let CONFIG = JSON.parse(localStorage.getItem('texera_config')) || {
    whatsapp: "5513996381799",
    senhaAdmin: "1234"
};
let STATS = JSON.parse(localStorage.getItem('texera_stats')) || { visitas: 0, orçamentos: 0 };

// Estado do Chatbot
const chatMessages = document.getElementById('chat-messages');
const typingIndicator = document.getElementById('typing-indicator');
const chatInputArea = document.getElementById('chat-input-area');
let botStep = 0;
let botUserData = { nome: '', servicoTipo: '', localizacao: '', enderecoCompleto: '', imovelTipo: '', descricao: '', urgencia: '' };

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

// --- MOTOR DO CHATBOT ---
function capitalizeText(str) {
    return str.toLowerCase().replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
}

function toggleChat(e) {
    if(e) e.stopPropagation();
    const win = document.getElementById('chatbot-window');
    const isOpen = win.style.display === 'flex';
    win.style.display = isOpen ? 'none' : 'flex';
    if (!isOpen && chatMessages.innerHTML === '') {
        startChat();
    }
}

function showTyping(show) {
    if(typingIndicator) typingIndicator.style.display = show ? 'block' : 'none';
    if(chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addBotMessage(text, type, options = []) {
    const div = document.createElement('div');
    div.className = 'msg ' + (type === 'bot' ? 'bot-msg' : 'user-msg');
    div.innerText = text;
    chatMessages.appendChild(div);

    if (options.length > 0) {
        const replyDiv = document.createElement('div');
        replyDiv.className = 'quick-replies';
        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'reply-btn';
            btn.innerText = opt;
            btn.onclick = () => handleOption(opt);
            replyDiv.appendChild(btn);
        });
        chatMessages.appendChild(replyDiv);
    }
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function startChat() {
    showTyping(true);
    setTimeout(() => {
        showTyping(false);
        const savedData = localStorage.getItem('texera_chat_data');
        const savedStep = localStorage.getItem('texera_chat_step');
        
        if (savedData && savedStep && parseInt(savedStep) > 1) {
            botUserData = JSON.parse(savedData);
            botStep = parseInt(savedStep);
            addBotMessage(`Olá! Que bom vê-lo de volta na Texera Construções. Vamos continuar o seu atendimento, ${botUserData.nome}?`, "bot");
            voltarAoFluxoConstrucao();
        } else {
            addBotMessage("Olá! Seja bem-vindo à Texera Construções. Para direcionar você ao engenheiro ou técnico correto, qual é o seu nome?", "bot");
            botStep = 1;
        }
    }, 1000);
}

function handleUserInput() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    processBotStep(text);
}

function handleOption(opt) {
    processBotStep(opt);
}

function processBotStep(text) {
    addBotMessage(text, "user");
    showTyping(true);

    setTimeout(() => {
        showTyping(false);
        
        if (botStep === 1) {
            botUserData.nome = capitalizeText(text);
            addBotMessage(`Muito prazer, ${botUserData.nome}! Qual é o tipo de serviço que você precisa hoje?`, "bot", ["Obra do Zero / Fundação", "Reforma / Revitalização", "Manutenção Preventiva", "Atendimento Emergencial 🚨"]);
            botStep = 2;
        } else if (botStep === 2) {
            botUserData.servicoTipo = text;
            if (text.includes("Emergencial")) {
                botUserData.urgencia = "IMEDIATA / URGENTE";
                addBotMessage("Entendido! Para atendimentos emergenciais o nosso acionamento é prioritário. Em qual cidade fica o imóvel?", "bot");
                botStep = 3;
            } else {
                botUserData.urgencia = "Planejado / Padrão";
                addBotMessage("Perfeito. Para qual tipo de imóvel será o serviço?", "bot", ["Residencial", "Comercial / Empresa", "Condomínio / Prédio"]);
                botStep = 4;
            }
        } else if (botStep === 3) {
            botUserData.localizacao = text;
            addBotMessage("Por favor, digite o endereço completo do local (informando Rua, Número, Bairro e um Ponto de Referência):", "bot");
            botStep = 7;
        } else if (botStep === 4) {
            botUserData.imovelTipo = text;
            addBotMessage("Em qual cidade/região está localizada a sua obra ou imóvel?", "bot");
            botStep = 6;
        } else if (botStep === 6) {
            botUserData.localizacao = text;
            addBotMessage("Por favor, digite o endereço completo da obra/imóvel (informando Rua, Número, Bairro e um Ponto de Referência):", "bot");
            botStep = 7;
        } else if (botStep === 7) {
            botUserData.enderecoCompleto = text;
            addBotMessage("Selecione qual das opções abaixo melhor descreve a natureza do serviço ou problema no local:", "bot", ["Pintura", "Infiltração", "Telhado", "Elétrica", "Encanamento", "Outros serviços"]);
            botStep = 5;
        } else if (botStep === 5) {
            if (text === "Outros serviços") {
                addBotMessage("Por favor, descreva brevemente qual serviço ou reparo você precisa no local:", "bot");
                botStep = 8;
            } else {
                botUserData.descricao = text;
                irParaFinalizacaoConstrucao();
            }
        } else if (botStep === 8) {
            botUserData.descricao = text;
            irParaFinalizacaoConstrucao();
        } else if (botStep === 14) {
            if (text === "Sim, está correto") {
                STATS.orçamentos++;
                localStorage.setItem('texera_stats', JSON.stringify(STATS));
                
                addBotMessage("Perfeito! Clique no botão abaixo para concluir o envio da sua ficha técnica diretamente para a nossa equipe no WhatsApp.", "bot");
                
                const zapText = `Olá, me chamo ${botUserData.nome}. Solicito atendimento técnico para a Texera Construções:\n- Categoria: ${botUserData.servicoTipo}\n- Prioridade: ${botUserData.urgencia}\n- Cidade: ${botUserData.localizacao}\n- Endereço: ${botUserData.enderecoCompleto}\n- Tipo de Imóvel: ${botUserData.imovelTipo || 'Manutenção/Emergência'}\n- Problema/Serviço: ${botUserData.descricao}`;
                
                const link = document.createElement('a');
                link.href = `https://wa.me/${CONFIG.whatsapp}?text=` + encodeURIComponent(zapText);
                link.target = "_blank";
                link.className = "reply-btn";
                link.style.display = "block";
                link.style.marginTop = "15px";
                link.style.textAlign = "center";
                link.style.padding = "14px";
                link.style.backgroundColor = "var(--primary)";
                link.style.color = "white";
                link.style.fontWeight = "bold";
                link.style.textDecoration = "none";
                link.style.borderRadius = "6px";
                link.innerText = "Chamar Engenharia no WhatsApp";
                
                chatMessages.appendChild(link);
                
                // CORREÇÃO: Sintaxe limpa corrigindo o bug do .style.style duplicado
                if(chatInputArea) chatInputArea.style.display = "none";

                setTimeout(() => {
                    const successDiv = document.createElement('div');
                    successDiv.style.textAlign = "center";
                    successDiv.style.fontSize = "0.8rem";
                    successDiv.style.color = "#10b981";
                    successDiv.style.marginTop = "8px";
                    successDiv.innerHTML = "<i class='fas fa-check-circle'></i> Protocolo de atendimento gerado com sucesso.";
                    chatMessages.appendChild(successDiv);
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                }, 100);
                
                localStorage.removeItem('texera_chat_data');
                localStorage.removeItem('texera_chat_step');
                botStep = 15;
            } else if (text === "Não, preciso corrigir") {
                localStorage.removeItem('texera_chat_data');
                localStorage.removeItem('texera_chat_step');
                botUserData = { nome: '', servicoTipo: '', localizacao: '', enderecoCompleto: '', imovelTipo: '', descricao: '', urgencia: '' };
                botStep = 1;
                addBotMessage("Sem problemas! Vamos reiniciar o processo para corrigir os dados. Qual é o seu nome?", "bot");
            } else {
                // CORREÇÃO: Tratamento para entradas inválidas no passo de validação
                addBotMessage("Por favor, utilize os botões de resposta para confirmar seus dados.", "bot", ["Sim, está correto", "Não, preciso corrigir"]);
            }
        } else {
            if(chatInputArea) chatInputArea.style.display = "flex";
            addBotMessage("Como a Texera Construções pode te ajudar agora?", "bot", ["Solicitar Novo Orçamento"]);
            botStep = 1;
        }

        if (botStep < 14) {
            localStorage.setItem('texera_chat_data', JSON.stringify(botUserData));
            localStorage.setItem('texera_chat_step', botStep.toString());
        }
    }, 1000);
}

function voltarAoFluxoConstrucao() {
    if (botStep === 2) addBotMessage(`Qual é o tipo de serviço que você precisa hoje?`, "bot", ["Obra do Zero / Fundação", "Reforma / Revitalização", "Manutenção Preventiva", "Atendimento Emergencial 🚨"]);
    else if (botStep === 3 || botStep === 6) addBotMessage("Em qual cidade/região está localizada a sua obra ou imóvel?", "bot");
    else if (botStep === 4) addBotMessage("Para qual tipo de imóvel será o serviço?", "bot", ["Residencial", "Comercial / Empresa", "Condomínio / Prédio"]);
    else if (botStep === 7) addBotMessage("Por favor, digite o endereço completo da obra/imóvel (informando Rua, Número, Bairro e um Ponto de Referência):", "bot");
    else if (botStep === 5) addBotMessage("Selecione qual das opções abaixo melhor descreve a natureza do serviço ou problema no local:", "bot", ["Pintura", "Infiltração", "Telhado", "Elétrica", "Encanamento", "Outros serviços"]);
    else if (botStep === 8) addBotMessage("Por favor, descreva brevemente qual serviço ou reparo você precisa no local:", "bot");
}

function irParaFinalizacaoConstrucao() {
    const resumoTexto = `📋 FICHA TÉCNICA DE ATENDIMENTO:\n\n` +
                        `• Solicitante: ${botUserData.nome}\n` +
                        `• Tipo de Serviço: ${botUserData.servicoTipo}\n` +
                        `• Prioridade: ${botUserData.urgencia}\n` +
                        `• Cidade: ${botUserData.localizacao}\n` +
                        `• Local do Serviço: ${botUserData.enderecoCompleto}\n` +
                        `• Tipo de Imóvel: ${botUserData.imovelTipo || 'Manutenção/Emergência'}\n` +
                        `• Problema/Serviço: ${botUserData.descricao}`;

    addBotMessage(resumoTexto, "bot");
    setTimeout(() => {
        addBotMessage("As informações da sua solicitação estão corretas?", "bot", ["Sim, está correto", "Não, preciso corrigir"]);
        botStep = 14;
    }, 500);
}

// --- CONFIGURAÇÃO DE MÁSCARA DO FORMULÁRIO ESTÁTICO ---
document.addEventListener('input', (e) => {
    if(e.target.id === 'telefone') {
        let v = e.target.value.replace(/\D/g,'');
        v = v.replace(/^(\d{2})(\d)/g,"($1) $2").replace(/(\d{5})(\d)/,"$1-$2");
        e.target.value = v.substring(0,15);
    }
});

// Envio do formulário estático tradicional da SPA
const formOrcamento = document.getElementById('formOrcamento');
if(formOrcamento) {
    formOrcamento.onsubmit = function(e) {
        e.preventDefault();
        STATS.orçamentos++;
        localStorage.setItem('texera_stats', JSON.stringify(STATS));
        const msg = `*ORÇAMENTO GRÁTIS SITE*%0A*Nome:* ${document.getElementById('nome').value}%0A*Serviço:* ${document.getElementById('servico').value}`;
        window.open(`https://wa.me/${CONFIG.whatsapp}?text=${msg}`);
    };
}

// --- GATILHO SECRETO DO PAINEL ADMIN ---
let clicks = 0;
const trigger = document.getElementById('secret-trigger');
if(trigger) {
    trigger.onclick = (e) => {
        e.stopPropagation();
        clicks++;
        if(clicks >= 5) {
            clicks = 0;
            if(prompt("Senha de Acesso Admin:") === CONFIG.senhaAdmin) {
                document.getElementById('stats-area').innerHTML = `Visitas Totais: ${STATS.visitas} | Orçamentos Gerados: ${STATS.orçamentos}`;
                mostrarPagina('admin-page');
            }
        }
    };
}

function salvarConfig() {
    const wa = document.getElementById('admin-whatsapp').value.replace(/\D/g,'');
    if(wa) CONFIG.whatsapp = wa;
    const ns = document.getElementById('admin-password-input').value;
    if(ns) CONFIG.senhaAdmin = ns;
    localStorage.setItem('texera_config', JSON.stringify(CONFIG));
    alert("Configurações atualizadas com sucesso!");
    voltarHome();
}

// Event Listener para Input de Texto do Chatbot
const chatInput = document.getElementById('chat-input');
if(chatInput) {
    chatInput.addEventListener('keypress', (e) => { if(e.key === 'Enter') handleUserInput(); });
}

window.onload = () => { 
    STATS.visitas++; 
    localStorage.setItem('texera_stats', JSON.stringify(STATS)); 
};