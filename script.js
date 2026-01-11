// Configuração Global
const numeroWhatsApp = '5513988742647';

/**
 * INICIALIZAÇÃO DO SITE
 * Executa quando o HTML termina de carregar
 */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Injetar o Widget do Chatbot em todas as páginas automaticamente
    const body = document.body;
    const chatHTML = `
        <div id="chat-widget-container">
            <button id="chat-button" onclick="toggleChat()" aria-label="Abrir Chat">💬</button>
            <div id="chat-window" class="hidden">
                <div class="chat-header" style="background:#b71c1c;color:white;padding:15px;font-weight:bold;display:flex;justify-content:space-between;border-radius:15px 15px 0 0;">
                    <span>Atendimento Texera</span>
                    <button onclick="toggleChat()" style="background:none;border:none;color:white;cursor:pointer;font-size:18px;">✖</button>
                </div>
                <div id="chat-messages" style="flex:1;padding:15px;overflow-y:auto;display:flex;flex-direction:column;gap:10px;background:#f9f9f9;height:300px;"></div>
                <div class="chat-input-area" style="display:flex;padding:10px;border-top:1px solid #eee;background:white;">
                    <input type="text" id="bot-input" style="flex:1;border:none;outline:none;padding:5px;" placeholder="Digite sua dúvida...">
                    <button onclick="handleBotLogic()" style="background:none;border:none;color:#b71c1c;font-size:20px;cursor:pointer;">➤</button>
                </div>
            </div>
        </div>`;
    body.insertAdjacentHTML('beforeend', chatHTML);

    // 2. Máscara de Telefone em tempo real (apenas se o campo existir na página)
    const telInput = document.getElementById('telefone');
    if (telInput) {
        telInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, ''); // Remove tudo que não é número
            if (value.length > 11) value = value.slice(0, 11);

            // Aplica a formatação (13) 99999-9999
            if (value.length > 6) {
                value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
            } else if (value.length > 2) {
                value = value.replace(/(\d{2})(\d{0,5})/, '($1) $2');
            } else if (value.length > 0) {
                value = value.replace(/(\d{0,2})/, '($1');
            }
            e.target.value = value;
        });
    }

    // 3. Listener para o formulário de orçamento (apenas se existir na página)
    const formOrcamento = document.getElementById('formOrcamento');
    if (formOrcamento) {
        formOrcamento.addEventListener('submit', enviarOrcamento);
    }
});

/**
 * LÓGICA DO CHATBOT
 */
function toggleChat() {
    const win = document.getElementById('chat-window');
    win.classList.toggle('hidden');
    
    const msgBox = document.getElementById('chat-messages');
    if (msgBox.innerHTML === "") {
        addMsg("bot", "Olá! Sou o assistente virtual da Texera Construções. 🏗️");
        setTimeout(() => {
            addMsg("bot", "Como posso te ajudar? Você pode perguntar sobre 'orçamento', 'serviços' ou 'contato'.");
        }, 600);
    }
}

function addMsg(sender, text) {
    const msgBox = document.getElementById('chat-messages');
    const div = document.createElement('div');
    // As classes bot-msg e user-msg devem estar no seu style.css
    div.className = sender === "bot" ? "bot-msg" : "user-msg";
    div.innerText = text;
    msgBox.appendChild(div);
    msgBox.scrollTop = msgBox.scrollHeight; // Rola para o fim da conversa
}

function handleBotLogic() {
    const input = document.getElementById('bot-input');
    const text = input.value.toLowerCase().trim();
    if (!text) return;

    addMsg("user", input.value);
    input.value = "";

    // Simula tempo de resposta do robô
    setTimeout(() => {
        if (text.includes("orçamento") || text.includes("preço") || text.includes("valor")) {
            addMsg("bot", "Trabalhamos com projetos sob medida. Para um valor exato, preencha nossa página de 'Orçamento' ou envie fotos da obra aqui no Zap!");
        } 
        else if (text.includes("serviço") || text.includes("fazem") || text.includes("limpeza")) {
            addMsg("bot", "Realizamos desde a fundação ao acabamento, além de reparos em chuveiros, infiltrações e limpeza de telhados.");
        }
        else if (text.includes("contato") || text.includes("whatsapp") || text.includes("falar com alguém")) {
            addMsg("bot", "Você pode falar agora com nosso mestre de obras pelo WhatsApp:");
            addMsg("bot", "Link: https://wa.me/" + numeroWhatsApp);
        }
        else if (text.includes("onde") || text.includes("endereço") || text.includes("cidade")) {
            addMsg("bot", "Nossa base é em Itanhaém, mas atendemos toda a região! 📍");
        }
        else {
            addMsg("bot", "Não entendi muito bem... 🤔 Tente digitar 'serviços' ou peça para falar com um 'humano'.");
        }
    }, 800);
}

/**
 * ENVIO DE FORMULÁRIO PARA WHATSAPP
 */
function enviarOrcamento(event) {
    event.preventDefault();

    const nome = document.getElementById('nome').value;
    const telefone = document.getElementById('telefone').value;
    const servico = document.getElementById('servico').value;
    const endereco = document.getElementById('endereco') ? document.getElementById('endereco').value : "Não informado";

    // Validação básica
    if (!nome || !telefone || !servico) {
        alert("Por favor, preencha os campos obrigatórios.");
        return;
    }

    // Monta a mensagem para o WhatsApp
    const mensagem = `*Solicitação de Orçamento - Site*%0A%0A` +
                     `*Nome:* ${nome}%0A` +
                     `*Telefone:* ${telefone}%0A` +
                     `*Serviço:* ${servico}%0A` +
                     `*Endereço:* ${endereco}`;

    // Abre o link do WhatsApp
    const url = `https://wa.me/${numeroWhatsApp}?text=${mensagem}`;
    window.open(url, '_blank');
}