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
    valorEntradaInput = document.getElementById('valor-entrada');
    lucroPorOperacaoInput = document.getElementById('lucro-operacao');
    capitalAtualSpan = document.getElementById('capital-atual');
    lucroAcumuladoSpan = document.getElementById('lucro-acumulado');
    acertosSpan = document.getElementById('acertos');
    errosSpan = document.getElementById('erros');
    historicoTableBody = document.getElementById('historico-body');

    console.log('DOM elements initialized:', {
        capitalInicialInput,
        totalOperacoesInput,
        operacoesGanhoInput,
        payoutFixoInput
    });

    // Adicionar event listeners
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

    // Carregar dados iniciais
    console.log('Calling carregarDados initially');
    carregarDados();

    // Atualizar dados a cada 5 segundos
    console.log('Setting interval for carregarDados');
    setInterval(carregarDados, 5000);
});

// Função para atualizar célula na planilha
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
    } catch (error) {
        console.error('Erro detalhado ao atualizar célula:', error);
        alert(`Erro ao comunicar com o servidor (${field}). Verifique o console para detalhes.`);
    }
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

        const result = await response.json();
        console.log('Vitória registrada com sucesso:', result);
        
        // Atualizar dados após registrar vitória
        console.log('Calling carregarDados after WIN');
        await carregarDados();
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

        const result = await response.json();
        console.log('Derrota registrada com sucesso:', result);
        
        // Atualizar dados após registrar derrota
        console.log('Calling carregarDados after LOSS');
        await carregarDados();
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

        const result = await response.json();
        console.log('Dados zerados com sucesso:', result);
        
        // Limpar campos de entrada
        if (capitalInicialInput) capitalInicialInput.value = '';
        if (totalOperacoesInput) totalOperacoesInput.value = '';
        if (operacoesGanhoInput) operacoesGanhoInput.value = '';
        if (payoutFixoInput) payoutFixoInput.value = '';
        
        // Atualizar dados após zerar
        console.log('Calling carregarDados after ZERAR');
        await carregarDados();
    } catch (error) {
        console.error('Erro detalhado ao zerar dados:', error);
        alert('Erro ao comunicar com o servidor (ZERAR). Verifique o console para detalhes.');
    } finally {
        if (btnZerar) btnZerar.disabled = false;
    }
}

// Função para carregar dados da planilha
async function carregarDados() {
    // console.log('Attempting to load data from /dados'); // Removido para evitar spam no console
    try {
        const response = await fetch(`${API_URL}/dados`);
        // console.log('Received response from /dados:', response); // Removido para evitar spam no console
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Error response body from /dados: ${errorText}`);
            throw new Error(`Erro ao carregar dados: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        // console.log('Dados carregados com sucesso:', data); // Removido para evitar spam no console
        
        // Atualizar métricas
        if (capitalAtualSpan) capitalAtualSpan.textContent = formatarValor(data.capital_atual);
        if (lucroAcumuladoSpan) lucroAcumuladoSpan.textContent = formatarValor(data.lucro_acumulado);
        if (acertosSpan) acertosSpan.textContent = data.acertos || '0';
        if (errosSpan) errosSpan.textContent = data.erros || '0';
        
        // Atualizar histórico
        atualizarHistorico(data.historico);

        // Atualizar campos de entrada que são lidos da planilha (se necessário)
        // Exemplo: if (valorEntradaInput && data.valor_entrada) valorEntradaInput.value = data.valor_entrada;
        // Exemplo: if (lucroPorOperacaoInput && data.lucro_operacao) lucroPorOperacaoInput.value = data.lucro_operacao;

    } catch (error) {
        console.error('Erro detalhado ao carregar dados:', error);
        // Não mostrar alerta aqui para evitar spam de alertas durante atualizações periódicas
    }
}

// Função para atualizar tabela de histórico
function atualizarHistorico(historico) {
    if (!historicoTableBody) return;
    
    // Limpar tabela
    historicoTableBody.innerHTML = '';
    
    // Adicionar linhas do histórico
    if (historico && historico.length > 0) {
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
            resultadoCell.className = item.resultado === 'W' ? 'text-success' : 'text-danger';
            row.appendChild(resultadoCell);
            
            // Lucro
            const lucroCell = document.createElement('td');
            lucroCell.textContent = formatarValor(item.lucro);
            row.appendChild(lucroCell);
            
            historicoTableBody.appendChild(row);
        });
    }
}

// Função para formatar valores monetários
function formatarValor(valor) {
    if (valor === null || valor === undefined || valor === '') return 'R$ 0,00';
    
    // Converter para número se for string, tratando vírgula como separador decimal
    const num = typeof valor === 'string' ? parseFloat(valor.replace(/[^\d,-]/g, '').replace(',', '.')) : valor;
    
    // Verificar se é um número válido
    if (isNaN(num)) return 'R$ 0,00'; // Ou talvez retornar o valor original se não for número?
    
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

