
const API_BASE_URL = 'http://localhost:5000/api/library';
const PAGE_SIZE = 10;


let currentPage = 1;
let totalPages = 1;
let currentQuery = '';
let editingBookId = null;
let xmlEditor = null;


const booksBody = document.getElementById('booksBody');
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const clearBtn = document.getElementById('clearBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const pageNumbersEl = document.getElementById('pageNumbers');
const bookModal = document.getElementById('bookModal');
const bookForm = document.getElementById('bookForm');
const modalTitle = document.getElementById('modalTitle');
const submitBtn = document.getElementById('submitBtn');
const addBookBtn = document.getElementById('addBookBtn');
const tableOfContentsEl = document.getElementById('tableOfContents');
const xmlStatus = document.getElementById('xmlStatus');


document.addEventListener('DOMContentLoaded', () => {
    fetchBooks();
    
    
    searchBtn.addEventListener('click', handleSearch);
    clearBtn.addEventListener('click', clearSearch);
    prevBtn.addEventListener('click', () => goToPage(currentPage - 1));
    nextBtn.addEventListener('click', () => goToPage(currentPage + 1));
    addBookBtn.addEventListener('click', () => openCreateModal());
    
    
    bookForm.addEventListener('submit', handleFormSubmit);
    
    
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    
});


async function fetchBooks() {
    showLoading(true);
    hideError();
    
    try {
        let url = `${API_BASE_URL}/book/page=${currentPage}&pageSize=${PAGE_SIZE}`;
        
        if (currentQuery) {
            url = `${API_BASE_URL}/book/query=${encodeURIComponent(currentQuery)}&page=${currentPage}&pageSize=${PAGE_SIZE}`;
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        
        const books = Array.isArray(data) ? data : [];
        totalPages = Math.ceil(books.length / PAGE_SIZE) || 1;
        
        renderBooks(books);
        renderPagination();
        
    } catch (error) {
        showError(`Failed to load books: ${error.message}`);
        console.error('Error fetching books:', error);
    } finally {
        showLoading(false);
    }
}


function renderBooks(books) {
    if (!books || books.length === 0) {
        booksBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 2rem; color: #7f8c8d;">
                    No books found.
                </td>
            </tr>
        `;
        return;
    }
    
    booksBody.innerHTML = books.map(book => `
        <tr>
            <td>${escapeHtml(book.id)}</td>
            <td>${escapeHtml(book.title)}</td>
            <td>${escapeHtml(book.author)}</td>
            <td>${escapeHtml(book.publishingYear)}</td>
            <td class="actions">
                <button class="action-btn edit-btn" onclick="openEditModal('${book.id}')">Edit</button>
                <button class="action-btn delete-btn" onclick="deleteBook('${book.id}')">Delete</button>
            </td>
        </tr>
    `).join('');
}


function renderPagination() {
    prevBtn.disabled = currentPage <= 1;
    nextBtn.disabled = currentPage >= totalPages;
    
    
    let pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }
    
    pageNumbersEl.innerHTML = pages.map(page => `
        <button class="page-number ${page === currentPage ? 'active' : ''}" onclick="goToPage(${page})">
            ${page}
        </button>
    `).join('');
}


function goToPage(page) {
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    fetchBooks();
}


function handleSearch() {
    const query = searchInput.value.trim();
    currentQuery = query;
    currentPage = 1; 
    fetchBooks();
}


function clearSearch() {
    searchInput.value = '';
    currentQuery = '';
    currentPage = 1;
    fetchBooks();
}

function showLoading(show) {
    loadingEl.classList.toggle('hidden', !show);
    booksBody.style.opacity = show ? '0.5' : '1';
}


function showError(message) {
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
}

function hideError() {
    errorEl.classList.add('hidden');
}


function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    toastMessage.textContent = message;
    toast.className = 'toast ' + (isError ? 'error' : '');
    toast.classList.remove('hidden');
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}


function openCreateModal() {
    editingBookId = null;
    modalTitle.textContent = 'Add New Book';
    submitBtn.textContent = 'Create Book';
    bookForm.reset();
    clearXMLStatus();

    bookModal.classList.add('open');
    setTimeout(() => initEditor(''), 0);
}

function openEditModal(id) {
    editingBookId = id;
    modalTitle.textContent = 'Edit Book';
    submitBtn.textContent = 'Save Changes';
    
    fetch(`${API_BASE_URL}/book/${id}`)
        .then(response => response.json())
        .then(book => {
            document.getElementById('bookId').value = book.id;
            document.getElementById('title').value = book.title;
            document.getElementById('author').value = book.author;
            document.getElementById('publishingYear').value = book.publishingYear;
            document.getElementById('tableOfContents').value = book.tableOfContents || '';
            document.getElementById('notes').value = book.notes || '';
            
            bookModal.classList.add('open');
            setTimeout(() => {
                initEditor(book.tableOfContents || '');
                formatXML();
                validateXML();
            }, 0);
        })
        .catch(error => {
            showToast('Failed to load book data', true);
            console.error('Error fetching book:', error);
        });
    //
}

function closeModal() {
    bookModal.classList.remove('open');
    editingBookId = null;
}


function initEditor(content) {
    const textarea = document.getElementById('tableOfContents');
    
    if (xmlEditor) {
        xmlEditor.toTextArea();
        xmlEditor = null;
    }
    
    xmlEditor = CodeMirror.fromTextArea(textarea, {
        mode: 'xml',
        theme: 'material-darker',
        lineNumbers: true,
        lineWrapping: true,
        indentUnit: 2,
        matchBrackets: true,
        autoCloseTags: true,
        autoCloseBrackets: true,
        extraKeys: {"Enter": "newlineAndIndentContinueComment"}
    });
    
    xmlEditor.setValue(content);
    
    xmlEditor.refresh();
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    const title = document.getElementById('title').value.trim();
    const author = document.getElementById('author').value.trim();
    const publishingYear = document.getElementById('publishingYear').value.trim();
    const tableOfContents = xmlEditor ? xmlEditor.getValue().trim() : '';
    const notes = document.getElementById('notes').value.trim();
    
    if (!title || !author) {
        showToast('Title and Author are required', true);
        return;
    }
    
    if (tableOfContents && !validateXMLString(tableOfContents)) {
        showToast('Invalid XML format in Table of Contents', true);
        return;
    }
    
    const bookData = {
        id: editingBookId,
        title,
        author,
        publishingYear,
        tableOfContents,
        notes
    };
    
    try {
        let response;
        if (editingBookId) {
            
            response = await fetch(`${API_BASE_URL}/book`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bookData)
            });
        } else {
            
            response = await fetch(`${API_BASE_URL}/book`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bookData)
            });
        }
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        showToast(editingBookId ? 'Book updated successfully!' : 'Book created successfully!');
        closeModal();
        fetchBooks();
        
    } catch (error) {
        showToast(`Failed to save book: ${error.message}`, true);
        console.error('Error saving book:', error);
    }
}

function formatXML() {
    if (!xmlEditor) return;
    
    const xml = xmlEditor.getValue().trim();
    if (!xml) return;
    
    try {
        const formatted = formatXMLString(xml);
        xmlEditor.setValue(formatted);
        showToast('XML formatted successfully');
    } catch (error) {
        showToast('Failed to format XML: ' + error.message, true);
    }
}

function validateXML() {
    if (!xmlEditor) return;
    
    const xml = xmlEditor.getValue().trim();
    if (!xml) {
        clearXMLStatus();
        return;
    }
    
    const isValid = validateXMLString(xml);
    if (isValid) {
        xmlStatus.textContent = 'Valid XML';
        xmlStatus.className = 'xml-status valid';
    } else {
        xmlStatus.textContent = 'Invalid XML';
        xmlStatus.className = 'xml-status invalid';
    }
}

function clearXML() {
    if (xmlEditor) {
        xmlEditor.setValue('');
    }
    clearXMLStatus();
}

function clearXMLStatus() {
    xmlStatus.textContent = '';
    xmlStatus.className = 'xml-status';
}



function validateXMLString(xml) {
    try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xml, 'text/xml');
        const parseError = xmlDoc.querySelector('parsererror');
        return !parseError;
    } catch (e) {
        return false;
    }
}

function formatXMLString(xml) {
    let formatted = '';
    let indent = '';
    const tab = '  ';
    
    xml = xml.replace(/\s+/g, ' ').trim();
    
    const tokens = xml.match(/(<[^>]+>)|([^<]+)/g) || [];
    
    for (const token of tokens) {
        if (token.startsWith('</')) {
            indent = indent.substring(tab.length);
            formatted += indent + token + '\n';
        } else if (token.startsWith('<') && !token.startsWith('<!') && !token.startsWith('<?')) {
            const tagName = token.match(/<(\w+)/)?.[1];
            if (tagName && !token.endsWith('/>')) {
                formatted += indent + token + '\n';
                indent += tab;
            } else {
                formatted += indent + token + '\n';
            }
        } else {
            if (token.trim()) {
                formatted += indent + token.trim() + '\n';
            }
        }
    }
    
    return formatted.trim();
}

function highlightXML(xml) {
    return xml
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/(&lt;\/?)(\w+)(.*?)(&gt;)/g, 
            '<span class="xml-tag">$1$2</span>$3<span class="xml-tag">$4</span>')
        .replace(/(\w+)=(&quot;[^&]*&quot;|"[^"]*"|'[^']*')/g, 
            '<span class="xml-attr-name">$1</span>=<span class="xml-attr-value">$2</span>');
}


window.deleteBook = async function(id) {
    if (!confirm('Are you sure you want to delete this book?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/book/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showToast('Book deleted successfully!');
            fetchBooks();
        } else {
            showToast('Failed to delete book.', true);
        }
    } catch (error) {
        showToast('Error deleting book: ' + error.message, true);
    }
};

function handleTabKey(e) {
    if (e.key === 'Tab') {
        e.preventDefault();
        const start = this.selectionStart;
        const end = this.selectionEnd;
        this.value = this.value.substring(0, start) + '  ' + this.value.substring(end);
        this.selectionStart = this.selectionEnd = start + 2;
    }
}

function validateXMLString(xml) {
    try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xml, 'text/xml');
        const parseError = xmlDoc.querySelector('parsererror');
        return !parseError;
    } catch (e) {
        return false;
    }
}

function formatXMLString(xml) {
    let formatted = '';
    let indent = '';
    const tab = '  ';
    
    xml = xml.replace(/\s+/g, ' ').trim();
    
    const tokens = xml.match(/(<[^>]+>)|([^<]+)/g) || [];
    
    for (const token of tokens) {
        if (token.startsWith('</')) {
            indent = indent.substring(tab.length);
            formatted += indent + token + '\n';
        } else if (token.startsWith('<') && !token.startsWith('<!') && !token.startsWith('<?')) {
            const tagName = token.match(/<(\w+)/)?.[1];
            if (tagName && !token.endsWith('/>')) {
                formatted += indent + token + '\n';
                indent += tab;
            } else {
                formatted += indent + token + '\n';
            }
        } else {
            if (token.trim()) {
                formatted += indent + token.trim() + '\n';
            }
        }
    }
    
    return formatted.trim();
}

function highlightXML(xml) {
    return xml
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/(&lt;\/?)(\w+)(.*?)(&gt;)/g, 
            '<span class="xml-tag">$1$2</span>$3<span class="xml-tag">$4</span>')
        .replace(/(\w+)=(&quot;[^&]*&quot;|"[^"]*"|'[^']*')/g, 
            '<span class="xml-attr-name">$1</span>=<span class="xml-attr-value">$2</span>');
}

window.deleteBook = async function(id) {
    if (!confirm('Are you sure you want to delete this book?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/book/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showToast('Book deleted successfully!');
            fetchBooks();
        } else {
            showToast('Failed to delete book.', true);
        }
    } catch (error) {
        showToast('Error deleting book: ' + error.message, true);
    }
};

bookModal.addEventListener('click', (e) => {
    if (e.target === bookModal) {
        closeModal();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !bookModal.classList.contains('open')) {
        closeModal();
    }
});
