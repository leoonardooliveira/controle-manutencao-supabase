/// --- VERIFICA LOGIN ---
if (!localStorage.getItem('role')) {
    // Se não estiver logado (ou se as chaves do localStorage não existirem), redireciona para login.
    // ESTA LINHA É FUNDAMENTAL PARA GARANTIR QUE APENAS USUÁRIOS AUTENTICADOS ACESSEM O INDEX.HTML
    window.location.href = "login.html"; 
    
    // As linhas abaixo eram para SIMULAÇÃO de login em ambiente de DESENVOLVIMENTO.
    // Elas DEVEM ser REMOVIDAS ou MANTIDAS COMENTADAS em ambiente de PRODUÇÃO,
    // pois o login agora é tratado EXCLUSIVAMENTE pelo Supabase.
    // localStorage.setItem('role', 'admin'); // REMOVER/COMENTAR: Simula um admin
    // localStorage.setItem('nomeUsuario', 'Teste Admin'); // REMOVER/COMENTAR: Simula um nome
}
// --- FIM VERIFICA LOGIN ---

// --- INÍCIO: INTEGRAÇÃO SUPABASE ---
const supabaseUrl = 'https://bowsorbdmabhnlzgynef.supabase.co'; // SUA URL DO PROJETO SUPABASE
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvd3NvcmJkbWFiaG5semd5bmVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwODI1NTMsImV4cCI6MjA2NzY1ODU1M30.iTRhLEdmFUapxiSnm87ZrbmOhUjVkP2zbKfPDI3aGbg'; // SUA ANON PUBLIC KEY SUPABASE
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
// --- FIM: INTEGRAÇÃO SUPABASE ---

let maquinas = {}; // Objeto para armazenar os dados das máquinas carregados do Supabase
// As variáveis 'role' e 'nomeUsuario' AGORA SÃO INICIALIZADAS COM BASE NO localStorage.
// Se o usuário não estiver logado (e, portanto, redirecionado), essas linhas nem serão executadas.
// Se ele estiver logado, o login.html já terá populado o localStorage.
const role = localStorage.getItem('role');
const nomeUsuario = localStorage.getItem('nomeUsuario') || 'Desconhecido'; // Evita undefined caso algo dê errado ou não esteja definido.

const registrosPorPagina = 6; // PAGINAÇÃO: 6 cards por página
let paginaAtual = 1;

let filtroTexto = '';
let ordenarPor = 'maisRecente'; // padrão ordenar do mais recente para o mais antigo

// NOVO: Conjunto para armazenar os IDs dos cards selecionados
const selectedCards = new Set();

// --- NOVO: LISTA DE TÉCNICOS FIXOS (em ordem alfabética) ---
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

// --- ESPECIFICAÇÕES DAS MÁQUINAS (ATUALIZADO CONFORME A PLANILHA) ---
// Este objeto é local ao seu JS e não depende do Supabase para sua definição
const maquinaEspecificacoes = {
    "lavadora01": { nome: "Lavadora Suzuki 50KG - 01", marca: "SUZUKI", modelo: "MLEx 50", capacidade: "50KG" },
    "lavadora02": { nome: "Lavadora Suzuki 100KG - 02", marca: "SUZUKI", modelo: "MLEx 100", capacidade: "100KG" },
    "lavadora03": { nome: "Lavadora Suzuki 240KG - 03", marca: "SUZUKI", modelo: "MLEx 240H", capacidade: "240KG" },
    "lavadora04": { nome: "Lavadora Suzuki 240KG - 04", marca: "SUZUKI", modelo: "MLEx 240H", capacidade: "240KG" },
    "lavadora05": { nome: "Lavadora Suzuki 240KG - 05", marca: "SUZUKI", modelo: "MLEx 240H", capacidade: "240KG" },
    "lavadora06": { nome: "Lavadora Suzuki 240KG - 06", marca: "SUZUKI", modelo: "MLEx 240H", capacidade: "240KG" },
    "lavadora07": { nome: "Lavadora Suzuki 240KG - 07", marca: "SUZUKI", modelo: "MLEx 240H", capacidade: "240KG"},
    "lavadora08": { nome: "Lavadora Suzuki 240KG - 08", marca: "SUZUKI", modelo: "MLEx 240H", capacidade: "240KG" },
    "lavadora09": { nome: "Lavadora Suzuki 240KG - 09", marca: "SUZUKI", modelo: "MLEx 240H", capacidade: "240KG" },
    "lavadora10": { nome: "Lavadora Baumer 240KG - 10", marca: "BAUMER", modelo: "BAUMER 240KG", capacidade: "240KG" },
    "lavadora11": { nome: "Lavadora Sitec 200KG - 11", marca: "SITEC", modelo: "SLEX-H", capacidade: "200KG" },
    "lavadora12": { nome: "Lavadora Sitec 200KG - 12", marca: "SITEC", modelo: "SLEX-H", capacidade: "200KG" },
    "lavadora13": { nome: "Lavadora Sitec 100KG - 13", marca: "SITEC", modelo: "SLEX-H", capacidade: "100KG" },
    "secador01": { nome: "Secador Sitec 100KG - 01", marca: "SITEC", modelo: "SSV", capacidade: "100KG" },
    "secador02": { nome: "Secador Sitec 100KG - 02", marca: "SITEC", modelo: "SSV", capacidade: "100KG" },
    "secador03": { nome: "Secador Sitec 100KG - 03", marca: "SITEC", modelo: "SSV", capacidade: "100KG"},
    "secador04": { nome: "Secador Sitec 100KG - 04", marca: "SITEC", modelo: "SSV", capacidade: "100KG"},
    "secador05": { nome: "Secador Sitec 100KG - 05", marca: "SITEC", modelo: "SSV", capacidade: "100KG" },
    "secador06": { nome: "Secador Sitec 100KG - 06", marca: "SITEC", modelo: "SSV", capacidade: "100KG" },
    "secador07": { nome: "Secador Sitec 100KG - 07", marca: "SITEC", modelo: "SSV", capacidade: "100KG" },
    "secador08": { nome: "Secador Suzuki 140KG - 08", marca: "SUZUKI", modelo: "SCV 140", capacidade: "140KG" },
    "secador09": { nome: "Secador Suzuki 140KG - 09", marca: "SUZUKI", modelo: "SCV 140", capacidade: "140KG"},
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
    "compressor03": { nome: "Compressor Chiaperini 425L - 03", marca: "CHIAPERINI", modelo: "CJ 120 APW", capacidade: "425L" }
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
    return maquinaId; // Retorna o ID original se não conseguir formatar
}

// --- Funções de UI básicas ---

// Preenche o select de máquinas no formulário de registro E na aba de relatórios
function preencherSelectMaquinas() {
    const selectMaquinaCadastro = document.getElementById('maquina');
    const selectMaquinaRelatorio = document.getElementById('filtro-maquina-relatorio');

    // Limpa as opções existentes (exceto a primeira "Escolha" ou "Todas as Máquinas")
    while (selectMaquinaCadastro.options.length > 1) {
        selectMaquinaCadastro.remove(1);
    }
    while (selectMaquinaRelatorio.options.length > 1) {
        selectMaquinaRelatorio.remove(1);
    }

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
}

// A função logout já está correta, incluindo o signOut do Supabase.
// Ela já foi validada na conversa anterior, então não há alterações aqui.
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
    document.getElementById('maquina').value = '';
    document.getElementById('problema').value = '';
    document.getElementById('status').value = ''; // Reseta para o padrão vazio
    document.getElementById('data').value = '';
    // Limpar o card de especificações ao limpar campos
    document.getElementById('cardEspecificacoesCadastro').innerHTML = `
        <h3>Especificações da Máquina</h3>
        <p>Selecione uma máquina para ver as especificações.</p>
    `;
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

        let conteudoCard = `
            <div class="card-header">
                <h3>${nomeFormatadoCurto}</h3>
                ${role === 'admin' ? `
                    <input type="checkbox" class="card-checkbox" data-id="${id}"
                                 ${selectedCards.has(Number(id)) ? 'checked' : ''}
                                 onchange="toggleCardSelection('${id}', this.checked)">
                ` : ''}
            </div>
            <p><strong>OS:</strong> ${dados.numero_os || 'N/A'}</p> <p><strong>Problema:</strong> ${dados.problema}</p>
            <p><strong>Data:</strong> ${new Date(dados.data + 'T' + (dados.hora || '00:00:00')).toLocaleDateString('pt-BR')} ${dados.hora ? '- ' + dados.hora : ''}</p>
            <p><strong>Registrado por:</strong> ${dados.usuario || 'Desconhecido'}</p>
            `;

        // Exibir apenas o último item do histórico e uma contagem
        if (dados.historico && dados.historico.length > 0) {
            const ultimoHist = dados.historico[dados.historico.length - 1]; // Pega o último item do histórico
            const usuarioHist = ultimoHist.usuario || 'Desconhecido';
            const statusHist = formatarStatus(ultimoHist.status) || 'status desconhecido';
            const dataHoraHist = ultimoHist.dataHora || 'data desconhecida';

            let tecnicoConclusaoInfo = '';
            if (ultimoHist.status === 'concluido' && ultimoHist.tecnicoConclusao) { // Verifica se há técnico de conclusão
                tecnicoConclusaoInfo = ` (Téc.: ${ultimoHist.tecnicoConclusao})`;
            }

            conteudoCard += `<p><strong>Última Alt.:</strong> ${usuarioHist} - ${statusHist}${tecnicoConclusaoInfo} em ${dataHoraHist}</p>`; // Adiciona info do técnico
            // Se tiver mais de uma alteração, pode-se adicionar um texto para indicar
            if (dados.historico.length > 1) {
                conteudoCard += `<p style="font-size: 0.8em; margin-top: 2px;">(${dados.historico.length - 1} ${dados.historico.length - 1 === 1 ? 'outra alteração' : 'outras alterações'})</p>`;
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
}

// NOVO: Função para adicionar/remover IDs do conjunto de seleção
function toggleCardSelection(id, isChecked) {
    // Converte o ID para número ao adicionar/remover do Set
    // Isso é crucial porque item.id (do Supabase) é 'number' e id (do data-id) é 'string'
    const numericId = Number(id);

    if (isChecked) {
        selectedCards.add(numericId);
    } else {
        selectedCards.delete(numericId);
    }
    // Opcional: Habilitar/desabilitar o botão de imprimir selecionados
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

    // NOVO: Remove o ID do conjunto de seleção se ele estiver lá
    selectedCards.delete(Number(id)); // Ajustado para remover ID numérico
    // Atualiza o estado do botão de impressão
    const btnImprimirSelecionados = document.getElementById('btn-imprimir-selecionados');
    if (btnImprimirSelecionados) {
        btnImprimirSelecionados.disabled = selectedCards.size === 0;
    }

    await carregarDoSupabase(); // Recarrega todos os dados após a exclusão
    await salvarRankingMensal(); // Recalcula e salva o ranking mensal (agora com dados atualizados)
    Swal.fire('Excluído!', 'O registro foi removido.', 'success');
}

function editar(id) {
    if (maquinas[id]) {
        // Armazenar o estado original para poder cancelar
        maquinas[id].originalStatus = maquinas[id].status;
        maquinas[id].editando = true;

        // NOVO: Pré-seleciona o técnico de conclusão se o status atual já for 'concluido'
        if (maquinas[id].status === 'concluido') {
            // Tenta encontrar o técnico da última conclusão no histórico
            const ultimoConcluido = maquinas[id].historico.slice().reverse().find(h => h.status === 'concluido' && h.tecnicoConclusao);
            if (ultimoConcluido) {
                maquinas[id].tecnicoConclusaoNaEdicao = ultimoConcluido.tecnicoConclusao;
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

        // NOVO: Captura o nome do técnico se o status for 'concluido'
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
            usuario: nomeUsuario, // Quem está operando o sistema (você)
            status: novoStatus,
            dataHora: dataHora
        };

        // NOVO: Adiciona o nome do técnico de conclusão ao histórico SE o status for 'concluido'
        if (novoStatus === 'concluido') {
            historicoEntry.tecnicoConclusao = tecnicoConclusao;
        }

        // Atualizar no Supabase o status e historico
        const { error } = await supabase
            .from('maquinas')
            .update({ status: novoStatus, historico: [...maquinas[id].historico, historicoEntry], atualizado_em: new Date().toISOString() })
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

// --- Funções de Ranking Geral (Ativos) ---
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

    // Assegura que o ranking mensal também seja atualizado quando o ranking geral é
    // (Pode ser redundante se já chamado em outras operações, mas garante consistência)
    // REMOVIDO PARA EVITAR CHAMADAS DESNECESSÁRIAS: atualizarRankingMensal();
}

// --- NOVAS FUNÇÕES PARA RANKING MENSAL PERSISTENTE ---

/**
 * Calcula o ranking das máquinas com base nos problemas registrados para o mês atual
 * e o salva na tabela 'rankings_mensais' do Supabase.
 * Esta função sobrescreve os dados existentes para o mês atual para garantir consistência.
 */
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

// Nova função auxiliar para formatar "YYYY-MM" para "Mês/Ano"
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


// --- FIM NOVAS FUNÇÕES PARA RANKING MENSAL PERSISTENTE ---

// --- FUNÇÕES PARA RELATÓRIOS (PDF) ---
// NOVO: Adicione um parâmetro opcional 'idsParaImprimir'
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

    // --- BASE64 DA IMAGEM DA LOGO ---
    // VOCÊ DEVE SUBSTITUIR ESTA STRING PELA SUA PRÓPRIA STRING BASE64 GERADA!
    const imgData = 'data:image/png;base64,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';
    // Exemplo de string Base64 (MUITO CURTA, APENAS PARA EXEMPLO VISUAL):
    // const imgData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==';

    // Posição e tamanho da logo (ajuste conforme necessário)
    const imgX = 14; // Posição X da imagem (margem esquerda)
    const imgY = 10; // Posição Y da imagem (margem superior)
    const imgWidth = 50; // Largura da imagem (em mm)
    const imgHeight = 20; // Altura da imagem (em mm) - ajuste para manter proporção


    // Função auxiliar para adicionar a logo e o título em uma página
    const addPageHeader = (doc, title, imgData, imgX, imgY, imgWidth, imgHeight) => {
        doc.addImage(imgData, 'PNG', imgX, imgY, imgWidth, imgHeight); // Adiciona a logo
        doc.setFontSize(18);
        doc.text(title, doc.internal.pageSize.getWidth() / 2, imgY + imgHeight / 2 + 5, { align: 'center', baseline: 'middle' }); // Centraliza o título verticalmente com a logo
        // Ajuste a posição inicial 'y' para o conteúdo abaixo do cabeçalho
        return imgY + imgHeight + 10; // Retorna a nova posição Y inicial para o conteúdo
    };

    let y = addPageHeader(doc, isGerandoOS ? 'Ordem de Serviço' : 'Relatório de Manutenções', imgData, imgX, imgY, imgWidth, imgHeight);


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
    // let y = 30; // Posição Y inicial - REMOVIDA, AGORA É DEFINIDA PELA addPageHeader

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
        // --- MUDANÇA AQUI: Obtém o nome COMPLETO da máquina ---
        const nomeMaquinaCompleto = maquinaEspecificacoes[item.maquina] ? maquinaEspecificacoes[item.maquina].nome : 'Máquina Desconhecida';
        // --- FIM DA MUDANÇA ---

        const dataFormatada = new Date(item.data + 'T' + (item.hora || '00:00:00')).toLocaleDateString('pt-BR');
        const horaFormatada = item.hora ? item.hora.substring(0, 5) : 'N/A';

        // Pular para a próxima página se não houver espaço suficiente
        const alturaNecessaria = isGerandoOS ? 130 : 65; // Ajuste esta estimativa

        // Lógica de nova página
        if (y + alturaNecessaria > doc.internal.pageSize.height - 10) { // Margem inferior de 10mm
            doc.addPage();
            y = addPageHeader(doc, isGerandoOS ? 'Ordem de Serviço' : '(Continuação) Relatório de Manutenções', imgData, imgX, imgY, imgWidth, imgHeight);

            // Se for relatório geral, repete o cabeçalho/resumo da página
            if (!isGerandoOS) {
                y += 10;
                doc.setFontSize(14);
                doc.text(`(Continuação) Relatório de Manutenções`, 14, y);
                y += 8;
                doc.setFontSize(12);
                doc.text(`Período: ${mesAnoSelecionado ? formatarMesAno(mesAnoSelecionado) : 'Todo o Período'}`, 14, y);
                y += 7;
                // --- MUDANÇA AQUI: Usa o nome completo também no cabeçalho de continuação do relatório ---
                doc.text(`Máquina: ${maquinaSelecionadaId ? (maquinaEspecificacoes[maquinaSelecionadaId] ? maquinaEspecificacoes[maquinaSelecionadaId].nome : 'Máquina Desconhecida') : 'Todas as Máquinas'}`, 14, y);
                // --- FIM DA MUDANÇA ---
                y += 15;
                doc.setDrawColor(150);
                doc.line(14, y, 196, y);
                doc.setDrawColor(0);
                y += 10;
            }
        }

        doc.setFontSize(12);
        doc.text(`Número da OS: ${item.numero_os || 'N/A'}`, 14, y + 5);
        // --- MUDANÇA AQUI: Usa o nome COMPLETO da máquina ---
        doc.text(`Máquina: ${nomeMaquinaCompleto}`, 14, y + 12);
        // --- FIM DA MUDANÇA ---
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
            // ... (restante dos campos para preenchimento manual da OS, sem alterações) ...
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
        selectedCards.clear();
        atualizarPainel(); // Para desmarcar os checkboxes na UI
    }
}

// --- SUPABASE: Funções de Interação com a tabela 'maquinas' ---
async function salvarNoSupabase(maquina, problema, status, data, hora, usuario) {
    const criado_em = `${data}T${hora}`; // Formato correto YYYY-MM-DDTHH:MM:SS // Garante formato de datetime completo

    // Inicia o histórico com a entrada inicial
    const historicoInicial = [{
        usuario: usuario,
        status: status,
        dataHora: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour12: false })
    }];

    const { data: insertedData, error } = await supabase
        .from('maquinas')
        .insert([{ maquina, problema, status, criado_em, usuario, historico: historicoInicial }])
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
        .select('*') // Seleciona todas as colunas, incluindo numero_os e historico
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
            editando: false
        };
    });
    atualizarPainel(); // Atualiza o painel com os dados recém-carregados
}

// --- DOMContentLoaded e Event Listeners ---
document.addEventListener('DOMContentLoaded', async () => {
    // Esconde a div de informações do usuário no carregamento
    const userInfoDisplay = document.getElementById('userInfoDisplay');
    if (userInfoDisplay) {
        userInfoDisplay.style.display = 'none';
    }

    // --- ADICIONE ESTA PARTE PARA VERIFICAR A SESSÃO DO SUPABASE ---
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
        console.warn("Sessão Supabase inválida ou inexistente. Redirecionando para login.");
        localStorage.clear(); // Limpa o localStorage para garantir um novo login limpo
        window.location.href = "login.html";
        return; // Sai da função para não tentar carregar dados sem autenticação
    }
    // --- FIM DA ADIÇÃO ---

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

            const maquina = document.getElementById('maquina').value;
            const problema = document.getElementById('problema').value.trim();
            const status = document.getElementById('status').value;
            const data = document.getElementById('data').value;

            if (!maquina || !problema || !status || !data) {
                Swal.fire('Atenção!', 'Por favor, preencha todos os campos!', 'warning');
                btnSalvar.disabled = false; // Reabilita o botão
                btnSalvar.textContent = 'Salvar'; // Restaura o texto
                return;
            }

            const agora = new Date();
            const hora = agora.toLocaleTimeString('pt-BR', { hour12: false });

            try {
                const sucesso = await salvarNoSupabase(maquina, problema, status, data, hora, nomeUsuario);

                if (sucesso) {
                    await carregarDoSupabase(); // Recarrega os dados, populando 'maquinas' com o novo item. Isso também chamará atualizarPainel()
                    await salvarRankingMensal(); // Recalcula e salva o ranking mensal com o novo dado no Supabase.
                    limparCampos();
                    Swal.fire('Salvo!', 'Registro de manutenção adicionado com sucesso.', 'success');
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

    // NOVO: Event listener para o botão Imprimir Selecionados no painel
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


    const selectMaquinaCadastro = document.getElementById('maquina');
    if (selectMaquinaCadastro) {
        selectMaquinaCadastro.addEventListener('change', (event) => {
            const maquinaSelecionadaId = event.target.value;
            const cardEspecificacoes = document.getElementById('cardEspecificacoesCadastro');
            if (cardEspecificacoes) {
                if (maquinaSelecionadaId && maquinaEspecificacoes[maquinaSelecionadaId]) {
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
                } else {
                    cardEspecificacoes.innerHTML = `
                        <h3>Especificações da Máquina</h3>
                        <p>Selecione uma máquina para ver as especificações.</p>
                    `;
                }
            }
        });
    }
});