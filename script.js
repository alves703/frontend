// Configuração da API
const API_URL = 'http://localhost:5000'; // Alterar para URL de produção quando estiver em produção

// Elementos do DOM
const initialCapitalInput = document.getElementById('initial-capital');
const totalOperationsInput = document.getElementById('total-operations');
const winOperationsInput = document.getElementById('win-operations');
const payoutInput = document.getElementById('payout');
const entryValueInput = document.getElementById('entry-value');
const profitPerOperationInput = document.getElementById('profit-per-operation');
const currentCapitalDisplay = document.getElementById('current-capital');
const winsDisplay = document.getElementById('wins');
const lossesDisplay = document.getElementById('losses');
const totalProfitDisplay = document.getElementById('total-profit');
const operationsHistoryTable = document.getElementById('operations-history');
const winBtn = document.getElementById('win-btn');
const lossBtn = document.getElementById('loss-btn');
const resetBtn = document.getElementById('reset-btn');
const riskWarning = document.getElementById('risk-warning');

// Elementos do Chat
const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const usernameInput = document.getElementById('username');
const sendBtn = document.getElementById('send-btn');

// Elementos dos Sinais
const signalsContainer = document.getElementById('signals-container');

// Variável para controlar requisições em andamento
let isRequestInProgress = false;

// Função para mostrar mensagem de erro
function showError(message) {
    alert(`Erro: ${message}`);
    console.error(message);
}

// Função para formatar valores monetários
function formatCurrency(value) {
    if (value === null || value === undefined || isNaN(value)) {
        return 'R$ 0,00';
    }
    return `R$ ${parseFloat(value).toFixed(2)}`;
}

// Função para atualizar os dados na planilha
async function updateSpreadsheet(field, value) {
    if (isRequestInProgress) {
        console.log('Requisição em andamento, aguarde...');
        return false;
    }
    
    isRequestInProgress = true;
    
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
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao atualizar planilha');
        }
        
        // Atualizar dados exibidos após cada alteração
        fetchData();
        
        return true;
    } catch (error) {
        showError(`Erro ao atualizar dados: ${error.message}`);
        return false;
    } finally {
        isRequestInProgress = false;
    }
}

// Função para registrar vitória (WIN)
async function registerWin() {
    if (isRequestInProgress) {
        showError('Operação em andamento, aguarde...');
        return false;
    }
    
    isRequestInProgress = true;
    winBtn.disabled = true;
    
    try {
        const response = await fetch(`${API_URL}/win`, {
            method: 'POST'
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao registrar vitória');
        }
        
        // Atualizar dados exibidos após registrar vitória
        fetchData();
        
        return true;
    } catch (error) {
        showError(`Erro ao registrar vitória: ${error.message}`);
        return false;
    } finally {
        isRequestInProgress = false;
        winBtn.disabled = false;
    }
}

// Função para registrar derrota (LOSS)
async function registerLoss() {
    if (isRequestInProgress) {
        showError('Operação em andamento, aguarde...');
        return false;
    }
    
    isRequestInProgress = true;
    lossBtn.disabled = true;
    
    try {
        const response = await fetch(`${API_URL}/loss`, {
            method: 'POST'
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao registrar derrota');
        }
        
        // Atualizar dados exibidos após registrar derrota
        fetchData();
        
        return true;
    } catch (error) {
        showError(`Erro ao registrar derrota: ${error.message}`);
        return false;
    } finally {
        isRequestInProgress = false;
        lossBtn.disabled = false;
    }
}

// Função para zerar dados
async function resetData() {
    if (isRequestInProgress) {
        showError('Operação em andamento, aguarde...');
        return false;
    }
    
    // Confirmar antes de zerar
    if (!confirm('Tem certeza que deseja zerar todos os dados?')) {
        return false;
    }
    
    isRequestInProgress = true;
    resetBtn.disabled = true;
    
    try {
        const response = await fetch(`${API_URL}/reset`, {
            method: 'POST'
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao zerar dados');
        }
        
        // Limpar campos de entrada
        initialCapitalInput.value = '';
        totalOperationsInput.value = '';
        winOperationsInput.value = '';
        payoutInput.value = '';
        
        // Atualizar dados exibidos após zerar
        fetchData();
        
        return true;
    } catch (error) {
        showError(`Erro ao zerar dados: ${error.message}`);
        return false;
    } finally {
        isRequestInProgress = false;
        resetBtn.disabled = false;
    }
}

// Função para verificar status do servidor
async function checkServerStatus() {
    try {
        const response = await fetch(`${API_URL}/status`);
        
        if (!response.ok) {
            console.error('Servidor offline ou com problemas');
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('Erro ao verificar status do servidor:', error);
        return false;
    }
}

// Função para buscar dados da planilha
async function fetchData() {
    try {
        const response = await fetch(`${API_URL}/dados`);
        
        if (!response.ok) {
            throw new Error('Erro ao buscar dados');
        }
        
        const data = await response.json();
        
        // Atualizar campos de entrada somente leitura
        entryValueInput.value = data.entradas && data.entradas.length > 0 ? data.entradas[0] : '';
        profitPerOperationInput.value = data.lucros && data.lucros.length > 0 ? data.lucros[0] : '';
        
        // Atualizar métricas
        currentCapitalDisplay.textContent = formatCurrency(data.capital_atual);
        totalProfitDisplay.textContent = formatCurrency(data.lucro_acumulado);
        winsDisplay.textContent = data.acertos || '0';
        lossesDisplay.textContent = data.erros || '0';
        
        // Atualizar histórico de operações
        updateOperationsHistory(data.historico);
        
        return data;
    } catch (error) {
        console.error('Erro ao buscar dados:', error);
        return null;
    }
}

// Função para atualizar histórico de operações
function updateOperationsHistory(historico) {
    operationsHistoryTable.innerHTML = '';
    
    if (!historico || historico.length === 0) {
        return;
    }
    
    historico.forEach((op, index) => {
        if (op.numero) {
            const row = document.createElement('tr');
            row.className = index % 2 === 0 ? 'bg-gray-50' : 'bg-white';
            
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${op.numero}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatCurrency(op.valor)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm ${op.resultado === 'W' ? 'text-green-600' : op.resultado === 'L' ? 'text-red-600' : 'text-gray-500'}">${op.resultado || '-'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm ${parseFloat(op.lucro) >= 0 ? 'text-green-600' : 'text-red-600'}">${formatCurrency(op.lucro)}</td>
            `;
            
            operationsHistoryTable.appendChild(row);
        }
    });
}

// Função para adicionar mensagem ao chat
function addMessageToChat(username, message) {
    const messageElement = document.createElement('div');
    messageElement.className = 'chat-message bg-blue-50 p-3 rounded-lg';
    messageElement.innerHTML = `
        <p class="font-bold text-blue-800">${username}</p>
        <p class="text-gray-700">${message}</p>
    `;
    
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Event Listeners
initialCapitalInput.addEventListener('input', () => {
    if (initialCapitalInput.value) {
        updateSpreadsheet('capital_inicial', initialCapitalInput.value);
    }
});

totalOperationsInput.addEventListener('input', () => {
    if (totalOperationsInput.value) {
        updateSpreadsheet('total_operacoes', totalOperationsInput.value);
    }
});

winOperationsInput.addEventListener('input', () => {
    if (winOperationsInput.value) {
        updateSpreadsheet('operacoes_ganho', winOperationsInput.value);
    }
});

payoutInput.addEventListener('input', () => {
    if (payoutInput.value) {
        updateSpreadsheet('payout_fixo', payoutInput.value);
    }
});

winBtn.addEventListener('click', registerWin);
lossBtn.addEventListener('click', registerLoss);
resetBtn.addEventListener('click', resetData);

sendBtn.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    const message = messageInput.value.trim();
    
    if (username && message) {
        addMessageToChat(username, message);
        messageInput.value = '';
    }
});

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const username = usernameInput.value.trim();
        const message = messageInput.value.trim();
        
        if (username && message) {
            addMessageToChat(username, message);
            messageInput.value = '';
        }
    }
});

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    // Verificar status do servidor
    const serverOnline = await checkServerStatus();
    
    if (!serverOnline) {
        showError('Não foi possível conectar ao servidor. Verifique se o backend está em execução.');
    }
    
    // Buscar dados iniciais
    await fetchData();
    
    // Configurar atualização periódica dos dados (a cada 5 segundos)
    setInterval(fetchData, 5000);
    
    // Adicionar mensagens iniciais ao chat
    addMessageToChat('Admin', 'Bem-vindo ao chat! Envie suas dúvidas aqui.');
    addMessageToChat('Suporte', 'Estamos online para ajudar.');
});
