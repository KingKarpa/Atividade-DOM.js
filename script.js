(function() {
  'use strict'

  var forms = document.querySelectorAll('.needs-validation')

  Array.prototype.slice.call(forms)
    .forEach(function(form) {
      form.addEventListener('submit', function(event) {
        if (!form.checkValidity()) {
          form.classList.add('was-validated')
        } else {
          inserir()
          form.classList.remove('was-validated')
          form.reset()
        }
        event.preventDefault()
        event.stopPropagation()
      }, false)
    })
})()


function getLocalStorage() {
  return JSON.parse(localStorage.getItem('bd_monitores')) ?? [];
}

function setLocalStorage(bd_monitores) {
  localStorage.setItem('bd_monitores', JSON.stringify(bd_monitores));
}

function limparTabela() {
  var elemento = document.querySelector("#tabela>tbody");
  while (elemento.firstChild) {
    elemento.removeChild(elemento.firstChild);
  }
}

function atualizarTabela() { // Adaptação da função atualizarTabela (5 pontos)
  limparTabela();
  const bd_monitores = getLocalStorage();
  let index = 0;
  for (monitor of bd_monitores) {
    const novaLinha = document.createElement('tr');
    novaLinha.innerHTML = `
        <th scope="row">${index}</th>
        <td>${monitor.nome}</td>
        <td>${monitor.barras}</td>
        <td>${monitor.resolucao}</td>
        <td>${monitor.entrada}</td>
        <td>${monitor.polegadas}</td>
        <td>${monitor.hertz}</td>
        <td>
            <button type="button" class="btn btn-danger" id="${index}" onclick="excluir(${index})">Excluir</button>
        </td>
    `
    document.querySelector('#tabela>tbody').appendChild(novaLinha)
    index++;
  }
}

function inserir() { // Adaptação da função inserir (10 pontos)
  const monitor = {
    nome: document.getElementById('nome').value,
    barras: concatenarCodBarras(),
    resolucao: document.getElementById('resolucao').value,
    entrada: verificarEntradas(),
    polegadas: document.getElementById('polegadas').value,
    hertz: document.getElementById('hertz').value
  }
  const bd_monitores = getLocalStorage();
  bd_monitores.push(monitor);
  setLocalStorage(bd_monitores);
  atualizarTabela();
}

// Função que calcula e retorna o último digíto do código de barras
// Os 7 primeiros dígitos são pré-definidos, endicando o país e empresa de origem do produto
// Os 4 dígitos seguintes servem para identificar o produto, variando de produto para produto
// Enquanto o último dígito (CodCheck) é calculado e serve para verificar a composição de todo código
// Obs: processo e equação similar aos da realidade
function calcularDigitoCheck(){
  const codProdutor_1 = document.getElementById('cod-produtor').value;
  const codMonitor_2 = document.getElementById('cod-monitor').value;
  var somBarraNoCheck = 0;
  if (!Number.isNaN(parseInt(codMonitor_2))){
    const codBarraNoCheck = codProdutor_1 + codMonitor_2;
    for (i=0; codBarraNoCheck.length > i; i++){
      if (i % 2 == 0){
        somBarraNoCheck += parseInt(codBarraNoCheck[i])*3;
      } else {
        somBarraNoCheck += parseInt(codBarraNoCheck[i]);
      }
    }
    return ((10 - (somBarraNoCheck % 10))).toString();
  }
}

// Essa função junta (concatena) as três partes do código de barras como string e retorna o valor para o objeto monitor definido acima
function concatenarCodBarras(){
  const codProdutor_1 = document.getElementById('cod-produtor').value;
  const codMonitor_2 = document.getElementById('cod-monitor').value;
  const codCheck_3 = document.getElementById('cod-check').value;
  return codProdutor_1 + codMonitor_2 + codCheck_3;
}

// Essa função verifica se apenas o primeiro valor (obrigatório) de entrada do monitor foi preenchido
// Caso o segundo valor (opcional) também esteja preenchido, os dois inputs são concatenados e enviados para o obejto monitor definido acima
function verificarEntradas(){
  const entradaUm = document.getElementById('entrada-1').value;
  const entradaDois = document.getElementById('entrada-2').value;
  if (entradaDois !== ''){
    return entradaUm + ', ' + entradaDois;
  } else {
    return entradaUm;
  }
}

function excluir(index) { // Adaptação da função excluir (5 pontos)
  const bd_monitores = getLocalStorage();
  bd_monitores.splice(index, 1);
  setLocalStorage(bd_monitores);
  atualizarTabela();
}

// Como dito acima, o segundo grupo de dígitos do código de barras varia de produto para produto, ou seja, um mesmo código de barras não pode ser compartilhado por produtos diferentes
function validarMonitor() { // Adaptação da função validar (10 pontos)
  const bd_monitores = getLocalStorage();
  for (monitor of bd_monitores) {
    if (concatenarCodBarras() == monitor.barras) {
      cod_Monitor.setCustomValidity("Este código de monitor já existe!");
      feedbackMonitor.innerText = "Este código de monitor já existe!";
      return false;
    } else {
      cod_Monitor.setCustomValidity("");
      feedbackMonitor.innerText = "Informe o código corretamente.";
    }
  }
  return true;
}

atualizarTabela();
// Seleção dos elementos e adição do listener para validação customizada (5 pontos)
const cod_Monitor = document.getElementById("cod-monitor");
const feedbackMonitor = document.getElementById('feedbackMonitor');
// Sempre que o segundo grupo de dígitos é completamente digitado (4 números) o valor do último dígito é alterado, pois a fórmula pôde ser executada
// Por fim, a cada atualização do input o novo código de barras é comparado com os dos monitores já cadastrados na lista
// Caso haja dois códigos de barras iguais ao fim da concatenação, o envio do cadastro é impedido e uma mensagem personalizada é exibida
cod_Monitor.addEventListener('input', () => {
  if (cod_Monitor.value.length == 4){
    document.getElementById('cod-check').value = calcularDigitoCheck();
    validarMonitor();
  } else {
    document.getElementById('cod-check').value = '';
  }
});

