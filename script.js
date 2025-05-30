// Configuração da API
const API_URL = 'https://web-production-3f3de.up.railway.app';

// Elementos do DOM
let capitalInicialInput;
let totalOperacoesInput;
let operacoesGanhoInput;
let payoutFixoInput;
let valorEntradaInput;
let lucroPorOperacaoInput;
let capitalAtualSpan;
let lucroAcumuladoSpan;
let acertosSpan;
let errosSpan;
let historicoTableBody;

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');

    // Inicializar elementos do DOM
    capitalInicialInput = document.getElementById('capital-inicial');
    totalOperacoesInput = document.getElementById('total-operacoes');
    operacoesGanhoInput = document.getElementById('operacoes-ganho');
    payoutFixoInput = document.getElementById('payout-fixo');
    valorEntradaInput = document.getElementById('valor-entrada'); // Readonly, updated by backend?
    lucroPorOperacaoInput = document.getElementById('lucro-operacao'); // Readonly, updated by backend?
    capitalAtualSpan = document.getElementById('capital-atual');
    lucroAcumuladoSpan = document.getElementById('lucro-acumulado');
    acertosSpan = document.getElementById('acertos');
    errosSpan = document.getElementById('erros');
    historicoTableBody = document.getElementById('historico-body');

    console.log('DOM elements initialized');

    // Adicionar event listeners para inputs que atualizam a planilha
    if (capitalInicialInput) {
        capitalInicialInput.addEventListener('input', () => {
            console.log('Input event fired for capital_inicial');
            updateCell('capital_inicial', capitalInicialInput.value);
        });
    } else {
        console.error('Element with ID capital-inicial not found');
    }

    if (totalOperacoesInput) {
        totalOperacoesInput.addEventListener('input', () => {
            console.log('Input event fired for total_operacoes');
            updateCell('total_operacoes', totalOperacoesInput.value);
        });
    } else {
        console.error('Element with ID total-operacoes not found');
    }

    if (operacoesGanhoInput) {
        operacoesGanhoInput.addEventListener('input', () => {
            console.log('Input event fired for operacoes_com_ganho');
            updateCell('operacoes_com_ganho', operacoesGanhoInput.value);
        });
    } else {
        console.error('Element with ID operacoes-ganho not found');
    }

    if (payoutFixoInput) {
        payoutFixoInput.addEventListener('input', () => {
            console.log('Input event fired for payout');
            updateCell('payout', payoutFixoInput.value);
        });
    } else {
        console.error('Element with ID payout-fixo not found');
    }

    // Botões
    const btnWin = document.getElementById('btn-win');
    if (btnWin) {
        btnWin.addEventListener('click', registrarWin);
    } else {
        console.error('Element with ID btn-win not found');
    }

    const btnLoss = document.getElementById('btn-loss');
    if (btnLoss) {
        btnLoss.addEventListener('click', registrarLoss);
    } else {
        console.error('Element with ID btn-loss not found');
    }

    const btnZerar = document.getElementById('btn-zerar');
    if (btnZerar) {
        btnZerar.addEventListener('click', zerar);
    } else {
        console.error('Element with ID btn-zerar not found');
    }

    // Carregar dados iniciais UMA VEZ ao carregar a página
    console.log('Calling carregarDados initially');
    carregarDados();

    // REMOVIDO: Atualizar dados a cada 5 segundos
    // console.log('Setting interval for carregarDados');
    // setInterval(carregarDados, 5000);
});

// Função para atualizar célula na planilha (usada pelos inputs)
async function updateCell(field, value) {
    console.log(`Attempting to update cell: field=${field}, value=${value}`);
    try {
        const data = {};
        data[field] = value;

        console.log('Sending fetch request to /update with data:', data);
        const response = await fetch(`${API_URL}/update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        console.log('Received response from /update:', response);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Error response body from /update: ${errorText}`);
            throw new Error(`Erro ao atualizar célula: ${response.status} - ${response.statusText}`);
        }

        const result = await response.json();
        console.log('Célula atualizada com sucesso:', result);
        // Talvez chamar carregarDados() aqui se a atualização de uma célula deve refletir em outras?
        // Ou melhor, o backend /update deveria retornar os dados atualizados?
        // Por enquanto, não faz nada visualmente, apenas atualiza a planilha.
    } catch (error) {
        console.error('Erro detalhado ao atualizar célula:', error);
        alert(`Erro ao comunicar com o servidor (${field}). Verifique o console para detalhes.`);
    }
}

// Função para atualizar a interface do usuário com os dados recebidos
function atualizarUI(data) {
    console.log('Updating UI with data:', data);
    if (!data) {
        console.error('No data received to update UI');
        return;
    }

    // Atualizar métricas
    if (capitalAtualSpan) capitalAtualSpan.textContent = formatarValor(data.capital_atual);
    if (lucroAcumuladoSpan) lucroAcumuladoSpan.textContent = formatarValor(data.lucro_acumulado);
    if (acertosSpan) acertosSpan.textContent = data.acertos !== undefined ? data.acertos : '0';
    if (errosSpan) errosSpan.textContent = data.erros !== undefined ? data.erros : '0';

    // Atualizar campos calculados (se vierem do backend)
    if (valorEntradaInput && data.valor_entrada !== undefined) valorEntradaInput.value = data.valor_entrada.toFixed(2).replace('.', ',');
    if (lucroPorOperacaoInput && data.lucro_operacao !== undefined) lucroPorOperacaoInput.value = data.lucro_operacao.toFixed(2).replace('.', ',');

    // Atualizar histórico
    atualizarHistorico(data.historico);
}

// Função para registrar vitória (WIN)
async function registrarWin() {
    console.log('Attempting to register WIN');
    const btnWin = document.getElementById('btn-win');
    try {
        btnWin.disabled = true;

        console.log('Sending fetch request to /win');
        const response = await fetch(`${API_URL}/win`, {
            method: 'POST'
        });
        console.log('Received response from /win:', response);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Error response body from /win: ${errorText}`);
            throw new Error(`Erro ao registrar vitória: ${response.status} - ${response.statusText}`);
        }

        const result = await response.json(); // Backend deve retornar os dados atualizados
        console.log('Vitória registrada com sucesso, received data:', result);

        // Atualizar UI com os dados retornados pelo backend
        atualizarUI(result);

    } catch (error) {
        console.error('Erro detalhado ao registrar vitória:', error);
        alert('Erro ao comunicar com o servidor (WIN). Verifique o console para detalhes.');
    } finally {
        if (btnWin) btnWin.disabled = false;
    }
}

// Função para registrar derrota (LOSS)
async function registrarLoss() {
    console.log('Attempting to register LOSS');
    const btnLoss = document.getElementById('btn-loss');
    try {
        btnLoss.disabled = true;

        console.log('Sending fetch request to /loss');
        const response = await fetch(`${API_URL}/loss`, {
            method: 'POST'
        });
        console.log('Received response from /loss:', response);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Error response body from /loss: ${errorText}`);
            throw new Error(`Erro ao registrar derrota: ${response.status} - ${response.statusText}`);
        }

        const result = await response.json(); // Backend deve retornar os dados atualizados
        console.log('Derrota registrada com sucesso, received data:', result);

        // Atualizar UI com os dados retornados pelo backend
        atualizarUI(result);

    } catch (error) {
        console.error('Erro detalhado ao registrar derrota:', error);
        alert('Erro ao comunicar com o servidor (LOSS). Verifique o console para detalhes.');
    } finally {
        if (btnLoss) btnLoss.disabled = false;
    }
}

// Função para zerar dados
async function zerar() {
    console.log('Attempting to reset data');
    const btnZerar = document.getElementById('btn-zerar');
    try {
        btnZerar.disabled = true;

        console.log('Sending fetch request to /reset');
        const response = await fetch(`${API_URL}/reset`, {
            method: 'POST'
        });
        console.log('Received response from /reset:', response);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Error response body from /reset: ${errorText}`);
            throw new Error(`Erro ao zerar dados: ${response.status} - ${response.statusText}`);
        }

        const result = await response.json(); // Backend deve retornar os dados zerados/iniciais
        console.log('Dados zerados com sucesso, received data:', result);

        // Limpar campos de entrada
        if (capitalInicialInput) capitalInicialInput.value = '';
        if (totalOperacoesInput) totalOperacoesInput.value = '';
        if (operacoesGanhoInput) operacoesGanhoInput.value = '';
        if (payoutFixoInput) payoutFixoInput.value = '';

        // Atualizar UI com os dados retornados pelo backend
        atualizarUI(result);

    } catch (error) {
        console.error('Erro detalhado ao zerar dados:', error);
        alert('Erro ao comunicar com o servidor (ZERAR). Verifique o console para detalhes.');
    } finally {
        if (btnZerar) btnZerar.disabled = false;
    }
}

// Função para carregar dados da planilha (usada apenas na carga inicial)
async function carregarDados() {
    console.log('Attempting to load initial data from /dados');
    try {
        const response = await fetch(`${API_URL}/dados`);
        console.log('Received response from /dados:', response);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Error response body from /dados: ${errorText}`);
            throw new Error(`Erro ao carregar dados iniciais: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Dados iniciais carregados com sucesso:', data);

        // Atualizar UI com os dados iniciais
        atualizarUI(data);

        // Preencher inputs iniciais se vierem do backend (opcional)
        // if (capitalInicialInput && data.capital_inicial) capitalInicialInput.value = data.capital_inicial;
        // ... outros inputs ...

    } catch (error) {
        console.error('Erro detalhado ao carregar dados iniciais:', error);
        // Não mostrar alerta aqui para não interromper o carregamento inicial
    }
}

// Função para atualizar tabela de histórico
function atualizarHistorico(historico) {
    if (!historicoTableBody) {
        console.error('Historico table body not found');
        return;
    }

    // Limpar tabela
    historicoTableBody.innerHTML = '';

    // Adicionar linhas do histórico
    if (historico && historico.length > 0) {
        console.log(`Updating history table with ${historico.length} items`);
        historico.forEach(item => {
            const row = document.createElement('tr');

            // Número da operação
            const numCell = document.createElement('td');
            numCell.textContent = item.numero;
            row.appendChild(numCell);

            // Valor da entrada
            const valorCell = document.createElement('td');
            valorCell.textContent = formatarValor(item.valor);
            row.appendChild(valorCell);

            // Resultado (W/L)
            const resultadoCell = document.createElement('td');
            resultadoCell.textContent = item.resultado;
            resultadoCell.className = item.resultado === 'W' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'; // Tailwind classes
            row.appendChild(resultadoCell);

            // Lucro
            const lucroCell = document.createElement('td');
            lucroCell.textContent = formatarValor(item.lucro);
            lucroCell.className = parseFloat(item.lucro) >= 0 ? 'text-green-600' : 'text-red-600'; // Color based on profit/loss
            row.appendChild(lucroCell);

            historicoTableBody.appendChild(row);
        });
    } else {
        console.log('No history items to display');
        // Opcional: Adicionar uma linha indicando que não há histórico
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 4;
        cell.textContent = 'Nenhuma operação registrada.';
        cell.className = 'text-center text-gray-500 py-4';
        row.appendChild(cell);
        historicoTableBody.appendChild(row);
    }
}

// Função para formatar valores monetários
function formatarValor(valor) {
    if (valor === null || valor === undefined || valor === '') return 'R$ 0,00';

    // Converter para número se for string, tratando vírgula como separador decimal
    const num = typeof valor === 'string' ? parseFloat(valor.replace(/[^\d,-]/g, '').replace(',', '.')) : parseFloat(valor);

    // Verificar se é um número válido
    if (isNaN(num)) {
        console.warn(`Invalid value received for formatting: ${valor}`);
        return 'R$ --,--'; // Indicar valor inválido
    }

    // Formatar como moeda brasileira
    return `R$ ${num.toFixed(2).replace('.', ',')}`;
}

// Verificar status do backend ao iniciar
async function verificarStatus() {
    console.log('Attempting to verify backend status');
    try {
        const response = await fetch(`${API_URL}/status`);
        console.log('Received response from /status:', response);
        const data = await response.json();

        if (data.status === 'online') {
            console.log('Backend conectado com sucesso!');
        } else {
            console.error('Backend offline:', data.message);
            alert('Erro ao conectar com o servidor. Verifique se o backend está em execução e os logs do console.');
        }
    } catch (error) {
        console.error('Erro detalhado ao verificar status do backend:', error);
        alert('Erro crítico ao conectar com o servidor. Verifique o console para detalhes.');
    }
}

// Verificar status ao carregar a página
window.addEventListener('load', () => {
    console.log('Window load event fired');
    verificarStatus();
});

