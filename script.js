// Número do WhatsApp (substitua apenas aqui)
const numeroWhatsApp = '5513988742646'; // Exemplo: 5511999999999

// Rolagem suave para links âncora do menu
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Abrir/fechar formulário de orçamento
const btnAbrirFormulario = document.getElementById('btnAbrirFormulario');
const formOrcamento = document.getElementById('formOrcamento');

btnAbrirFormulario.addEventListener('click', () => {
  formOrcamento.classList.toggle('hidden');
  if (!formOrcamento.classList.contains('hidden')) {
    formOrcamento.scrollIntoView({ behavior: 'smooth' });
  }
});

// Máscara para telefone em tempo real (formato brasileiro)
document.getElementById('telefone').addEventListener('input', function (e) {
  let value = e.target.value.replace(/\D/g, '');

  // Limita o tamanho a 11 dígitos (DDD + número)
  if (value.length > 11) value = value.slice(0, 11);

  // Aplica máscara conforme quantidade de dígitos
  if (value.length > 6) {
    value = value.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
  } else if (value.length > 2) {
    value = value.replace(/(\d{2})(\d{0,5})/, '($1) $2');
  } else if (value.length > 0) {
    value = value.replace(/(\d{0,2})/, '($1');
  }

  e.target.value = value;
});

// Envio do formulário para WhatsApp via link formatado
formOrcamento.addEventListener('submit', function (e) {
  e.preventDefault();

  const servico = document.getElementById('servico').value.trim();
  const nome = document.getElementById('nome').value.trim();
  const endereco = document.getElementById('endereco').value.trim();
  const telefone = document.getElementById('telefone').value.trim();

  // Validação básica dos campos obrigatórios
  if (!servico || !nome || !endereco || !telefone) {
    alert('Por favor, preencha todos os campos.');
    return;
  }

  // Remove caracteres não numéricos do telefone para validação
  const telefoneNumerico = telefone.replace(/\D/g, '');

  // Valida telefone com DDD (10 ou 11 dígitos)
  const telefoneValido = /^\d{10,11}$/.test(telefoneNumerico);
  if (!telefoneValido) {
    alert('Digite um número de telefone válido com DDD.');
    return;
  }

  // Monta a mensagem para envio
  const mensagem = `Olá, gostaria de um orçamento.\n\nTipo de serviço: ${servico}\nNome: ${nome}\nEndereço: ${endereco}\nTelefone: ${telefone}`;

  // Gera URL do WhatsApp com mensagem codificada
  const url = `https://wa.me/${5513988742646}?text=${encodeURIComponent(mensagem)}`;

  // Abre o link em nova aba
  window.open(url, '_blank');
});
