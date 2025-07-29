/// --- VERIFICA LOGIN ---
if (!localStorage.getItem('role')) {
    // Se não estiver logado (ou se as chaves do localStorage não existirem), redireciona para login.
    window.location.href = "login.html";
}
// --- FIM VERIFICA LOGIN ---

// --- INÍCIO: INTEGRAÇÃO SUPABASE ---
const supabaseUrl = 'https://jnwexcchxzjbjdfwgfbt.supabase.co'; // SUA URL DO PROJETO SUPABASE
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impud2V4Y2NoeHpqYmpkZndnZmJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MzA1MTYsImV4cCI6MjA2OTMwNjUxNn0.bTQ9AxnD9qJZkaaVb6w0VomR6yAp6ye4SIEwQ52mYBs'; // SUA ANON PUBLIC KEY SUPABASE
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
// --- FIM: INTEGRAÇÃO SUPABASE ---

let maquinas = {}; // Objeto para armazenar os dados das máquinas carregados do Supabase
// Se o usuário não estiver logado (e, portanto, redirecionado), essas linhas nem serão executadas.
// Se ele estiver logado, o login.html já terá populado o localStorage.
const role = localStorage.getItem('role');
const nomeUsuario = localStorage.getItem('nomeUsuario') || 'Desconhecido'; // Evita undefined caso algo dê errado ou não esteja definido.

const registrosPorPagina = 6; // PAGINAÇÃO: 6 cards por página
let paginaAtual = 1;

let filtroTexto = '';
let ordenarPor = 'maisRecente'; // padrão ordenar do mais recente para o mais antigo

// Conjunto para armazenar os IDs dos cards selecionados no painel (para imprimir OS)
const selectedCards = new Set();

// NOVO: Variáveis para controle da seleção múltipla no formulário de cadastro
let isMultiSelectActive = false;
let selectedMachinesForForm = new Set(); // Armazenará os IDs das máquinas selecionadas no formulário

// LISTA DE TÉCNICOS FIXOS (em ordem alfabética) ---
const listaTecnicosFixos = [
    "Cláudio",
    "Edgar",
    "Ivanildo",
    "Júlio",
    "Paulo César",
    "Sérgio",
    "Wilherson"
].sort(); // Já ordenada alfabeticamente
// --- FIM NOVO: LISTA DE TÉCNICOS FIXOS ---

// --- ESPECIFICAÇÕES DAS MÁQUINAS
const maquinaEspecificacoes = {
    "lavadora01": { nome: "Lavadora Suzuki 50KG - 01", marca: "SUZUKI", modelo: "MLEx 50", capacidade: "50KG" },
    "lavadora02": { nome: "Lavadora Suzuki 100KG - 02", marca: "SUZUKI", modelo: "MLEx 100", capacidade: "100KG" },
    "lavadora03": { nome: "Lavadora Suzuki 240KG - 03", marca: "SUZUKI", modelo: "MLEx 240H", capacidade: "240KG" },
    "lavadora04": { nome: "Lavadora Suzuki 240KG - 04", marca: "SUZUKI", modelo: "MLEx 240H", capacidade: "240KG" },
    "lavadora05": { nome: "Lavadora Suzuki 240KG - 05", marca: "SUZUKI", modelo: "MLEx 240H", capacidade: "240KG" },
    "lavadora06": { nome: "Lavadora Suzuki 240KG - 06", marca: "SUZUKI", modelo: "MLEx 240H", capacidade: "240KG" },
    "lavadora07": { nome: "Lavadora Suzuki 240KG - 07", marca: "SUZUKI", modelo: "MLEx 240H", capacidade: "240KG" },
    "lavadora08": { nome: "Lavadora Suzuki 240KG - 08", marca: "SUZUKI", modelo: "MLEx 240H", capacidade: "240KG" },
    "lavadora09": { nome: "Lavadora Suzuki 240KG - 09", marca: "SUZUKI", modelo: "MLEx 240H", capacidade: "240KG" },
    "lavadora10": { nome: "Lavadora Baumer 240KG - 10", marca: "BAUMER", modelo: "BAUMER 240KG", capacidade: "240KG" },
    "lavadora11": { nome: "Lavadora Sitec 200KG - 11", marca: "SITEC", modelo: "SLEX-H", capacidade: "200KG" },
    "lavadora12": { nome: "Lavadora Sitec 200KG - 12", marca: "SITEC", modelo: "SLEX-H", capacidade: "200KG" },
    "lavadora13": { nome: "Lavadora Sitec 100KG - 13", marca: "SITEC", modelo: "SLEX-H", capacidade: "100KG" },
    "secador01": { nome: "Secador Sitec 100KG - 01", marca: "SITEC", modelo: "SSV", capacidade: "100KG" },
    "secador02": { nome: "Secador Sitec 100KG - 02", marca: "SITEC", modelo: "SSV", capacidade: "100KG" },
    "secador03": { nome: "Secador Sitec 100KG - 03", marca: "SITEC", modelo: "SSV", capacidade: "100KG" },
    "secador04": { nome: "Secador Sitec 100KG - 04", marca: "SITEC", modelo: "SSV", capacidade: "100KG" },
    "secador05": { nome: "Secador Sitec 100KG - 05", marca: "SITEC", modelo: "SSV", capacidade: "100KG" },
    "secador06": { nome: "Secador Sitec 100KG - 06", marca: "SITEC", modelo: "SSV", capacidade: "100KG" },
    "secador07": { nome: "Secador Sitec 100KG - 07", marca: "SITEC", modelo: "SSV", capacidade: "100KG" },
    "secador08": { nome: "Secador Suzuki 140KG - 08", marca: "SUZUKI", modelo: "SCV 140", capacidade: "140KG" },
    "secador09": { nome: "Secador Suzuki 140KG - 09", marca: "SUZUKI", modelo: "SCV 140", capacidade: "140KG" },
    "secador10": { nome: "Secador Suzuki 100KG - 10", marca: "SUZUKI", modelo: "3100V", capacidade: "100KG" },
    "secador11": { nome: "Secador Suzuki 100KG - 11", marca: "SUZUKI", modelo: "3100V", capacidade: "100KG" },
    "secador12": { nome: "Secador Suzuki 100KG - 12", marca: "SUZUKI", modelo: "3100V", capacidade: "100KG" },
    "secador13": { nome: "Secador Sitec 50KG - 13", marca: "SITEC", modelo: "SSV", capacidade: "50KG" },
    "calandra01": { nome: "Calandra Suzuki 8 Rolos - 01", marca: "SUZUKI", modelo: "CLR4R250V" },
    "calandra02": { nome: "Calandra Sitec 7 Rolos - 02", marca: "SITEC", modelo: "4SCM 270/45" },
    "calandra03": { nome: "Calandra Sitec 8 Rolos - 03", marca: "SITEC", modelo: "4SCM 270/45" },
    "dobrador01": { nome: "Dobrador com Empilhador Vega - 01", marca: "VEGA MALTEC", modelo: "VMF 2/3 - 1" },
    "dobrador02": { nome: "Dobrador com Empilhador Vega - 02", marca: "VEGA MALTEC", modelo: "VMF 2/3 - 1" },
    "dobrador03": { nome: "Dobrador com Empilhador Vega - 03", marca: "VEGA MALTEC", modelo: "VMF 2/3 - 1" },
    "compressor01": { nome: "Compressor Parafuso 40HP", marca: "INGERSOLRAND", modelo: "R30N - Tas", potencia: "40HP" },
    "compressor02": { nome: "Compressor Atlas Copco 425L - 02", marca: "ATLAS COPCO", modelo: "AT 15/60 - 425L", capacidade: "425L" },
    "compressor03": { nome: "Compressor Chiaperini 425L - 03", marca: "CHIAPERINI", modelo: "CJ 120 APW", capacidade: "425L" },
    // Adicionando a opção "Outros"
    "outros": { nome: "Outros", marca: "Diversas", modelo: "Variado", capacidade: "Variada" }
};

/**
 * Formata o ID da máquina (ex: "lavadora01") para um nome curto e legível (ex: "Lavadora 1").
 * @param {string} maquinaId O ID da máquina (ex: "lavadora01").
 * @returns {string} O nome formatado curto.
 */
function formatarNomeMaquinaCurto(maquinaId) {
    // Regex para capturar o prefixo (letras) e o número
    const match = maquinaId.match(/^([a-z]+)(\d+)$/i);
    if (match) {
        const tipo = match[1]; // ex: "lavadora"
        const numero = parseInt(match[2], 10); // ex: 1
        // Capitaliza a primeira letra do tipo
        const tipoFormatado = tipo.charAt(0).toUpperCase() + tipo.slice(1);
        return `${tipoFormatado} ${numero}`;
    }
    // Adiciona o tratamento para "outros"
    if (maquinaId === "outros") {
        return "Outros";
    }
    return maquinaId; // Retorna o ID original se não conseguir formatar
}

//  Funções de UI básicas

// Preenche o select de máquinas no formulário de registro E na aba de relatórios
function preencherSelectMaquinas() {
    const selectMaquinaCadastro = document.getElementById('maquina');
    const selectMaquinaRelatorio = document.getElementById('filtro-maquina-relatorio');

    // Limpa as opções existentes (exceto a primeira "Escolha" ou "Todas as Máquinas")
    // Para o select de cadastro, mantém a primeira opção padrão "Escolha"
    while (selectMaquinaCadastro.options.length > 0) { // Alterado para limpar todas se não houver um padrão pré-definido no HTML
        selectMaquinaCadastro.remove(0);
    }
    // Adiciona a opção padrão "Escolha" para o select de cadastro
    const optionDefaultCadastro = document.createElement('option');
    optionDefaultCadastro.value = "";
    optionDefaultCadastro.textContent = "-- Escolha --";
    selectMaquinaCadastro.appendChild(optionDefaultCadastro);

    // Para o select de relatório, mantém a primeira opção padrão "Todas as Máquinas"
    while (selectMaquinaRelatorio.options.length > 0) { // Alterado para limpar todas se não houver um padrão pré-definido no HTML
        selectMaquinaRelatorio.remove(0);
    }
    const optionDefaultRelatorio = document.createElement('option');
    optionDefaultRelatorio.value = "";
    optionDefaultRelatorio.textContent = "Todas as Máquinas";
    selectMaquinaRelatorio.appendChild(optionDefaultRelatorio);


    for (const id in maquinaEspecificacoes) {
        const optionCadastro = document.createElement('option');
        optionCadastro.value = id;
        optionCadastro.textContent = formatarNomeMaquinaCurto(id);
        selectMaquinaCadastro.appendChild(optionCadastro);

        const optionRelatorio = document.createElement('option');
        optionRelatorio.value = id;
        optionRelatorio.textContent = formatarNomeMaquinaCurto(id);
        selectMaquinaRelatorio.appendChild(optionRelatorio);
    }
    // NOVO: Renderiza a seleção inicial para o formulário (nenhuma)
    renderSelectedMachinesForForm();
}

// Mostra a aba correta
function showTab(tabId, event) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    if (event) event.target.classList.add('active');

    // Se for a aba do Painel, atualize o conteúdo
    if (tabId === 'painel') {
        atualizarPainel();
    }
    // Se for a aba de Relatórios, atualize o ranking mensal
    if (tabId === 'relatorios') {
        atualizarRankingMensal();
    }
    // NOVO: Se sair da aba de Cadastro, desativar modo multi-seleção
    if (tabId !== 'cadastro') {
        if (isMultiSelectActive) {
            toggleMultiSelectMode(); // Desativa o modo se estiver ativo
        }
    }
}

function logout() {
    Swal.fire({
        title: 'Sair?',
        text: "Você será desconectado do sistema.",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sim, sair!',
        cancelButtonText: 'Cancelar'
    }).then(async (result) => {
        if (result.isConfirmed) {
            const { error } = await supabase.auth.signOut();

            if (error) {
                console.error('Erro ao fazer logout:', error.message);
                Swal.fire('Erro!', 'Não foi possível desconectar: ' + error.message, 'error');
            } else {
                localStorage.clear(); // Limpa todas as informações do localStorage
                window.location.href = "login.html"; // Redireciona para a página de login
            }
        }
    });
}

function limparCampos() {
    const selectMaquina = document.getElementById('maquina');
    // NOVO: Limpa a seleção interna do Set e atualiza o select
    selectedMachinesForForm.clear();
    renderSelectedMachinesForForm(); // Isso vai desmarcar todas as opções visivelmente
    selectMaquina.value = ''; // Garante que a opção "-- Escolha --" seja mostrada

    document.getElementById('problema').value = '';
    document.getElementById('status').value = ''; // Reseta para o padrão vazio
    document.getElementById('data').value = new Date().toISOString().slice(0, 10); // Reseta para a data atual
    // Limpar o card de especificações ao limpar campos
    document.getElementById('cardEspecificacoesCadastro').innerHTML = `
        <h3>Especificações da Máquina</h3>
        <p>Selecione uma máquina para ver as especificações.</p>
    `;
    // NOVO: Desativar modo multi-seleção se estiver ativo
    if (isMultiSelectActive) {
        toggleMultiSelectMode();
    }
}

function formatarStatus(status) {
    if (status === 'afazer') return 'A Fazer';
    if (status === 'andamento') return 'Em Andamento';
    if (status === 'concluido') return 'Concluído';
    return status;
}

function formatarTempo(minutos) {
    const h = Math.floor(minutos / 60);
    const m = minutos % 60;
    if (h > 0) {
        return `${h}h ${m}min`;
    } else {
        return `${m}min`;
    }
}

// --- Funções de Manutenção (Painel) ---
function atualizarPainel() {
    const listaManutencoes = document.getElementById('listaManutencoes');
    if (!listaManutencoes) {
        console.error("Elemento com ID 'listaManutencoes' não encontrado.");
        return;
    }
    listaManutencoes.innerHTML = '';

    const filtroStatus = document.getElementById('filtroStatus') ? document.getElementById('filtroStatus').value : '';
    const filtroDataInicio = document.getElementById('filtroDataInicio') ? document.getElementById('filtroDataInicio').value : '';
    const textoFiltro = document.getElementById('filtroTexto') ? document.getElementById('filtroTexto').value.trim().toLowerCase() : '';


    let filtroData = null;
    if (filtroDataInicio) {
        filtroData = new Date(filtroDataInicio);
        filtroData.setHours(0, 0, 0, 0);
    }

    // Filtra IDs conforme filtros
    let idsFiltrados = Object.keys(maquinas).filter(id => {
        const dados = maquinas[id];

        // Certifique-se de que `dados` é um objeto válido
        if (!dados || typeof dados !== 'object') {
            console.warn(`Dados inválidos para o ID ${id}:`, dados);
            return false;
        }

        // filtro status
        if (filtroStatus && dados.status !== filtroStatus) return false;

        // filtro data EXATA
        if (filtroData) {
            const dataRegistro = new Date(dados.data);
            dataRegistro.setHours(0, 0, 0, 0);
            if (dataRegistro.getTime() !== filtroData.getTime()) return false;
        }

        // filtro texto na máquina, problema e NOVO: numero_os (case insensitive)
        if (textoFiltro) {
            const nomeMaquinaCurto = formatarNomeMaquinaCurto(dados.maquina).toLowerCase();
            const problemaLower = dados.problema.toLowerCase();
            const numeroOsStr = dados.numero_os ? String(dados.numero_os) : ''; // Converte para string para busca
            if (!nomeMaquinaCurto.includes(textoFiltro) && !problemaLower.includes(textoFiltro) && !numeroOsStr.includes(textoFiltro)) return false;
        }
        return true;
    });

    // Ordenar
    idsFiltrados.sort((a, b) => {
        const dataA = new Date(maquinas[a].data + 'T' + (maquinas[a].hora || '00:00:00'));
        const dataB = new Date(maquinas[b].data + 'T' + (maquinas[b].hora || '00:00:00'));
        if (ordenarPor === 'maisAntigo') {
            return dataA - dataB;
        } else {
            return dataB - dataA; // padrão mais recente primeiro
        }
    });

    const totalPaginas = Math.ceil(idsFiltrados.length / registrosPorPagina);
    if (paginaAtual > totalPaginas && totalPaginas > 0) paginaAtual = totalPaginas;
    if (totalPaginas === 0) paginaAtual = 1; // Se não houver itens, volta para a página 1

    const idsPagina = idsFiltrados.slice((paginaAtual - 1) * registrosPorPagina, paginaAtual * registrosPorPagina);

    idsPagina.forEach(id => {
        const dados = maquinas[id];

        const card = document.createElement('div');
        card.className = 'card';

        // **NOVO:** Adiciona classe 'card-impresso' se o item já foi impresso
        if (dados.impresso) {
            card.classList.add('card-impresso');
        }

        const agora = new Date();
        const diffMinutos = Math.floor((agora - new Date(dados.data + 'T' + (dados.hora || '00:00:00'))) / (1000 * 60));
        if (diffMinutos < 60) {
            card.classList.add('sla-verde');
        } else if (diffMinutos < 120) {
            card.classList.add('sla-amarelo');
        } else {
            card.classList.add('sla-vermelho');
        }

        const nomeFormatadoCurto = formatarNomeMaquinaCurto(dados.maquina);

        // **NOVO:** Desabilita o checkbox se o card já estiver impresso
        const checkboxDisabled = dados.impresso ? 'disabled' : '';
        const checkboxChecked = selectedCards.has(Number(id)) ? 'checked' : '';


        let conteudoCard = `
            <div class="card-header">
                <h3>${nomeFormatadoCurto}</h3>
                ${role === 'admin' ? `
                    <input type="checkbox" class="card-checkbox" data-id="${id}"
                                 ${checkboxChecked}
                                 ${checkboxDisabled}
                                 onchange="toggleCardSelection('${id}', this.checked)">
                ` : ''}
            </div>
            <p><strong>OS:</strong> ${dados.numero_os || 'N/A'}</p> <p><strong>Problema:</b> ${dados.problema}</p>
            <p><strong>Data:</strong> ${new Date(dados.data + 'T' + (dados.hora || '00:00:00')).toLocaleDateString('pt-BR')} ${dados.hora ? '- ' + dados.hora : ''}</p>
            <p><strong>Registrado por:</strong> ${dados.usuario || 'Desconhecido'}</p>
            `;

        // Exibir o último item do histórico APENAS SE HOUVER MAIS DE UMA ENTRADA
        // OU SE A ÚLTIMA ENTRADA NÃO FOR EXATAMENTE A ENTRADA DE REGISTRO INICIAL
        if (dados.historico && dados.historico.length > 0) {
            // Encontra a última entrada no histórico que representa uma ALTERAÇÃO
            // Filtra o histórico para encontrar alterações de status (exceto a primeira se for 'a fazer')
            // Ou, de forma mais simples, pega a última entrada SE HOUVER MAIS DE UMA OU SE O STATUS NÃO FOR 'a fazer'
            const historicoFiltradoParaExibicao = dados.historico.filter((entry, index) => {
                // Se for a primeira entrada, só considera se o status for diferente de 'a fazer'
                // ou se houver mais de uma entrada
                return index > 0 || dados.historico.length > 1;
            });

            const ultimoHist = historicoFiltradoParaExibicao[historicoFiltradoParaExibicao.length - 1];

            // Condição para exibir a "Última Alt."
            // Exibir apenas se houver um 'ultimoHist' válido E (não for a primeira entrada OU o status não for 'a fazer')
            if (ultimoHist) {
                const usuarioHist = ultimoHist.usuario || 'Desconhecido';
                const statusHist = formatarStatus(ultimoHist.status) || 'status desconhecido';
                const dataHoraHist = ultimoHist.dataHora || 'data desconhecida';

                let tecnicoConclusaoInfo = '';
                if (ultimoHist.status === 'concluido' && ultimoHist.tecnicoConclusao) { // Verifica se há técnico de conclusão
                    tecnicoConclusaoInfo = ` (Téc.: ${ultimoHist.tecnicoConclusao})`;
                }

                conteudoCard += `<p><strong>Última Alt.:</strong> ${usuarioHist} - ${statusHist}${tecnicoConclusaoInfo} em ${dataHoraHist}</p>`; // Adiciona info do técnico
                // Se tiver mais de uma alteração (além do registro inicial), pode-se adicionar um texto para indicar
                if (historicoFiltradoParaExibicao.length > 1) { // Conta as alterações "reais"
                    conteudoCard += `<p style="font-size: 0.8em; margin-top: 2px;">(${historicoFiltradoParaExibicao.length} ${historicoFiltradoParaExibicao.length === 1 ? 'alteração' : 'alterações'})</p>`;
                }
            }
        }


        if (dados.editando && role === 'admin') {
            // Construir as opções do select de técnicos
            let tecnicoSelectOptions = listaTecnicosFixos.map(tec =>
                `<option value="${tec}" ${dados.tecnicoConclusaoNaEdicao === tec ? 'selected' : ''}>${tec}</option>`
            ).join('');

            conteudoCard += `
                <label for="editStatus-${id}">Alterar Status:</label>
                <select id="editStatus-${id}" onchange="alterarStatusCache('${id}', this.value)">
                    <option value="afazer" ${dados.status === 'afazer' ? 'selected' : ''}>A Fazer</option>
                    <option value="andamento" ${dados.status === 'andamento' ? 'selected' : ''}>Em Andamento</option>
                    <option value="concluido" ${dados.status === 'concluido' ? 'selected' : ''}>Concluido</option>
                </select>

                <div id="tecnicoConclusaoContainer-${id}" style="margin-top: 10px; ${dados.status === 'concluido' ? '' : 'display: none;'}" class="tecnico-conclusao-container">
                    <label for="tecnicoConclusao-${id}">Técnico da Conclusão:</label>
                    <select id="tecnicoConclusao-${id}" ${dados.status === 'concluido' ? 'required' : ''}>
                        <option value="">Selecione o Técnico</option>
                        ${tecnicoSelectOptions}
                    </select>
                </div>
                <div class="botoes-edicao">
                    <button onclick="salvarEdicao('${id}')">Salvar</button>
                    <button onclick="cancelarEdicao('${id}')">Cancelar</button>
                </div>
            `;
        } else {
            conteudoCard += `
                <p class="status ${dados.status}"><strong>Status:</strong> ${formatarStatus(dados.status)}</p>
            `;
            if (role === 'admin') {
                conteudoCard += `
                    <div class="botoes-edicao">
                        <button onclick="editar('${id}')">Editar</button>
                        <button onclick="confirmarExclusao('${id}')">Excluir</button>
                    </div>
                `;
            }
        }

        card.innerHTML = conteudoCard;
        listaManutencoes.appendChild(card);
    });

    renderizarPaginacao(totalPaginas);
    // Assegura que o ranking geral também seja atualizado quando o painel é (e a fonte de dados 'maquinas' muda)
    atualizarRanking();
    // Atualiza o estado do botão de imprimir selecionados após renderizar (alguns checkboxes podem ter sido desabilitados)
    const btnImprimirSelecionados = document.getElementById('btn-imprimir-selecionados');
    if (btnImprimirSelecionados) {
        btnImprimirSelecionados.disabled = selectedCards.size === 0;
    }
}

// Função para adicionar/remover IDs do conjunto de seleção
function toggleCardSelection(id, isChecked) {
    // Converte o ID para número ao adicionar/remover do Set
    const numericId = Number(id);

    // Certifique-se de que o card não está marcado como impresso antes de permitir a seleção
    if (maquinas[id] && maquinas[id].impresso) {
        // Se já está impresso, não permite marcar/desmarcar
        return;
    }

    if (isChecked) {
        selectedCards.add(numericId);
    } else {
        selectedCards.delete(numericId);
    }
    // Habilitar/desabilitar o botão de imprimir selecionados
    const btnImprimirSelecionados = document.getElementById('btn-imprimir-selecionados');
    if (btnImprimirSelecionados) {
        btnImprimirSelecionados.disabled = selectedCards.size === 0;
    }
}

function renderizarPaginacao(totalPaginas) {
    const paginacao = document.querySelector('.paginacao');
    if (!paginacao) return;
    paginacao.innerHTML = '';

    if (totalPaginas <= 1) return;

    for (let i = 1; i <= totalPaginas; i++) {
        const btn = document.createElement('button');
        btn.innerText = i;
        btn.className = i === paginaAtual ? 'ativa' : '';
        btn.onclick = () => {
            paginaAtual = i;
            atualizarPainel();
        };
        paginacao.appendChild(btn);
    }
}

// Confirmação antes de excluir com popup SweetAlert2
function confirmarExclusao(id) {
    Swal.fire({
        title: 'Tem certeza?',
        text: "Esta ação não pode ser desfeita!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sim, excluir',
        cancelButtonText: 'Cancelar'
    }).then(async (result) => {
        if (result.isConfirmed) {
            await excluir(id);
        }
    });
}

async function excluir(id) {
    const { error } = await supabase
        .from('maquinas')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Erro ao excluir no Supabase:', error.message);
        Swal.fire('Erro!', 'Erro ao excluir no Supabase: ' + error.message, 'error');
        return;
    }

    //  Remove o ID do conjunto de seleção se ele estiver lá
    selectedCards.delete(Number(id)); // Ajustado para remover ID numérico
    // Atualiza o estado do botão de impressão
    const btnImprimirSelecionados = document.getElementById('btn-imprimir-selecionados');
    if (btnImprimirSelecionados) {
        btnImprimirSelecionados.disabled = selectedCards.size === 0;
    }

    await carregarDoSupabase(); // Recarrega todos os dados após a exclusão
    await salvarRankingMensal(); // Recalcula e salva o ranking mensal
    Swal.fire('Excluído!', 'O registro foi removido.', 'success');
}

function editar(id) {
    if (maquinas[id]) {
        // Armazenar o estado original para poder cancelar
        maquinas[id].originalStatus = maquinas[id].status;
        maquinas[id].editando = true;

        // Pré-seleciona o técnico de conclusão se o status atual já for 'concluido'
        if (maquinas[id].status === 'concluido') {
            // Tenta encontrar o técnico da última conclusão no histórico
            const ultimoConcluido = maquinas[id].historico.slice().reverse().find(h => h.status === 'concluido' && h.tecnicoConclusao);
            if (ultimoConcluido) {
                maquinas[id].tecnicoConclusaoNaEdicao = ultimoConcluido.tecnicoConcluido;
            } else {
                maquinas[id].tecnicoConclusaoNaEdicao = ''; // Se for concluído mas não tem técnico no histórico, define vazio
            }
        } else {
            maquinas[id].tecnicoConclusaoNaEdicao = ''; // Limpa se não for concluído
        }

        atualizarPainel();
    }
}

function cancelarEdicao(id) {
    if (maquinas[id]) {
        // Restaura o status original e desativa a edição
        maquinas[id].status = maquinas[id].originalStatus;
        maquinas[id].editando = false;
        delete maquinas[id].originalStatus; // Limpa o estado original
        delete maquinas[id].tecnicoConclusaoNaEdicao; // Limpa a propriedade de edição
        atualizarPainel();
    }
}

async function salvarEdicao(id) {
    if (maquinas[id]) {
        const novoStatus = document.getElementById(`editStatus-${id}`).value;
        const agora = new Date();
        const dataHora = agora.toLocaleDateString('pt-BR') + ' ' + agora.toLocaleTimeString('pt-BR', { hour12: false });

        let tecnicoConclusao = ''; // Variável para armazenar o nome do técnico de conclusão

        // Captura o nome do técnico se o status for 'concluido'
        if (novoStatus === 'concluido') {
            const tecnicoSelect = document.getElementById(`tecnicoConclusao-${id}`);
            if (tecnicoSelect) {
                tecnicoConclusao = tecnicoSelect.value;
                if (!tecnicoConclusao) {
                    Swal.fire('Atenção!', 'Por favor, selecione o técnico da conclusão.', 'warning');
                    return; // Impede salvar se o técnico não foi selecionado
                }
            }
        }

        if (!maquinas[id].historico) {
            maquinas[id].historico = [];
        }

        const historicoEntry = {
            usuario: nomeUsuario, // Quem está operando o sistema
            status: novoStatus,
            dataHora: dataHora
        };

        // Adiciona o nome do técnico de conclusão ao histórico SE o status for 'concluido'
        if (novoStatus === 'concluido') {
            historicoEntry.tecnicoConclusao = tecnicoConclusao;
        }

        // Adiciona a entrada ao histórico existente (se for diferente da última ou se não houver histórico)
        const ultimoHistorico = maquinas[id].historico[maquinas[id].historico.length - 1];
        if (!ultimoHistorico || ultimoHistorico.status !== novoStatus || ultimoHistorico.tecnicoConclusao !== tecnicoConclusao) {
            maquinas[id].historico.push(historicoEntry);
        } else {
            console.log(`[salvarEdicao] Status e técnico para ${id} já são os mesmos do último histórico. Não adicionando nova entrada.`);
        }


        // Atualizar no Supabase o status e historico
        const { error } = await supabase
            .from('maquinas')
            .update({ status: novoStatus, historico: maquinas[id].historico, atualizado_em: new Date().toISOString() })
            .eq('id', id);

        if (error) {
            console.error('Erro ao atualizar no Supabase:', error.message);
            Swal.fire('Erro!', 'Erro ao atualizar no Supabase: ' + error.message, 'error');
        } else {
            await carregarDoSupabase(); // Recarrega todos os dados após a edição
            await salvarRankingMensal(); // Recalcula e salva o ranking mensal (agora com dados atualizados)
            Swal.fire('Sucesso!', 'Status atualizado com sucesso!', 'success');
        }
    }
}

// Esta função apenas atualiza o status no cache, não no Supabase.
// A atualização no Supabase ocorre em 'salvarEdicao'.
function alterarStatusCache(id, novoStatus) {
    if (maquinas[id]) {
        maquinas[id].status = novoStatus; // Mantém a alteração visual antes de salvar

        // Lógica para mostrar/esconder o campo do técnico
        const tecnicoConclusaoContainer = document.getElementById(`tecnicoConclusaoContainer-${id}`);
        const tecnicoConclusaoSelect = document.getElementById(`tecnicoConclusao-${id}`);

        if (tecnicoConclusaoContainer && tecnicoConclusaoSelect) {
            if (novoStatus === 'concluido') {
                tecnicoConclusaoContainer.style.display = 'block';
                tecnicoConclusaoSelect.setAttribute('required', 'true');
            } else {
                tecnicoConclusaoContainer.style.display = 'none';
                tecnicoConclusaoSelect.removeAttribute('required');
                tecnicoConclusaoSelect.value = ''; // Limpa a seleção se não for 'concluido'
            }
        }
    }
}

//  Funções de Ranking Geral (Ativos)
function atualizarRanking() {
    const rankingLista = document.getElementById('rankingLista');
    if (!rankingLista) {
        console.error("Elemento com ID 'rankingLista' não encontrado.");
        return;
    }
    rankingLista.innerHTML = '';

    const contagem = {};
    for (const id in maquinas) {
        const dados = maquinas[id];
        if (dados.status !== 'concluido') { // Apenas problemas ativos (a fazer e em andamento)
            contagem[dados.maquina] = (contagem[dados.maquina] || 0) + 1;
        }
    }

    const maquinasOrdenadas = Object.entries(contagem)
        .sort((a, b) => b[1] - a[1]); // Ordena do maior para o menor

    maquinasOrdenadas.forEach(([maquinaId, qtd]) => {
        // AGORA USA A FUNÇÃO DE FORMATAÇÃO CURTA AQUI PARA EXIBIÇÃO NO RANKING
        const nomeFormatadoCurto = formatarNomeMaquinaCurto(maquinaId);

        const li = document.createElement('li');
        li.innerHTML = `${nomeFormatadoCurto} - ${qtd} problema${qtd > 1 ? 's' : ''}`;
        li.style.whiteSpace = "nowrap";

        rankingLista.appendChild(li);
    });

    if (maquinasOrdenadas.length === 0) {
        rankingLista.innerHTML = '<li>Nenhuma máquina com problemas ativos ainda.</li>';
    }
}

// --- NOVAS FUNÇÕES PARA RANKING MENSAL PERSISTENTE ---

async function salvarRankingMensal() {
    const hoje = new Date();
    const mesAtual = (hoje.getMonth() + 1).toString().padStart(2, '0'); // Mês atual (1-12), formatado com 2 dígitos
    const anoAtual = hoje.getFullYear();
    const chaveMesAtual = `${anoAtual}-${mesAtual}`; // Ex: "2025-07"

    console.log(`[salvarRankingMensal] Iniciando cálculo e salvamento do ranking. Mês/Ano atual de referência: ${chaveMesAtual}`);

    // 1. Calcular a contagem de problemas por máquina para CADA MÊS existente nos registros de 'maquinas'
    // A ideia aqui é calcular o ranking para TODOS os meses que têm dados de manutenção,
    // não apenas para o mês atual. Isso garantirá que todos os meses com dados sejam salvos.
    const contagemTotalPorMes = {}; // Armazenará { "YYYY-MM": { "maquinaId": count, ... }, ... }

    // 'maquinas' é o objeto global que contém todos os registros de manutenção carregados
    for (const id in maquinas) {
        const dados = maquinas[id];
        // Converte a data e hora do registro para um objeto Date
        const dataRegistro = new Date(`${dados.data}T${dados.hora || '00:00:00'}`);

        // Verifique se a dataRegistro é válida
        if (isNaN(dataRegistro.getTime())) {
            console.warn(`[salvarRankingMensal] Aviso: Registro com ID ${id} possui data inválida: ${dados.data} ${dados.hora}. Ignorando.`);
            continue; // Pula para o próximo registro
        }

        const registroMes = (dataRegistro.getMonth() + 1).toString().padStart(2, '0');
        const registroAno = dataRegistro.getFullYear();
        const chaveMesRegistro = `${registroAno}-${registroMes}`; // Ex: "2025-06" ou "2025-07"

        if (!contagemTotalPorMes[chaveMesRegistro]) {
            contagemTotalPorMes[chaveMesRegistro] = {};
        }
        contagemTotalPorMes[chaveMesRegistro][dados.maquina] = (contagemTotalPorMes[chaveMesRegistro][dados.maquina] || 0) + 1;
    }
    console.log("[salvarRankingMensal] Contagem total por mês calculada:", contagemTotalPorMes);

    // 2. Processar cada mês na contagem total
    for (const mesChave in contagemTotalPorMes) {
        const contagemParaEsteMes = contagemTotalPorMes[mesChave];
        console.log(`[salvarRankingMensal] Processando o mês: ${mesChave}. Contagem:`, contagemParaEsteMes);

        // Remover rankings existentes para ESTE mês antes de salvar os novos
        const { error: deleteError } = await supabase
            .from('rankings_mensais')
            .delete()
            .eq('mes', mesChave); // Deleta todos os registros para o mês atual sendo processado

        if (deleteError) {
            console.error(`[salvarRankingMensal] Erro ao remover ranking mensal existente para ${mesChave}:`, deleteError.message);
        } else {
            console.log(`[salvarRankingMensal] Rankings existentes para ${mesChave} removidos com sucesso.`);
        }

        // 3. Salvar os novos rankings calculados para ESTE MÊS
        if (Object.keys(contagemParaEsteMes).length === 0) {
            console.log(`[salvarRankingMensal] Nenhuma máquina com problemas para salvar em ${mesChave}.`);
        } else {
            // Converte o objeto de contagem em um array de objetos para inserção
            const dadosParaInserir = Object.entries(contagemParaEsteMes).map(([maquina, qtd]) => ({
                mes: mesChave,
                maquina,
                qtd
            }));

            console.log(`[salvarRankingMensal] Dados a serem inseridos para ${mesChave}:`, dadosParaInserir);

            const { error: insertError } = await supabase
                .from('rankings_mensais')
                .insert(dadosParaInserir); // Inserção em massa

            if (insertError) {
                console.error(`[salvarRankingMensal] Erro ao salvar ranking mensal para ${mesChave}:`, insertError.message);
            } else {
                console.log(`[salvarRankingMensal] Ranking mensal para ${mesChave} salvo com sucesso.`);
            }
        }
    }

    console.log("[salvarRankingMensal] Função salvarRankingMensal concluída para todos os meses processados.");
}

/**
 * Carrega todos os rankings mensais salvos na tabela 'rankings_mensais' do Supabase.
 * @returns {Array} Uma lista de objetos de ranking ou um array vazio em caso de erro.
 */
async function carregarRankingsMensais() {
    console.log("[carregarRankingsMensais] Tentando carregar dados da tabela 'rankings_mensais'...");
    const { data, error } = await supabase
        .from('rankings_mensais')
        .select('*')
        .order('qtd', { ascending: false }); // Ordena por quantidade ao carregar

    if (error) {
        console.error("[carregarRankingsMensais] Erro ao carregar rankings mensais:", error.message);
        return []; // Garante que sempre retorna um array vazio em caso de erro
    } else {
        console.log("[carregarRankingsMensais] Dados carregados:", data);
        // Garante que 'data' é um array mesmo que Supabase retorne null/undefined por algum motivo
        return data || [];
    }
}

/**
 * Atualiza a lista de exibição do ranking mensal na interface do usuário.
 * Carrega os dados do Supabase e os filtra para o mês atual antes de exibir.
 */
async function atualizarRankingMensal() {
    const rankingMensalLista = document.getElementById('rankingMensalLista');
    if (!rankingMensalLista) {
        console.error("Elemento com ID 'rankingMensalLista' não encontrado. Certifique-se de que o HTML possui este elemento.");
        return;
    }
    rankingMensalLista.innerHTML = ''; // Limpa a lista atual

    const selectMesRanking = document.getElementById('filtro-mes-ranking');
    if (!selectMesRanking) { // Adicionado verificação para o select
        console.error("Elemento com ID 'filtro-mes-ranking' não encontrado. Certifique-se de que o HTML possui este elemento.");
        return;
    }
    let chaveMes = '';

    // Carrega TODOS os rankings para popular o filtro e depois filtrar
    console.log("[DEBUG] Chamando carregarRankingsMensais...");
    const todosRankings = await carregarRankingsMensais();
    console.log("[DEBUG] Retorno de carregarRankingsMensais (todosRankings):", todosRankings, "Tipo:", typeof todosRankings); // NOVO LOG

    const rankingsSeguros = Array.isArray(todosRankings) ? todosRankings : [];
    console.log("[DEBUG] Valor de rankingsSeguros:", rankingsSeguros, "É array?", Array.isArray(rankingsSeguros)); // NOVO LOG

    // Preenche as opções do select de filtro de ranking mensal (se ainda não estiverem preenchidas)
    const mesesDisponiveis = [...new Set(rankingsSeguros.map(item => item.mes).filter(mes => mes))].sort().reverse();
    console.log("[DEBUG] Meses disponíveis (mesesDisponiveis):", mesesDisponiveis, "É array?", Array.isArray(mesesDisponiveis)); // NOVO LOG


    // Condição para preencher/atualizar as opções do select
    if (selectMesRanking.options.length === 0 || (selectMesRanking.options.length - 1 !== mesesDisponiveis.length && mesesDisponiveis.length > 0)) {
        console.log("[DEBUG] Preenchendo select de meses..."); // NOVO LOG
        selectMesRanking.innerHTML = '';
        const optionDefault = document.createElement('option');
        optionDefault.value = '';
        optionDefault.textContent = 'Selecione o Mês...';
        selectMesRanking.appendChild(optionDefault);

        mesesDisponiveis.forEach(mes => {
            const option = document.createElement('option');
            option.value = mes;
            option.textContent = formatarMesAno(mes); // Função auxiliar para formatar "YYYY-MM" para "Mês/Ano"
            selectMesRanking.appendChild(option);
        });
    }

    // Seleciona o mês atual por padrão ou o que já estiver selecionado
    const hoje = new Date();
    const mesAtualFormatado = `${hoje.getFullYear()}-${(hoje.getMonth() + 1).toString().padStart(2, '0')}`;

    if (!selectMesRanking.value || !mesesDisponiveis.includes(selectMesRanking.value)) {
        selectMesRanking.value = mesesDisponiveis.includes(mesAtualFormatado) ? mesAtualFormatado : (mesesDisponiveis[0] || '');
    }
    chaveMes = selectMesRanking.value;

    console.log(`[atualizarRankingMensal] Buscando e exibindo ranking para a chave do mês: ${chaveMes}`);

    // Agora filtra os rankings com base no mês selecionado a partir dos dados seguros
    const rankingsDoMes = rankingsSeguros.filter(item => item.mes === chaveMes);
    console.log("[DEBUG] Rankings do mês filtrados (rankingsDoMes):", rankingsDoMes, "É array?", Array.isArray(rankingsDoMes)); // NOVO LOG

    console.log(`[atualizarRankingMensal] Encontrados ${rankingsDoMes.length} itens para o mês ${chaveMes}.`);

    if (rankingsDoMes.length === 0) {
        rankingMensalLista.innerHTML = '<li>Nenhuma máquina com problemas para o mês selecionado.</li>';
    } else {
        rankingsDoMes.forEach(item => {
            const nomeFormatadoCurto = formatarNomeMaquinaCurto(item.maquina);

            const li = document.createElement('li');
            li.innerHTML = `${nomeFormatadoCurto} - ${item.qtd} problema${item.qtd > 1 ? 's' : ''}`;
            li.style.whiteSpace = "nowrap";
            rankingMensalLista.appendChild(li);
        });
    }
    console.log("[atualizarRankingMensal] Função atualizarRankingMensal concluída.");
}

// função auxiliar para formatar "YYYY-MM" para "Mês/Ano"
function formatarMesAno(chaveMes) {
    if (!chaveMes) return ''; // Retorna vazio se a chave for nula ou vazia
    const [ano, mes] = chaveMes.split('-');
    if (!ano || !mes) return chaveMes; // Retorna a chave original se o formato for inválido

    const data = new Date(parseInt(ano), parseInt(mes) - 1, 1);
    // Verifica se a data é válida antes de formatar
    if (isNaN(data.getTime())) {
        return chaveMes; // Retorna a chave original se a data for inválida
    }
    // Formata e capitaliza o mês
    const nomeMes = data.toLocaleString('pt-BR', { month: 'long' });
    return nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1) + '/' + ano;
}


// --- FIM FUNÇÕES PARA RANKING MENSAL PERSISTENTE ---

//FUNÇÕES PARA RELATÓRIOS (PDF)
async function gerarRelatorioPDF(idsParaImprimir = null) {
    console.log("gerarRelatorioPDF: idsParaImprimir recebidos:", idsParaImprimir);
    console.log("Conteúdo atual de 'maquinas':", maquinas);

    const mesAnoSelecionado = document.getElementById('filtro-mes-relatorio').value;
    const maquinaSelecionadaId = document.getElementById('filtro-maquina-relatorio').value;

    const isGerandoOS = (idsParaImprimir && idsParaImprimir.length > 0);

    // Se não for OS (ou seja, é relatório geral) E não houver filtros, avisa o usuário
    if (!isGerandoOS && !mesAnoSelecionado && !maquinaSelecionadaId) {
        Swal.fire('Atenção!', 'Selecione pelo menos um filtro (Mês/Ano ou Máquina) para gerar o Relatório Geral.', 'warning');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const logoUrl = 'logo-sao-geraldo.png';
    // Posição e tamanho da logo
    const imgX = 14; // Posição X da imagem (margem esquerda)
    const imgY = 10; // Posição Y da imagem (margem superior)
    const imgWidth = 50; // Largura da imagem (em mm)
    const imgHeight = 20; // Altura da imagem (em mm)

    let imgElement;

    try {
        imgElement = new Image(); // Atribui a imagem à variável declarada
        imgElement.src = logoUrl;
        await new Promise((resolve, reject) => {
            imgElement.onload = () => resolve();
            imgElement.onerror = () => reject(new Error(`Falha ao carregar a imagem: ${logoUrl}`));
        });
        console.log("Logo carregada com sucesso."); // Apenas log, a adição real será via addPageHeader
    } catch (error) {
        console.error("Erro ao carregar logo:", error);
        imgElement = null; // Garante que imgElement não seja um objeto inválido
    }
    // FIM DO CÓDIGO PARA LOGO


    // Função auxiliar para adicionar a logo e o título em uma página
    const addPageHeader = (doc, title, logoImage, x, y, width, height) => {
        // Verifica se logoImage é um objeto Image válido e se foi completamente carregado
        if (logoImage && logoImage instanceof Image && logoImage.complete) {
            doc.addImage(logoImage, 'PNG', x, y, width, height);
        } else {
            console.warn("Logo não disponível para adicionar ao cabeçalho. Usando placeholder ou pulando.");
            doc.rect(x, y, width, height); // Desenha um retângulo como placeholder
            doc.setFontSize(8);
            doc.text('LOGO', x + width / 2, y + height / 2, { align: 'center', baseline: 'middle' });
        }
        doc.setFontSize(18);
        doc.text(title, doc.internal.pageSize.getWidth() / 2, y + height / 2 + 5, { align: 'center', baseline: 'middle' });
        return y + height + 10;
    };

    let y = addPageHeader(doc, isGerandoOS ? 'Ordem de Serviço' : 'Relatório de Manutenções', imgElement, imgX, imgY, imgWidth, imgHeight);


    let dadosFiltrados = Object.values(maquinas);
    console.log("Dados antes do filtro de seleção:", dadosFiltrados.length, "itens.");

    // Filtra pelos IDs selecionados (para OS) ou pelos filtros de relatório
    if (isGerandoOS) {
        dadosFiltrados = dadosFiltrados.filter(item => {
            return idsParaImprimir.includes(item.id);
        });
        console.log("Dados APÓS filtro de seleção (OS):", dadosFiltrados.length, "itens.");
    } else { // Aplica os filtros do formulário de relatório para o relatório geral
        if (mesAnoSelecionado) {
            const [ano, mes] = mesAnoSelecionado.split('-');
            dadosFiltrados = dadosFiltrados.filter(item => {
                const dataRegistro = new Date(item.data + 'T' + (item.hora || '00:00:00'));
                const mesRegistro = (dataRegistro.getMonth() + 1).toString().padStart(2, '0');
                const anoRegistro = dataRegistro.getFullYear().toString();
                return mesRegistro === mes && anoRegistro === ano;
            });
        }

        if (maquinaSelecionadaId) {
            dadosFiltrados = dadosFiltrados.filter(item => item.maquina === maquinaSelecionadaId);
        }
        console.log("Dados APÓS filtro de relatório:", dadosFiltrados.length, "itens.");
    }


    // Ordenar os dados filtrados por data, do mais recente para o mais antigo
    dadosFiltrados.sort((a, b) => {
        const dataA = new Date(a.data + 'T' + (a.hora || '00:00:00'));
        const dataB = new Date(b.data + 'T' + (b.hora || '00:00:00'));
        return dataB - dataA;
    });

    if (dadosFiltrados.length === 0) {
        Swal.fire('Ops!', 'Nenhum registro encontrado para os filtros selecionados ou cards selecionados.', 'info');
        return;
    }

    doc.setFontSize(12);

    // Adiciona um resumo para o relatório geral
    if (!isGerandoOS) {
        y += 10; // Espaço inicial após o cabeçalho (logo + título)
        doc.setFontSize(14);
        doc.text(`Resumo do Relatório`, 14, y);
        y += 8;
        doc.setFontSize(12);
        doc.text(`Período: ${mesAnoSelecionado ? formatarMesAno(mesAnoSelecionado) : 'Todo o Período'}`, 14, y);
        y += 7;
        doc.text(`Máquina: ${maquinaSelecionadaId ? formatarNomeMaquinaCurto(maquinaSelecionadaId) : 'Todas as Máquinas'}`, 14, y);
        y += 7;
        doc.text(`Total de Registros: ${dadosFiltrados.length}`, 14, y);
        y += 15; // Espaço após o resumo
        doc.setDrawColor(150);
        doc.line(14, y, 196, y); // Separador
        doc.setDrawColor(0);
        y += 10;
    }


    dadosFiltrados.forEach((item, index) => {
        const nomeMaquinaCompleto = maquinaEspecificacoes[item.maquina] ? maquinaEspecificacoes[item.maquina].nome : 'Máquina Desconhecida';
        const dataFormatada = new Date(item.data + 'T' + (item.hora || '00:00:00')).toLocaleDateString('pt-BR');
        const horaFormatada = item.hora ? item.hora.substring(0, 5) : 'N/A';

        // Pular para a próxima página se não houver espaço suficiente
        const alturaNecessaria = isGerandoOS ? 130 : 65;

        // Lógica de nova página
        if (y + alturaNecessaria > doc.internal.pageSize.height - 10) { // Margem inferior de 10mm
            doc.addPage();
            y = addPageHeader(doc, isGerandoOS ? 'Ordem de Serviço' : '(Continuação) Relatório de Manutenções', imgElement, imgX, imgY, imgWidth, imgHeight);

            // Se for relatório geral, repete o cabeçalho/resumo da página
            if (!isGerandoOS) {
                y += 10;
                doc.setFontSize(14);
                doc.text(`(Continuação) Relatório de Manutenções`, 14, y);
                y += 8;
                doc.setFontSize(12);
                doc.text(`Período: ${mesAnoSelecionado ? formatarMesAno(mesAnoSelecionado) : 'Todo o Período'}`, 14, y);
                y += 7;
                doc.text(`Máquina: ${maquinaSelecionadaId ? (maquinaEspecificacoes[maquinaSelecionadaId] ? maquinaEspecificacoes[maquinaSelecionadaId].nome : 'Máquina Desconhecida') : 'Todas as Máquinas'}`, 14, y);
                y += 15;
                doc.setDrawColor(150);
                doc.line(14, y, 196, y);
                doc.setDrawColor(0);
                y += 10;
            }
        }

        doc.setFontSize(12);
        doc.text(`Número da OS: ${item.numero_os || 'N/A'}`, 14, y + 5);
        doc.text(`Máquina: ${nomeMaquinaCompleto}`, 14, y + 12);
        doc.text(`Problema Identificado: ${item.problema}`, 14, y + 19);
        doc.text(`Status Atual: ${formatarStatus(item.status)}`, 14, y + 26);
        doc.text(`Data/Hora do Registro: ${dataFormatada} - ${horaFormatada}`, 14, y + 33);
        doc.text(`Registrado por: ${item.usuario || 'Desconhecido'}`, 14, y + 40);

        if (isGerandoOS) {
            doc.text(`Feito por: ___________________________________`, 14, y + 47); // Deixa linha para preencher
        } else {
            let tecnicoConclusao = 'N/A';
            if (item.historico && item.historico.length > 0) {
                const ultimoConcluido = item.historico.slice().reverse().find(hist => hist.status === 'concluido' && hist.tecnicoConclusao);
                if (ultimoConcluido) {
                    tecnicoConclusao = ultimoConcluido.tecnicoConclusao;
                }
            }
            doc.text(`Feito por: ${tecnicoConclusao}`, 14, y + 47);
        }

        if (isGerandoOS) {
            y += 55; // Avança Y para os campos manuais

            doc.setFontSize(10); // Fonte menor para os títulos dos campos
            doc.text('Peças Trocadas / Serviço Executado:', 14, y);
            y += 5;
            for (let i = 0; i < 4; i++) { // 4 linhas
                doc.line(14, y + (i * 5), 196, y + (i * 5)); // Desenha a linha
            }
            y += 25; // Espaço após as linhas de peças/serviço

            doc.text('Observações do Técnico:', 14, y);
            y += 5;
            for (let i = 0; i < 3; i++) { // 3 linhas para observações
                doc.line(14, y + (i * 5), 196, y + (i * 5));
            }
            y += 20; // Espaço após as linhas de observações

            doc.text('Data da Execução: ____/____/________ Hora: ____:____', 14, y);
            y += 10;
            doc.line(70, y, 140, y); // Linha para assinatura
            doc.text('Assinatura do Técnico', 90, y + 5, { align: 'center' }); // Título da assinatura

            y += 15; // Espaço final antes do próximo item
        } else {
            y += 55; // Avança Y para o próximo item
        }

        // Separador visual entre os itens, se houver mais de um
        if (index < dadosFiltrados.length - 1) {
            doc.setDrawColor(150); // Cor cinza para o separador
            doc.line(14, y, 196, y); // Linha separadora
            doc.setDrawColor(0); // Volta para a cor preta
            y += 10; // Espaço após o separador
        }
    });

    // NOME DO ARQUIVO PDF SALVO
    const fileName = isGerandoOS ? `ordem_servico_selecionados.pdf` : `relatorio_geral_${mesAnoSelecionado || 'todos'}_${maquinaSelecionadaId || 'todas'}.pdf`;
    doc.save(fileName);
    Swal.fire('Sucesso!', 'Documento PDF gerado!', 'success');

    // Limpa a seleção após gerar o PDF (apenas para a opção de cards selecionados)
    if (isGerandoOS) {
        // **NOVO:** Atualiza o campo 'impresso' no Supabase para os cards que foram impressos
        await marcarCardsComoImpressos(Array.from(selectedCards));
        selectedCards.clear();
        await carregarDoSupabase(); // Recarrega os dados para que a UI reflita a mudança
        atualizarPainel(); // Para desmarcar os checkboxes na UI e aplicar a estilização
    }
}

// **NOVA FUNÇÃO:** Para marcar os cards como impressos no Supabase
async function marcarCardsComoImpressos(ids) {
    if (ids.length === 0) {
        return;
    }
    console.log("Marcando cards como impressos:", ids);
    const { data, error } = await supabase
        .from('maquinas')
        .update({ impresso: true })
        .in('id', ids); // Usa o operador 'in' para atualizar múltiplos IDs

    if (error) {
        console.error('Erro ao marcar cards como impressos no Supabase:', error.message);
        Swal.fire('Erro!', 'Erro ao marcar cards como impressos: ' + error.message, 'error');
    } else {
        console.log('Cards marcados como impressos com sucesso:', data);
    }
}

// SUPABASE: Funções de Interação com a tabela 'maquinas'
async function salvarNoSupabase(maquina, problema, status, data, hora, usuario) {
    const criado_em = `${data}T${hora}`; // Formato correto YYYY-MM-DDTHH:MM:SS // Garante formato de datetime completo

    // Inicia o histórico com a entrada inicial
    const historicoInicial = [{
        usuario: usuario,
        status: status,
        dataHora: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour12: false })
    }];

    // Aqui, `maquina` agora pode ser um array de IDs.
    // Precisamos criar um registro para CADA máquina selecionada.
    const registrosParaInserir = maquina.map(maqId => ({
        maquina: maqId,
        problema,
        status,
        criado_em,
        usuario,
        historico: historicoInicial,
        impresso: false // **NOVO:** Define 'impresso' como false por padrão ao criar um novo registro
    }));

    const { data: insertedData, error } = await supabase
        .from('maquinas')
        .insert(registrosParaInserir) // Inserimos um array de objetos
        .select(); // Adicione .select() para obter o registro inserido, incluindo o numero_os gerado

    if (error) {
        console.error('Erro ao salvar no Supabase:', error.message);
        Swal.fire('Erro!', 'Erro ao salvar no Supabase: ' + error.message, 'error');
        return false;
    }
    console.log("Dados inseridos com sucesso:", insertedData);
    return true;
}

async function carregarDoSupabase() {
    const { data: resData, error } = await supabase
        .from('maquinas')
        .select('*') // Seleciona todas as colunas, incluindo numero_os, historico e impresso
        .order('criado_em', { ascending: false });

    if (error) {
        console.error('Erro ao carregar dados do Supabase:', error.message);
        Swal.fire('Erro!', 'Erro ao carregar dados do Supabase: ' + error.message, 'error');
        return;
    }

    maquinas = {}; // Limpa o objeto antes de preencher
    resData.forEach(item => {
        const dt = item.criado_em ? new Date(item.criado_em) : new Date();
        const dataStr = dt.toISOString().slice(0, 10);
        const horaStr = dt.toTimeString().slice(0, 8); // Pega HH:MM:SS
        maquinas[item.id] = {
            id: item.id,
            numero_os: item.numero_os, // NOVO: Armazena o numero_os
            maquina: item.maquina,
            problema: item.problema,
            status: item.status,
            data: dataStr,
            hora: horaStr,
            usuario: item.usuario || 'Desconhecido',
            historico: item.historico || [], // Garante que historico seja um array
            impresso: item.impresso || false, // **NOVO:** Carrega o campo 'impresso'
            editando: false
        };
    });
    atualizarPainel(); // Atualiza o painel com os dados recém-carregados
}

// NOVO: Função para alternar o modo de seleção múltipla
function toggleMultiSelectMode() {
    isMultiSelectActive = !isMultiSelectActive;
    const btn = document.getElementById('btnAtivarSelecaoMultipla');
    const select = document.getElementById('maquina');

    if (isMultiSelectActive) {
        btn.classList.add('active');
        btn.textContent = 'Desativar Seleção Múltipla';
        select.classList.add('multi-select-active'); // Adiciona classe para estilização CSS
    } else {
        btn.classList.remove('active');
        btn.textContent = 'Ativar Seleção Múltipla';
        select.classList.remove('multi-select-active'); // Remove classe de estilização
        // Ao desativar, se houver múltiplas seleções, limpa e volta para "selecione"
        if (selectedMachinesForForm.size > 1) {
            selectedMachinesForForm.clear();
            select.value = ""; // Desseleciona a primeira opção
        } else if (selectedMachinesForForm.size === 1) {
            // Se apenas uma estava selecionada, garante que o select mostre essa única
            select.value = Array.from(selectedMachinesForForm)[0];
        } else {
            select.value = ""; // Se nenhuma estava selecionada, garante que mostre "-- Escolha --"
        }
    }
    renderSelectedMachinesForForm(); // Atualiza as opções visíveis do select
    updateMachineSpecsDisplay(Array.from(selectedMachinesForForm)); // Atualiza o card de especificações
}

// NOVO: Função para renderizar as opções selecionadas no select (visualmente)
function renderSelectedMachinesForForm() {
    const select = document.getElementById('maquina');
    Array.from(select.options).forEach(option => {
        if (option.value !== "") { // Ignora a opção "-- Escolha --"
            option.selected = selectedMachinesForForm.has(option.value);
        } else {
            // Garante que a opção "Escolha" não esteja selecionada se algo mais estiver
            option.selected = false;
        }
    });
    // Se não houver nada selecionado e o modo não for multi-select, garante que o "-- Escolha --" esteja no valor
    if (selectedMachinesForForm.size === 0 && !isMultiSelectActive) {
        select.value = "";
    }
}


// NOVO: Função para atualizar o display de especificações da máquina
function updateMachineSpecsDisplay(maquinasSelecionadas) {
    const cardEspecificacoes = document.getElementById('cardEspecificacoesCadastro');
    if (!cardEspecificacoes) return;

    if (maquinasSelecionadas.length === 1 && maquinaEspecificacoes[maquinasSelecionadas[0]]) {
        const maquinaSelecionadaId = maquinasSelecionadas[0];
        const specs = maquinaEspecificacoes[maquinaSelecionadaId];
        let htmlContent = `<h3>Especificações da Máquina</h3>`;
        htmlContent += `<p><strong>Nome:</strong> ${specs.nome}</p>`;
        htmlContent += `<p><strong>Marca:</strong> ${specs.marca}</p>`;
        htmlContent += `<p><strong>Modelo:</strong> ${specs.modelo || 'N/A'}</p>`;
        if (specs.capacidade) {
            htmlContent += `<p><strong>Capacidade:</strong> ${specs.capacidade}</p>`;
        }
        if (specs.potencia) {
            htmlContent += `<p><strong>Potência:</strong> ${specs.potencia}</p>`;
        }
        if (specs.observacoes) {
            htmlContent += `<p><strong>Observações:</strong> ${specs.observacoes}</p>`;
        }
        cardEspecificacoes.innerHTML = htmlContent;
    } else if (maquinasSelecionadas.length > 1) {
        cardEspecificacoes.innerHTML = `
            <h3>Especificações das Máquinas</h3>
            <p>Múltiplas máquinas selecionadas para registro:</p>
            <ul>
                ${maquinasSelecionadas.map(id => `<li>${formatarNomeMaquinaCurto(id)}</li>`).join('')}
            </ul>
        `;
    } else {
        cardEspecificacoes.innerHTML = `
            <h3>Especificações da Máquina</h3>
            <p>Selecione uma máquina para ver as especificações.</p>
        `;
    }
}


// --- DOMContentLoaded e Event Listeners ---
document.addEventListener('DOMContentLoaded', async () => {
    // Esconde a div de informações do usuário no carregamento
    const userInfoDisplay = document.getElementById('userInfoDisplay');
    if (userInfoDisplay) {
        userInfoDisplay.style.display = 'none';
    }


    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
        console.warn("Sessão Supabase inválida ou inexistente. Redirecionando para login.");
        localStorage.clear(); // Limpa o localStorage para garantir um novo login limpo
        window.location.href = "login.html";
        return; // Sai da função para não tentar carregar dados sem autenticação
    }

    preencherSelectMaquinas(); // Preenche as opções do dropdown de máquinas (cadastro E relatórios)

    // Define a data atual como padrão no campo de data do formulário
    const hoje = new Date();
    document.getElementById('data').value = hoje.toISOString().slice(0, 10);

    // Carrega dados e atualiza todos os painéis e rankings
    await carregarDoSupabase(); // 1. Carrega os dados das máquinas primeiro, POPULANDO 'maquinas'
    await salvarRankingMensal(); // 2. Calcula e SALVA o ranking mensal no Supabase com os dados recém-carregados
    await atualizarRankingMensal(); // 3. Exibe o ranking mensal (agora baseado nos dados do Supabase que foram atualizados)

    // Event Listener para o botão Salvar
    const btnSalvar = document.getElementById('btnSalvar');
    if (btnSalvar) {
        btnSalvar.addEventListener('click', async () => {
            // Desabilita o botão para evitar cliques múltiplos
            btnSalvar.disabled = true;
            btnSalvar.textContent = 'Salvando...'; // Feedback visual

            // NOVO: Pega as máquinas selecionadas do Set
            const maquinasSelecionadasArray = Array.from(selectedMachinesForForm);

            const problema = document.getElementById('problema').value.trim();
            const status = document.getElementById('status').value;
            const data = document.getElementById('data').value;

            if (maquinasSelecionadasArray.length === 0 || !problema || !status || !data) {
                Swal.fire('Atenção!', 'Por favor, selecione ao menos uma máquina e preencha todos os campos!', 'warning');
                btnSalvar.disabled = false; // Reabilita o botão
                btnSalvar.textContent = 'Salvar'; // Restaura o texto
                return;
            }

            const agora = new Date();
            const hora = agora.toLocaleTimeString('pt-BR', { hour12: false });

            try {
                // Chama salvarNoSupabase passando o array de máquinas
                const sucesso = await salvarNoSupabase(maquinasSelecionadasArray, problema, status, data, hora, nomeUsuario);

                if (sucesso) {
                    await carregarDoSupabase(); // Recarrega os dados, populando 'maquinas' com o novo item. Isso também chamará atualizarPainel()
                    await salvarRankingMensal(); // Recalcula e salva o ranking mensal com o novo dado no Supabase.
                    limparCampos();
                    Swal.fire('Salvo!', 'Registro(s) de manutenção adicionado(s) com sucesso.', 'success');
                }
            } catch (error) {
                console.error("Erro inesperado ao tentar salvar:", error);
                Swal.fire('Erro Inesperado!', 'Ocorreu um erro ao processar sua solicitação. Tente novamente.', 'error');
            } finally {
                btnSalvar.disabled = false;
                btnSalvar.textContent = 'Salvar';
            }
        });
    }

    // Event Listeners para Filtros no Painel
    const btnFiltrar = document.getElementById('btnFiltrar');
    if (btnFiltrar) {
        btnFiltrar.addEventListener('click', () => {
            filtroTexto = document.getElementById('filtroTexto') ? document.getElementById('filtroTexto').value.trim() : '';
            ordenarPor = document.getElementById('filtroOrdenar') ? document.getElementById('filtroOrdenar').value : 'maisRecente';
            paginaAtual = 1; // reset página ao filtrar
            atualizarPainel();
        });
    }

    const btnLimparFiltros = document.getElementById('btnLimparFiltros');
    if (btnLimparFiltros) {
        btnLimparFiltros.addEventListener('click', () => {
            document.getElementById('filtroTexto').value = '';
            document.getElementById('filtroDataInicio').value = '';
            document.getElementById('filtroStatus').value = '';
            document.getElementById('filtroOrdenar').value = 'maisRecente';
            filtroTexto = '';
            paginaAtual = 1;
            atualizarPainel();
        });
    }

    // Event listener para o botão Gerar PDF na aba de relatórios
    const btnGerarPdf = document.getElementById('btn-gerar-pdf');
    if (btnGerarPdf) {
        btnGerarPdf.addEventListener('click', () => gerarRelatorioPDF()); // Chama sem IDs para o relatório normal
    }

    //Event listener para o botão Imprimir Selecionados no painel
    const btnImprimirSelecionados = document.getElementById('btn-imprimir-selecionados');
    if (btnImprimirSelecionados) {
        btnImprimirSelecionados.addEventListener('click', () => {
            // CONSOLE.LOG ADICIONADO AQUI
            console.log("Evento de clique no botão 'Imprimir Selecionados'. selectedCards:", selectedCards);

            if (selectedCards.size > 0) {
                // Converte o Set para um Array e passa para a função de PDF
                gerarRelatorioPDF(Array.from(selectedCards));
            } else {
                Swal.fire('Atenção!', 'Nenhum card selecionado para impressão.', 'warning');
            }
        });
        // Desabilita o botão inicialmente se não houver cards selecionados
        btnImprimirSelecionados.disabled = selectedCards.size === 0;
    }

    // Event listener para o filtro de mês/ano do ranking mensal
    const filtroMesRanking = document.getElementById('filtro-mes-ranking');
    if (filtroMesRanking) {
        filtroMesRanking.addEventListener('change', atualizarRankingMensal);
    }

    // NOVO: Event Listener para o botão "Ativar Seleção Múltipla"
    const btnAtivarSelecaoMultipla = document.getElementById('btnAtivarSelecaoMultipla');
    if (btnAtivarSelecaoMultipla) {
        btnAtivarSelecaoMultipla.addEventListener('click', toggleMultiSelectMode);
    }

    // NOVO: Event Listener para o select de máquinas no formulário de cadastro
    const selectMaquinaCadastro = document.getElementById('maquina');
    if (selectMaquinaCadastro) {
        selectMaquinaCadastro.addEventListener('change', (event) => {
            const selectedOptionValue = event.target.value;

            if (selectedOptionValue === "") { // Se a opção "-- Escolha --" foi selecionada
                selectedMachinesForForm.clear(); // Limpa todas as seleções
            } else if (isMultiSelectActive) {
                // No modo multi-seleção, adiciona/remove o item do Set
                if (selectedMachinesForForm.has(selectedOptionValue)) {
                    selectedMachinesForForm.delete(selectedOptionValue);
                } else {
                    selectedMachinesForForm.add(selectedOptionValue);
                }
            } else {
                // No modo de seleção única, limpa e adiciona apenas o item clicado
                selectedMachinesForForm.clear();
                selectedMachinesForForm.add(selectedOptionValue);
            }
            // Garante que o select exiba as opções selecionadas (apenas se não for a opção padrão vazia)
            renderSelectedMachinesForForm();
            // Atualiza o display de especificações com base nas seleções no Set
            updateMachineSpecsDisplay(Array.from(selectedMachinesForForm));

            // Garante que o valor exibido no select corresponda ao primeiro item selecionado ou vazio
            // Isso evita que o select mostre "nenhum" se múltiplas estiverem selecionadas
            if (selectedMachinesForForm.size > 0 && !isMultiSelectActive) {
                selectMaquinaCadastro.value = Array.from(selectedMachinesForForm)[0];
            } else if (selectedMachinesForForm.size === 0) {
                selectMaquinaCadastro.value = "";
            }

            // Impede que o navegador tente selecionar apenas um item se estivermos no modo de seleção múltipla personalizada
            if (isMultiSelectActive) {
                event.preventDefault(); // Impede o comportamento padrão do select
            }
        });
    }
});
