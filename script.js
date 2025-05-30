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

    // Adicionar event listeners
    capitalInicialInput.addEventListener('input', () => updateCell('capital_inicial', capitalInicialInput.value));
    totalOperacoesInput.addEventListener('input', () => updateCell('total_operacoes', totalOperacoesInput.value));
    operacoesGanhoInput.addEventListener('input', () => updateCell('operacoes_com_ganho', operacoesGanhoInput.value));
    payoutFixoInput.addEventListener('input', () => updateCell('payout', payoutFixoInput.value));

    // Botões
    document.getElementById('btn-win').addEventListener('click', registrarWin);
    document.getElementById('btn-loss').addEventListener('click', registrarLoss);
    document.getElementById('btn-zerar').addEventListener('click', zerar);

    // Carregar dados iniciais
    carregarDados();

    // Atualizar dados a cada 5 segundos
    setInterval(carregarDados, 5000);
});

// Função para atualizar célula na planilha
async function updateCell(field, value) {
    try {
        const data = {};
        data[field] = value;
        
        const response = await fetch(`${API_URL}/update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`Erro ao atualizar célula: ${response.status}`);
        }

        const result = await response.json();
        console.log('Célula atualizada:', result);
    } catch (error) {
        console.error('Erro ao atualizar célula:', error);
        alert('Erro ao comunicar com o servidor. Tente novamente.');
    }
}

// Função para registrar vitória (WIN)
async function registrarWin() {
    try {
        const btnWin = document.getElementById('btn-win');
        btnWin.disabled = true;
        
        const response = await fetch(`${API_URL}/win`, {
            method: 'POST'
        });

        if (!response.ok) {
            throw new Error(`Erro ao registrar vitória: ${response.status}`);
        }

        const result = await response.json();
        console.log('Vitória registrada:', result);
        
        // Atualizar dados após registrar vitória
        await carregarDados();
    } catch (error) {
        console.error('Erro ao registrar vitória:', error);
        alert('Erro ao comunicar com o servidor. Tente novamente.');
    } finally {
        document.getElementById('btn-win').disabled = false;
    }
}

// Função para registrar derrota (LOSS)
async function registrarLoss() {
    try {
        const btnLoss = document.getElementById('btn-loss');
        btnLoss.disabled = true;
        
        const response = await fetch(`${API_URL}/loss`, {
            method: 'POST'
        });

        if (!response.ok) {
            throw new Error(`Erro ao registrar derrota: ${response.status}`);
        }

        const result = await response.json();
        console.log('Derrota registrada:', result);
        
        // Atualizar dados após registrar derrota
        await carregarDados();
    } catch (error) {
        console.error('Erro ao registrar derrota:', error);
        alert('Erro ao comunicar com o servidor. Tente novamente.');
    } finally {
        document.getElementById('btn-loss').disabled = false;
    }
}

// Função para zerar dados
async function zerar() {
    try {
        const btnZerar = document.getElementById('btn-zerar');
        btnZerar.disabled = true;
        
        const response = await fetch(`${API_URL}/reset`, {
            method: 'POST'
        });

        if (!response.ok) {
            throw new Error(`Erro ao zerar dados: ${response.status}`);
        }

        const result = await response.json();
        console.log('Dados zerados:', result);
        
        // Limpar campos de entrada
        capitalInicialInput.value = '';
        totalOperacoesInput.value = '';
        operacoesGanhoInput.value = '';
        payoutFixoInput.value = '';
        
        // Atualizar dados após zerar
        await carregarDados();
    } catch (error) {
        console.error('Erro ao zerar dados:', error);
        alert('Erro ao comunicar com o servidor. Tente novamente.');
    } finally {
        document.getElementById('btn-zerar').disabled = false;
    }
}

// Função para carregar dados da planilha
async function carregarDados() {
    try {
        const response = await fetch(`${API_URL}/dados`);
        
        if (!response.ok) {
            throw new Error(`Erro ao carregar dados: ${response.status}`);
        }

        const data = await response.json();
        console.log('Dados carregados:', data);
        
        // Atualizar métricas
        if (capitalAtualSpan) capitalAtualSpan.textContent = formatarValor(data.capital_atual);
        if (lucroAcumuladoSpan) lucroAcumuladoSpan.textContent = formatarValor(data.lucro_acumulado);
        if (acertosSpan) acertosSpan.textContent = data.acertos || '0';
        if (errosSpan) errosSpan.textContent = data.erros || '0';
        
        // Atualizar histórico
        atualizarHistorico(data.historico);
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
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
    if (valor === null || valor === undefined) return 'R$ 0,00';
    
    // Converter para número se for string
    const num = typeof valor === 'string' ? parseFloat(valor.replace(/[^\d,-]/g, '').replace(',', '.')) : valor;
    
    // Verificar se é um número válido
    if (isNaN(num)) return 'R$ 0,00';
    
    // Formatar como moeda brasileira
    return `R$ ${num.toFixed(2).replace('.', ',')}`;
}

// Verificar status do backend ao iniciar
async function verificarStatus() {
    try {
        const response = await fetch(`${API_URL}/status`);
        const data = await response.json();
        
        if (data.status === 'online') {
            console.log('Backend conectado com sucesso!');
        } else {
            console.error('Backend offline:', data.message);
            alert('Erro ao conectar com o servidor. Verifique se o backend está em execução.');
        }
    } catch (error) {
        console.error('Erro ao verificar status do backend:', error);
        alert('Erro ao conectar com o servidor. Verifique se o backend está em execução.');
    }
}

// Verificar status ao carregar a página
window.addEventListener('load', verificarStatus);
