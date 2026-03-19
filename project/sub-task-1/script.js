let allTodos = [];
let filteredTodos = [];
let editingId = null;
let sortField = 'date';
let sortDir = 'desc';

const fetchTodoList = async () => {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/todos?_limit=20');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
    }
};

const randomDate = () => {
    const start = new Date(2025, 0, 1);
    const end   = new Date(2025, 6, 1);
    const d = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
};

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
};

const renderTable = (bodyId, todos) => {
    const tbody = document.getElementById(bodyId);
    tbody.innerHTML = '';

    todos.forEach(todo => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="col-check">
                <input type="checkbox" data-id="${todo.id}" ${todo.completed ? 'checked' : ''}>
            </td>
            <td class="col-edit-icon">
                <button class="edit-icon-btn" data-id="${todo.id}" title="Edit">&#9998;</button>
            </td>
            <td class="col-name">
                <span class="todo-title ${todo.completed ? 'completed' : ''}">${todo.title}</span>
            </td>
            <td class="col-date">${todo.createdAt}</td>
            <td class="col-delete">
                <button class="delete-btn" data-id="${todo.id}" title="Delete">&#128465;</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    tbody.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', (e) => {
            const id = parseInt(e.target.dataset.id);
            const todo = allTodos.find(t => t.id === id);
            if (todo) todo.completed = e.target.checked;
            applyFilter();
        });
    });

    tbody.querySelectorAll('.edit-icon-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.currentTarget.dataset.id);
            openEditPanel(id);
        });
    });

    tbody.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.currentTarget.dataset.id);
            allTodos = allTodos.filter(t => t.id !== id);
            applyFilter();
        });
    });
};

const applyFilter = (minDate, maxDate) => {
    let result = [...allTodos];

    if (minDate) {
        result = result.filter(t => new Date(t.createdAt) >= new Date(minDate));
    }
    if (maxDate) {
        result = result.filter(t => new Date(t.createdAt) <= new Date(maxDate));
    }

    result.sort((a, b) => {
        if (sortField === 'date') {
            const da = new Date(a.createdAt), db = new Date(b.createdAt);
            return sortDir === 'asc' ? da - db : db - da;
        } else {
            return sortDir === 'asc'
                ? a.title.localeCompare(b.title)
                : b.title.localeCompare(a.title);
        }
    });

    filteredTodos = result;
    renderTable('todoBody', filteredTodos);
    renderTable('mTodoBody', filteredTodos);
};

const openEditPanel = (id) => {
    editingId = id;
    const todo = allTodos.find(t => t.id === id);
    if (!todo) return;
    document.getElementById('editTextarea').value = todo.title;
    document.getElementById('editPanel').classList.add('open');
    document.getElementById('mainWrapper').classList.add('dimmed');
};

const closeEditPanel = () => {
    document.getElementById('editPanel').classList.remove('open');
    document.getElementById('mainWrapper').classList.remove('dimmed');
    editingId = null;
};

document.getElementById('closeEditBtn').addEventListener('click', closeEditPanel);

document.getElementById('saveBtn').addEventListener('click', () => {
    if (editingId === null) return;
    const newTitle = document.getElementById('editTextarea').value.trim();
    const todo = allTodos.find(t => t.id === editingId);
    if (todo && newTitle) {
        todo.title = newTitle;
        applyFilter();
    }
    closeEditPanel();
});

document.getElementById('applyBtn').addEventListener('click', () => {
    const min = document.getElementById('dateMin').value;
    const max = document.getElementById('dateMax').value;
    applyFilter(min ? formatDate(min) : null, max ? formatDate(max) : null);
});

document.getElementById('resetBtn').addEventListener('click', () => {
    document.getElementById('dateMin').value = '';
    document.getElementById('dateMax').value = '';
    applyFilter();
});

document.getElementById('openFilterBtn').addEventListener('click', () => {
    document.getElementById('mobileFilterOverlay').classList.add('open');
});

document.getElementById('closeFilterBtn').addEventListener('click', () => {
    document.getElementById('mobileFilterOverlay').classList.remove('open');
});

document.getElementById('mApplyBtn').addEventListener('click', () => {
    const min = document.getElementById('mDateMin').value;
    const max = document.getElementById('mDateMax').value;
    applyFilter(min ? formatDate(min) : null, max ? formatDate(max) : null);
    document.getElementById('mobileFilterOverlay').classList.remove('open');
});

document.getElementById('mResetBtn').addEventListener('click', () => {
    document.getElementById('mDateMin').value = '';
    document.getElementById('mDateMax').value = '';
    applyFilter();
});

document.getElementById('sortName').addEventListener('click', () => {
    if (sortField === 'name') sortDir = sortDir === 'asc' ? 'desc' : 'asc';
    else { sortField = 'name'; sortDir = 'asc'; }
    applyFilter();
});

document.getElementById('sortDate').addEventListener('click', () => {
    if (sortField === 'date') sortDir = sortDir === 'asc' ? 'desc' : 'asc';
    else { sortField = 'date'; sortDir = 'desc'; }
    applyFilter();
});

fetchTodoList().then(todos => {
    allTodos = todos.map(todo => ({
        ...todo,
        createdAt: randomDate()
    }));
    applyFilter();
});