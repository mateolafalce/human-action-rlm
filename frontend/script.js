// ============================================
// Configuration
// ============================================
const API_BASE_URL = window.location.origin;
const API_ENDPOINTS = {
    query: `${API_BASE_URL}/api/query`,
    health: `${API_BASE_URL}/api/health`
};

// ============================================
// DOM Elements
// ============================================
const elements = {
    queryInput: document.getElementById('queryInput'),
    submitBtn: document.getElementById('submitBtn'),
    clearBtn: document.getElementById('clearBtn'),
    loadingSection: document.getElementById('loadingSection'),
    resultSection: document.getElementById('resultSection'),
    errorSection: document.getElementById('errorSection'),
    resultText: document.getElementById('resultText'),
    queryDisplay: document.getElementById('queryDisplay'),
    errorText: document.getElementById('errorText'),
    newQueryBtn: document.getElementById('newQueryBtn'),
    retryBtn: document.getElementById('retryBtn'),
    copyBtn: document.getElementById('copyBtn'),
    statusIndicator: document.getElementById('statusIndicator'),
    exampleChips: document.querySelectorAll('.example-chip')
};

// ============================================
// State Management
// ============================================
let currentQuery = '';
let isProcessing = false;

// ============================================
// Initialization
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    checkServerHealth();

    // Auto-focus en el input
    elements.queryInput.focus();
});

// ============================================
// Event Listeners
// ============================================
function initializeEventListeners() {
    // Submit button
    elements.submitBtn.addEventListener('click', handleSubmit);

    // Clear button
    elements.clearBtn.addEventListener('click', handleClear);

    // New query button
    elements.newQueryBtn.addEventListener('click', handleNewQuery);

    // Retry button
    elements.retryBtn.addEventListener('click', handleRetry);

    // Copy button
    elements.copyBtn.addEventListener('click', handleCopy);

    // Enter key to submit (Ctrl+Enter en textarea)
    elements.queryInput.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            handleSubmit();
        }
    });

    // Example chips
    elements.exampleChips.forEach(chip => {
        chip.addEventListener('click', () => {
            const query = chip.getAttribute('data-query');
            elements.queryInput.value = query;
            elements.queryInput.focus();

            // Añadir feedback visual
            chip.style.transform = 'scale(0.95)';
            setTimeout(() => {
                chip.style.transform = '';
            }, 200);
        });
    });
}

// ============================================
// Server Health Check
// ============================================
async function checkServerHealth() {
    try {
        const response = await fetch(API_ENDPOINTS.health);
        const data = await response.json();

        if (data.status === 'ok') {
            updateServerStatus(true);
        } else {
            updateServerStatus(false);
        }
    } catch (error) {
        console.error('Error checking server health:', error);
        updateServerStatus(false);
    }
}

function updateServerStatus(isOnline) {
    const statusDot = elements.statusIndicator.querySelector('.status-dot');
    const statusText = elements.statusIndicator.querySelector('.status-text');

    if (isOnline) {
        statusDot.style.background = '#4facfe';
        statusText.textContent = 'Conectado';
        elements.statusIndicator.style.background = 'rgba(79, 172, 254, 0.1)';
        elements.statusIndicator.style.borderColor = 'rgba(79, 172, 254, 0.3)';
    } else {
        statusDot.style.background = '#f5576c';
        statusText.textContent = 'Desconectado';
        elements.statusIndicator.style.background = 'rgba(245, 87, 108, 0.1)';
        elements.statusIndicator.style.borderColor = 'rgba(245, 87, 108, 0.3)';
    }
}

// ============================================
// Query Handling
// ============================================
async function handleSubmit() {
    const query = elements.queryInput.value.trim();

    // Validaciones
    if (!query) {
        showError('Por favor, ingresa una consulta');
        return;
    }

    if (isProcessing) {
        return;
    }

    // Guardar query actual
    currentQuery = query;

    // Cambiar estado
    isProcessing = true;

    // Actualizar UI
    showLoading();
    disableInput();

    try {
        const response = await fetch(API_ENDPOINTS.query, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Error al procesar la consulta');
        }

        if (data.success) {
            showResult(data.result, data.query);
        } else {
            throw new Error(data.error || 'Error desconocido');
        }

    } catch (error) {
        console.error('Error:', error);
        showError(error.message);
    } finally {
        isProcessing = false;
        enableInput();
    }
}

function handleClear() {
    elements.queryInput.value = '';
    elements.queryInput.focus();

    // Animación de feedback
    elements.clearBtn.style.transform = 'scale(0.9) rotate(90deg)';
    setTimeout(() => {
        elements.clearBtn.style.transform = '';
    }, 200);
}

function handleNewQuery() {
    hideResult();
    elements.queryInput.value = '';
    elements.queryInput.focus();
}

function handleRetry() {
    hideError();
    if (currentQuery) {
        elements.queryInput.value = currentQuery;
        handleSubmit();
    }
}

async function handleCopy() {
    const text = elements.resultText.textContent;

    try {
        await navigator.clipboard.writeText(text);

        // Feedback visual
        const originalText = elements.copyBtn.querySelector('.btn-text').textContent;
        elements.copyBtn.querySelector('.btn-text').textContent = '¡Copiado!';
        elements.copyBtn.style.background = 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
        elements.copyBtn.style.borderColor = 'transparent';
        elements.copyBtn.style.color = 'white';

        setTimeout(() => {
            elements.copyBtn.querySelector('.btn-text').textContent = originalText;
            elements.copyBtn.style.background = '';
            elements.copyBtn.style.borderColor = '';
            elements.copyBtn.style.color = '';
        }, 2000);

    } catch (error) {
        console.error('Error al copiar:', error);
        showError('No se pudo copiar al portapapeles');
    }
}

// ============================================
// UI State Management
// ============================================
function showLoading() {
    hideAllSections();
    elements.loadingSection.classList.remove('hidden');
}

function showResult(result, query) {
    hideAllSections();
    elements.queryDisplay.textContent = query;
    elements.resultText.textContent = result;
    elements.resultSection.classList.remove('hidden');

    // Scroll suave al resultado
    setTimeout(() => {
        elements.resultSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }, 100);
}

function showError(message) {
    hideAllSections();
    elements.errorText.textContent = message;
    elements.errorSection.classList.remove('hidden');

    // Scroll suave al error
    setTimeout(() => {
        elements.errorSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }, 100);
}

function hideResult() {
    elements.resultSection.classList.add('hidden');
}

function hideError() {
    elements.errorSection.classList.add('hidden');
}

function hideLoading() {
    elements.loadingSection.classList.add('hidden');
}

function hideAllSections() {
    hideLoading();
    hideResult();
    hideError();
}

function disableInput() {
    elements.queryInput.disabled = true;
    elements.submitBtn.disabled = true;
    elements.clearBtn.disabled = true;
    elements.exampleChips.forEach(chip => chip.disabled = true);
}

function enableInput() {
    elements.queryInput.disabled = false;
    elements.submitBtn.disabled = false;
    elements.clearBtn.disabled = false;
    elements.exampleChips.forEach(chip => chip.disabled = false);
}

// ============================================
// Utility Functions
// ============================================
function formatText(text) {
    // Formatear el texto si es necesario
    return text;
}

// ============================================
// Error Handling
// ============================================
window.addEventListener('error', (event) => {
    console.error('Error global:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Promesa rechazada:', event.reason);
});

// ============================================
// Auto-save (opcional)
// ============================================
// Guardar el query en localStorage mientras se escribe
elements.queryInput.addEventListener('input', () => {
    localStorage.setItem('lastQuery', elements.queryInput.value);
});

// Restaurar último query al cargar
const lastQuery = localStorage.getItem('lastQuery');
if (lastQuery) {
    elements.queryInput.value = lastQuery;
}
