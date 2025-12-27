const API_URL = '/api/todos';

let currentFilter = 'all';
let allTodos = [];

// DOM Elements
const todoForm = document.getElementById('todoForm');
const todoTitle = document.getElementById('todoTitle');
const todoDescription = document.getElementById('todoDescription');
const todoList = document.getElementById('todoList');
const searchInput = document.getElementById('searchInput');
const filterBtns = document.querySelectorAll('.tab-btn');

// Event Listeners
todoForm.addEventListener('submit', handleAddTodo);
searchInput.addEventListener('input', handleSearch);
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => handleFilterChange(btn.dataset.filter));
});

// Initialize
loadTodos();

// Functions
async function loadTodos() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error('Failed to load todos');
        }
        allTodos = await response.json();
        renderTodos();
        updateStats();
    } catch (error) {
        console.error('Error loading todos:', error);
        showError('Failed to load todos. Please refresh the page.');
    }
}

async function handleAddTodo(e) {
    e.preventDefault();

    const newTodo = {
        title: todoTitle.value.trim(),
        description: todoDescription.value.trim(),
        completed: false
    };

    if (!newTodo.title) {
        return;
    }

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTodo)
        });

        if (response.ok) {
            todoTitle.value = '';
            todoDescription.value = '';
            await loadTodos();
        } else {
            throw new Error('Failed to create todo');
        }
    } catch (error) {
        console.error('Error adding todo:', error);
        showError('Failed to add todo. Please try again.');
    }
}

async function toggleTodo(id) {
    try {
        const response = await fetch(`${API_URL}/${id}/toggle`, {
            method: 'PATCH'
        });

        if (response.ok) {
            await loadTodos();
        } else {
            throw new Error('Failed to toggle todo');
        }
    } catch (error) {
        console.error('Error toggling todo:', error);
        showError('Failed to update todo. Please try again.');
    }
}

async function deleteTodo(id) {
    if (!confirm('Are you sure you want to delete this todo?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            await loadTodos();
        } else {
            throw new Error('Failed to delete todo');
        }
    } catch (error) {
        console.error('Error deleting todo:', error);
        showError('Failed to delete todo. Please try again.');
    }
}

function handleFilterChange(filter) {
    currentFilter = filter;

    filterBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });

    renderTodos();
}

function handleSearch() {
    renderTodos();
}

function renderTodos() {
    let filteredTodos = [...allTodos];

    // Apply filter
    if (currentFilter === 'active') {
        filteredTodos = filteredTodos.filter(todo => !todo.completed);
    } else if (currentFilter === 'completed') {
        filteredTodos = filteredTodos.filter(todo => todo.completed);
    }

    // Apply search
    const searchTerm = searchInput.value.toLowerCase().trim();
    if (searchTerm) {
        filteredTodos = filteredTodos.filter(todo =>
            todo.title.toLowerCase().includes(searchTerm) ||
            (todo.description && todo.description.toLowerCase().includes(searchTerm))
        );
    }

    // Render
    if (filteredTodos.length === 0) {
        todoList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📝</div>
                <p>${searchTerm ? 'No todos found matching your search' : 'No todos yet. Add one to get started!'}</p>
            </div>
        `;
        return;
    }

    todoList.innerHTML = filteredTodos.map(todo => `
        <div class="todo-item ${todo.completed ? 'completed' : ''}">
            <div class="todo-header">
                <input 
                    type="checkbox" 
                    class="checkbox" 
                    ${todo.completed ? 'checked' : ''}
                    onchange="toggleTodo(${todo.id})"
                    aria-label="Mark as ${todo.completed ? 'incomplete' : 'complete'}"
                >
                <div class="todo-content">
                    <div class="todo-title">${escapeHtml(todo.title)}</div>
                    ${todo.description ? `<div class="todo-description">${escapeHtml(todo.description)}</div>` : ''}
                </div>
                <div class="todo-actions">
                    <button 
                        class="btn-icon-only" 
                        onclick="deleteTodo(${todo.id})" 
                        title="Delete todo"
                        aria-label="Delete todo"
                    >
                        🗑️
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function updateStats() {
    const total = allTodos.length;
    const active = allTodos.filter(t => !t.completed).length;
    const completed = allTodos.filter(t => t.completed).length;

    document.getElementById('totalCount').textContent = `${total} total`;
    document.getElementById('activeCount').textContent = `${active} active`;
    document.getElementById('completedCount').textContent = `${completed} completed`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showError(message) {
    // Simple error display - could be enhanced with a toast notification
    alert(message);
}
