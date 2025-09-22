/**
 * Campus Lost & Found Application
 * A complete client-side web application for managing lost and found items
 */

// =============================================================================
// CONSTANTS AND CONFIGURATION
// =============================================================================

const CONFIG = {
    STORAGE_KEY: 'lf_items',
    SETTINGS_KEY: 'lf_settings',
    ADMIN_PASSCODE: 'admin123',
    IMAGE_MAX_SIZE: 1024, // pixels
    IMAGE_QUALITY: 0.7,
    IMAGE_MAX_FILE_SIZE: 1024 * 1024, // 1MB
    TOAST_DURATION: 4000
};

const CATEGORIES = [
    { value: 'bag', label: 'Bag' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'id_card', label: 'ID Card' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'stationery', label: 'Stationery' },
    { value: 'others', label: 'Others' }
];

const SAMPLE_ITEMS = [
    {
        id: "550e8400-e29b-41d4-a716-446655440001",
        title: "Black Leather Wallet",
        description: "Lost my black leather wallet near the library. Contains student ID and some cash.",
        category: "others",
        status: "lost",
        location: "Main Library, 2nd Floor",
        date: "2024-03-15",
        reporterName: "John Doe",
        reporterEmail: "john.doe@university.edu",
        reporterPhone: "555-0123",
        imageBase64: "",
        isApproved: true,
        isClaimed: false,
        createdAt: "2024-03-15T10:30:00Z",
        updatedAt: "2024-03-15T10:30:00Z",
        messages: []
    },
    {
        id: "550e8400-e29b-41d4-a716-446655440002",
        title: "iPhone 13 Pro",
        description: "Found iPhone 13 Pro in blue case near the cafeteria. Screen has a small crack.",
        category: "electronics",
        status: "found",
        location: "Student Cafeteria",
        date: "2024-03-14",
        reporterName: "Sarah Wilson",
        reporterEmail: "sarah.w@university.edu",
        reporterPhone: "",
        imageBase64: "",
        isApproved: true,
        isClaimed: false,
        createdAt: "2024-03-14T15:20:00Z",
        updatedAt: "2024-03-14T15:20:00Z",
        messages: [
            {
                messageId: "msg-001",
                senderName: "Mike Johnson",
                senderEmail: "mike.j@university.edu",
                text: "I think this might be mine! I lost my phone yesterday around that area.",
                timestamp: "2024-03-14T16:30:00Z"
            }
        ]
    },
    {
        id: "550e8400-e29b-41d4-a716-446655440003",
        title: "Red Backpack",
        description: "Lost my red Jansport backpack containing textbooks and laptop charger.",
        category: "bag",
        status: "lost",
        location: "Engineering Building",
        date: "2024-03-13",
        reporterName: "Emma Davis",
        reporterEmail: "emma.davis@university.edu",
        reporterPhone: "555-0456",
        imageBase64: "",
        isApproved: true,
        isClaimed: true,
        createdAt: "2024-03-13T09:15:00Z",
        updatedAt: "2024-03-13T09:15:00Z",
        messages: [],
        claimedBy: "Emma Davis"
    },
    {
        id: "550e8400-e29b-41d4-a716-446655440004",
        title: "Blue Hoodie",
        description: "Found blue university hoodie (size L) left in lecture hall.",
        category: "clothing",
        status: "found",
        location: "Science Building, Room 101",
        date: "2024-03-12",
        reporterName: "Alex Chen",
        reporterEmail: "",
        reporterPhone: "555-0789",
        imageBase64: "",
        isApproved: true,
        isClaimed: false,
        createdAt: "2024-03-12T14:45:00Z",
        updatedAt: "2024-03-12T14:45:00Z",
        messages: []
    },
    {
        id: "550e8400-e29b-41d4-a716-446655440005",
        title: "Student ID Card",
        description: "Lost my student ID card somewhere on campus. Name: Lisa Park, Student #: 2024001.",
        category: "id_card",
        status: "lost",
        location: "Campus Center",
        date: "2024-03-11",
        reporterName: "Lisa Park",
        reporterEmail: "lisa.park@university.edu",
        reporterPhone: "",
        imageBase64: "",
        isApproved: false,
        isClaimed: false,
        createdAt: "2024-03-11T11:20:00Z",
        updatedAt: "2024-03-11T11:20:00Z",
        messages: []
    },
    {
        id: "550e8400-e29b-41d4-a716-446655440006",
        title: "Graphing Calculator",
        description: "Found TI-84 Plus calculator in mathematics building. Has initials 'R.M.' on back.",
        category: "stationery",
        status: "found",
        location: "Mathematics Building, Room 205",
        date: "2024-03-10",
        reporterName: "David Kim",
        reporterEmail: "david.kim@university.edu",
        reporterPhone: "555-0321",
        imageBase64: "",
        isApproved: true,
        isClaimed: false,
        createdAt: "2024-03-10T13:10:00Z",
        updatedAt: "2024-03-10T13:10:00Z",
        messages: []
    }
];

// =============================================================================
// GLOBAL STATE
// =============================================================================

let currentView = 'home';
let currentItem = null;
let adminLoggedIn = false;
let isGridView = true;
let currentFilters = {
    search: '',
    category: '',
    status: '',
    sort: 'newest'
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Generate a UUID v4
 */
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Sanitize user input to prevent XSS
 */
function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;')
        .trim();
}

/**
 * Format date for display
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

/**
 * Format relative time
 */
function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
}

/**
 * Get category label from value
 */
function getCategoryLabel(value) {
    const category = CATEGORIES.find(cat => cat.value === value);
    return category ? category.label : value;
}

/**
 * Debounce function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// =============================================================================
// DATA STORAGE FUNCTIONS
// =============================================================================

/**
 * Get all items from localStorage
 */
function getAllItems() {
    try {
        const items = localStorage.getItem(CONFIG.STORAGE_KEY);
        return items ? JSON.parse(items) : [];
    } catch (error) {
        console.error('Error loading items:', error);
        return [];
    }
}

/**
 * Save items to localStorage
 */
function saveItems(items) {
    try {
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(items));
        return true;
    } catch (error) {
        console.error('Error saving items:', error);
        showToast('Error saving data. Storage may be full.', 'error');
        return false;
    }
}

/**
 * Get item by ID
 */
function getItemById(id) {
    const items = getAllItems();
    return items.find(item => item.id === id);
}

/**
 * Add new item
 */
function addItem(item) {
    const items = getAllItems();
    const newItem = {
        ...item,
        id: generateUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [],
        isApproved: !getSettings().requireApproval,
        isClaimed: false
    };
    items.push(newItem);
    saveItems(items);
    return newItem;
}

/**
 * Update existing item
 */
function updateItem(id, updates) {
    const items = getAllItems();
    const index = items.findIndex(item => item.id === id);
    if (index !== -1) {
        items[index] = {
            ...items[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        saveItems(items);
        return items[index];
    }
    return null;
}

/**
 * Delete item
 */
function deleteItem(id) {
    const items = getAllItems();
    const filteredItems = items.filter(item => item.id !== id);
    return saveItems(filteredItems);
}

/**
 * Get settings from localStorage
 */
function getSettings() {
    try {
        const settings = localStorage.getItem(CONFIG.SETTINGS_KEY);
        return settings ? JSON.parse(settings) : {
            requireApproval: false,
            emailEnabled: false
        };
    } catch (error) {
        console.error('Error loading settings:', error);
        return { requireApproval: false, emailEnabled: false };
    }
}

/**
 * Save settings to localStorage
 */
function saveSettings(settings) {
    try {
        localStorage.setItem(CONFIG.SETTINGS_KEY, JSON.stringify(settings));
        return true;
    } catch (error) {
        console.error('Error saving settings:', error);
        return false;
    }
}

/**
 * Initialize data with sample items if empty
 */
function initializeData() {
    const items = getAllItems();
    if (items.length === 0) {
        saveItems(SAMPLE_ITEMS);
    }
    
    // Ensure settings exist
    const settings = getSettings();
    saveSettings(settings);
}

// =============================================================================
// UI HELPER FUNCTIONS
// =============================================================================

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.textContent = message;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');
    
    container.appendChild(toast);
    
    // Remove toast after duration
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, CONFIG.TOAST_DURATION);
}

/**
 * Show loading overlay
 */
function showLoading(show = true) {
    const overlay = document.getElementById('loading-overlay');
    overlay.classList.toggle('hidden', !show);
}

/**
 * Switch between views
 */
function showView(viewName, itemId = null) {
    // Hide all views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    
    // Show target view
    const targetView = document.getElementById(`${viewName}-view`);
    if (targetView) {
        targetView.classList.add('active');
        currentView = viewName;
        
        // Handle view-specific logic
        if (viewName === 'details' && itemId) {
            showItemDetails(itemId);
        } else if (viewName === 'admin') {
            showAdminView();
        }
    }
}

/**
 * Show confirmation modal
 */
function showModal(title, message, onConfirm) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const confirmBtn = document.getElementById('modal-confirm');
    const cancelBtn = document.getElementById('modal-cancel');
    
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    modal.classList.remove('hidden');
    
    // Set up event listeners
    const cleanup = () => {
        modal.classList.add('hidden');
        confirmBtn.onclick = null;
        cancelBtn.onclick = null;
    };
    
    confirmBtn.onclick = () => {
        onConfirm();
        cleanup();
    };
    
    cancelBtn.onclick = cleanup;
    
    // Close on backdrop click
    modal.onclick = (e) => {
        if (e.target === modal) cleanup();
    };
}

// =============================================================================
// IMAGE HANDLING FUNCTIONS
// =============================================================================

/**
 * Compress and resize image
 */
function compressImage(file) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
            // Calculate new dimensions
            let { width, height } = img;
            const maxSize = CONFIG.IMAGE_MAX_SIZE;
            
            if (width > height) {
                if (width > maxSize) {
                    height *= maxSize / width;
                    width = maxSize;
                }
            } else {
                if (height > maxSize) {
                    width *= maxSize / height;
                    height = maxSize;
                }
            }
            
            // Set canvas size
            canvas.width = width;
            canvas.height = height;
            
            // Draw and compress
            ctx.drawImage(img, 0, 0, width, height);
            const compressedDataUrl = canvas.toDataURL('image/jpeg', CONFIG.IMAGE_QUALITY);
            resolve(compressedDataUrl);
        };
        
        img.onerror = () => resolve(null);
        img.src = URL.createObjectURL(file);
    });
}

/**
 * Handle image file selection
 */
async function handleImageUpload(file, previewElement) {
    if (!file) return null;
    
    // Check file size
    if (file.size > CONFIG.IMAGE_MAX_FILE_SIZE) {
        showToast('Image file too large. Please select a smaller image.', 'error');
        return null;
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
        showToast('Please select a valid image file.', 'error');
        return null;
    }
    
    try {
        showLoading(true);
        const compressedImage = await compressImage(file);
        
        if (compressedImage && previewElement) {
            const img = previewElement.querySelector('img');
            if (img) {
                img.src = compressedImage;
                previewElement.classList.remove('hidden');
            }
        }
        
        return compressedImage;
    } catch (error) {
        console.error('Error processing image:', error);
        showToast('Error processing image. Please try again.', 'error');
        return null;
    } finally {
        showLoading(false);
    }
}

// =============================================================================
// SEARCH AND FILTER FUNCTIONS
// =============================================================================

/**
 * Filter and sort items based on current filters
 */
function filterItems(items) {
    let filtered = [...items];
    
    // Text search
    if (currentFilters.search) {
        const searchTerm = currentFilters.search.toLowerCase();
        filtered = filtered.filter(item => 
            item.title.toLowerCase().includes(searchTerm) ||
            item.description.toLowerCase().includes(searchTerm)
        );
    }
    
    // Category filter
    if (currentFilters.category) {
        filtered = filtered.filter(item => item.category === currentFilters.category);
    }
    
    // Status filter
    if (currentFilters.status) {
        filtered = filtered.filter(item => item.status === currentFilters.status);
    }
    
    // Sort
    filtered.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        
        if (currentFilters.sort === 'oldest') {
            return dateA - dateB;
        } else {
            return dateB - dateA;
        }
    });
    
    return filtered;
}

/**
 * Update filters and refresh display
 */
function updateFilters() {
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    const statusFilter = document.getElementById('status-filter');
    const sortFilter = document.getElementById('sort-filter');
    
    currentFilters = {
        search: searchInput.value.trim(),
        category: categoryFilter.value,
        status: statusFilter.value,
        sort: sortFilter.value
    };
    
    renderItemsGrid();
}

// =============================================================================
// HOME VIEW FUNCTIONS
// =============================================================================

/**
 * Create item card HTML
 */
function createItemCard(item) {
    const categoryLabel = getCategoryLabel(item.category);
    const statusClass = item.status === 'lost' ? 'badge--lost' : 'badge--found';
    const claimedBadge = item.isClaimed ? '<span class="badge badge--claimed">Claimed</span>' : '';
    const pendingBadge = !item.isApproved ? '<span class="badge badge--pending">Pending</span>' : '';
    
    const imageHtml = item.imageBase64 
        ? `<img src="${item.imageBase64}" alt="${sanitizeInput(item.title)}" loading="lazy">`
        : '<span>No Image</span>';
    
    return `
        <div class="item-card" data-item-id="${item.id}" role="button" tabindex="0" aria-label="View details for ${sanitizeInput(item.title)}">
            <div class="item-image">
                ${imageHtml}
            </div>
            <div class="item-content">
                <h3 class="item-title">${sanitizeInput(item.title)}</h3>
                <div class="item-badges">
                    <span class="badge ${statusClass}">${item.status}</span>
                    <span class="badge badge--category">${categoryLabel}</span>
                    ${claimedBadge}
                    ${pendingBadge}
                </div>
                <div class="item-location">📍 ${sanitizeInput(item.location)}</div>
                <div class="item-date">📅 ${formatDate(item.date)}</div>
                <p class="item-description">${sanitizeInput(item.description).substring(0, 100)}${item.description.length > 100 ? '...' : ''}</p>
            </div>
        </div>
    `;
}

/**
 * Create skeleton loading card
 */
function createSkeletonCard() {
    return `
        <div class="skeleton-card">
            <div class="skeleton-image skeleton"></div>
            <div class="skeleton-content">
                <div class="skeleton-title skeleton"></div>
                <div class="skeleton-text skeleton"></div>
                <div class="skeleton-text skeleton"></div>
            </div>
        </div>
    `;
}

/**
 * Render items grid
 */
function renderItemsGrid() {
    const itemsGrid = document.getElementById('items-grid');
    const emptyState = document.getElementById('empty-state');
    
    // Show loading
    itemsGrid.innerHTML = Array(6).fill(createSkeletonCard()).join('');
    emptyState.classList.add('hidden');
    
    // Simulate loading delay
    setTimeout(() => {
        const allItems = getAllItems();
        const approvedItems = allItems.filter(item => item.isApproved);
        const filteredItems = filterItems(approvedItems);
        
        if (filteredItems.length === 0) {
            itemsGrid.innerHTML = '';
            emptyState.classList.remove('hidden');
        } else {
            itemsGrid.innerHTML = filteredItems.map(createItemCard).join('');
            emptyState.classList.add('hidden');
        }
        
        // Update grid view class
        itemsGrid.className = `items-grid ${isGridView ? '' : 'list-view'}`;
        
        // Add click listeners to cards
        itemsGrid.querySelectorAll('.item-card').forEach(card => {
            const itemId = card.dataset.itemId;
            card.addEventListener('click', () => showView('details', itemId));
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    showView('details', itemId);
                }
            });
        });
    }, 300);
}

/**
 * Initialize home view
 */
function initializeHomeView() {
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    const statusFilter = document.getElementById('status-filter');
    const sortFilter = document.getElementById('sort-filter');
    const viewToggle = document.getElementById('view-toggle');
    const reportBtn = document.getElementById('report-btn');
    const adminBtn = document.getElementById('admin-btn');
    
    // Set up debounced search
    const debouncedSearch = debounce(updateFilters, 300);
    searchInput.addEventListener('input', debouncedSearch);
    
    // Set up filter event listeners
    categoryFilter.addEventListener('change', updateFilters);
    statusFilter.addEventListener('change', updateFilters);
    sortFilter.addEventListener('change', updateFilters);
    
    // View toggle
    viewToggle.addEventListener('click', () => {
        isGridView = !isGridView;
        viewToggle.textContent = isGridView ? 'Grid' : 'List';
        renderItemsGrid();
    });
    
    // Navigation buttons
    reportBtn.addEventListener('click', () => showView('report'));
    adminBtn.addEventListener('click', () => showView('admin'));
    
    // Initial render
    renderItemsGrid();
}

// =============================================================================
// REPORT VIEW FUNCTIONS
// =============================================================================

/**
 * Initialize report form
 */
function initializeReportView() {
    const form = document.getElementById('report-form');
    const backBtn = document.getElementById('back-to-home');
    const imageInput = document.getElementById('item-image');
    const imagePreview = document.getElementById('image-preview');
    const removeImageBtn = document.getElementById('remove-image');
    const dateInput = document.getElementById('item-date');
    
    // Set default date to today
    dateInput.valueAsDate = new Date();
    
    // Back button
    backBtn.addEventListener('click', () => showView('home'));
    
    // Image upload
    let currentImageData = null;
    imageInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            currentImageData = await handleImageUpload(file, imagePreview);
        }
    });
    
    // Remove image
    removeImageBtn.addEventListener('click', () => {
        imageInput.value = '';
        imagePreview.classList.add('hidden');
        currentImageData = null;
    });
    
    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const itemData = {
            title: sanitizeInput(formData.get('item-title') || document.getElementById('item-title').value),
            description: sanitizeInput(formData.get('item-description') || document.getElementById('item-description').value),
            category: document.getElementById('item-category').value,
            status: formData.get('item-status'),
            location: sanitizeInput(document.getElementById('item-location').value),
            date: document.getElementById('item-date').value,
            reporterName: sanitizeInput(document.getElementById('reporter-name').value),
            reporterEmail: sanitizeInput(document.getElementById('reporter-email').value),
            reporterPhone: sanitizeInput(document.getElementById('reporter-phone').value),
            imageBase64: currentImageData || ''
        };
        
        // Validate required fields
        if (!itemData.title || !itemData.description || !itemData.category || 
            !itemData.status || !itemData.location || !itemData.date || !itemData.reporterName) {
            showToast('Please fill in all required fields.', 'error');
            return;
        }
        
        try {
            showLoading(true);
            const newItem = addItem(itemData);
            
            const settings = getSettings();
            if (settings.requireApproval) {
                showToast('Item submitted for approval. It will be visible once approved by an admin.', 'success');
            } else {
                showToast('Item reported successfully!', 'success');
            }
            
            // Reset form
            form.reset();
            imagePreview.classList.add('hidden');
            currentImageData = null;
            dateInput.valueAsDate = new Date();
            
            // Navigate to details or home
            setTimeout(() => {
                if (settings.requireApproval) {
                    showView('home');
                } else {
                    showView('details', newItem.id);
                }
            }, 1000);
            
        } catch (error) {
            console.error('Error submitting report:', error);
            showToast('Error submitting report. Please try again.', 'error');
        } finally {
            showLoading(false);
        }
    });
}

// =============================================================================
// DETAILS VIEW FUNCTIONS
// =============================================================================

/**
 * Show item details
 */
function showItemDetails(itemId) {
    const item = getItemById(itemId);
    
    if (!item) {
        showToast('Item not found.', 'error');
        showView('home');
        return;
    }
    
    currentItem = item;
    
    const detailsContainer = document.getElementById('item-details');
    const categoryLabel = getCategoryLabel(item.category);
    const statusClass = item.status === 'lost' ? 'badge--lost' : 'badge--found';
    const claimedBadge = item.isClaimed ? '<span class="badge badge--claimed">Claimed</span>' : '';
    const pendingBadge = !item.isApproved ? '<span class="badge badge--pending">Pending</span>' : '';
    
    const imageHtml = item.imageBase64 
        ? `<img src="${item.imageBase64}" alt="${sanitizeInput(item.title)}">`
        : '<span>No Image Available</span>';
    
    detailsContainer.innerHTML = `
        <div class="details-image">
            ${imageHtml}
        </div>
        
        <div class="details-header">
            <div>
                <h2 class="details-title">${sanitizeInput(item.title)}</h2>
                <div class="item-badges">
                    <span class="badge ${statusClass}">${item.status}</span>
                    <span class="badge badge--category">${categoryLabel}</span>
                    ${claimedBadge}
                    ${pendingBadge}
                </div>
            </div>
            <div class="details-actions">
                ${!item.isClaimed ? `<button id="claim-btn" class="btn btn--primary">Mark as Claimed</button>` : ''}
                <button id="copy-link-btn" class="btn btn--secondary">Copy Link</button>
            </div>
        </div>
        
        <div class="details-grid">
            <div class="details-field">
                <strong>Description</strong>
                <span>${sanitizeInput(item.description)}</span>
            </div>
            <div class="details-field">
                <strong>Location</strong>
                <span>${sanitizeInput(item.location)}</span>
            </div>
            <div class="details-field">
                <strong>Date</strong>
                <span>${formatDate(item.date)}</span>
            </div>
            <div class="details-field">
                <strong>Reported by</strong>
                <span>${sanitizeInput(item.reporterName)}</span>
            </div>
            ${item.reporterEmail ? `
                <div class="details-field">
                    <strong>Contact Email</strong>
                    <span>${sanitizeInput(item.reporterEmail)}</span>
                </div>
            ` : ''}
            ${item.reporterPhone ? `
                <div class="details-field">
                    <strong>Contact Phone</strong>
                    <span>${sanitizeInput(item.reporterPhone)}</span>
                </div>
            ` : ''}
            <div class="details-field">
                <strong>Reported</strong>
                <span>${formatRelativeTime(item.createdAt)}</span>
            </div>
            <div class="details-field">
                <strong>Item ID</strong>
                <span class="item-id" title="Click to copy">${item.id}</span>
            </div>
        </div>
    `;
    
    // Set up event listeners
    const claimBtn = document.getElementById('claim-btn');
    const copyLinkBtn = document.getElementById('copy-link-btn');
    const itemIdSpan = detailsContainer.querySelector('.item-id');
    
    if (claimBtn) {
        claimBtn.addEventListener('click', () => {
            showModal(
                'Mark as Claimed',
                'Are you sure you want to mark this item as claimed?',
                () => markItemClaimed(item.id)
            );
        });
    }
    
    if (copyLinkBtn) {
        copyLinkBtn.addEventListener('click', () => copyItemLink(item.id));
    }
    
    if (itemIdSpan) {
        itemIdSpan.addEventListener('click', () => copyToClipboard(item.id));
    }
    
    // Load messages
    renderMessages();
}

/**
 * Mark item as claimed
 */
function markItemClaimed(itemId) {
    const updatedItem = updateItem(itemId, {
        isClaimed: true,
        claimedBy: 'Current User'
    });
    
    if (updatedItem) {
        showToast('Item marked as claimed!', 'success');
        showItemDetails(itemId); // Refresh the view
        
        // Send email notification if enabled
        const settings = getSettings();
        if (settings.emailEnabled && updatedItem.reporterEmail) {
            sendEmailNotification(
                updatedItem.reporterEmail,
                'Item Claimed',
                `Your ${updatedItem.status} item "${updatedItem.title}" has been marked as claimed.`
            );
        }
    } else {
        showToast('Error updating item.', 'error');
    }
}

/**
 * Copy item link to clipboard
 */
function copyItemLink(itemId) {
    const url = `${window.location.origin}${window.location.pathname}?item=${itemId}`;
    copyToClipboard(url);
}

/**
 * Copy text to clipboard
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('Copied to clipboard!', 'success');
    } catch (error) {
        console.error('Failed to copy:', error);
        showToast('Failed to copy to clipboard.', 'error');
    }
}

/**
 * Initialize details view
 */
function initializeDetailsView() {
    const backBtn = document.getElementById('back-to-home-details');
    const shareBtn = document.getElementById('share-item');
    
    backBtn.addEventListener('click', () => showView('home'));
    shareBtn.addEventListener('click', () => {
        if (currentItem) {
            copyItemLink(currentItem.id);
        }
    });
}

// =============================================================================
// MESSAGING FUNCTIONS
// =============================================================================

/**
 * Render messages for current item
 */
function renderMessages() {
    const messagesList = document.getElementById('messages-list');
    
    if (!currentItem || !currentItem.messages || currentItem.messages.length === 0) {
        messagesList.innerHTML = '<div class="no-messages">No messages yet. Be the first to reach out!</div>';
        return;
    }
    
    const messagesHtml = currentItem.messages.map(message => `
        <div class="message">
            <div class="message-header">
                <span class="message-sender">${sanitizeInput(message.senderName)}</span>
                <span class="message-time">${formatRelativeTime(message.timestamp)}</span>
            </div>
            <div class="message-text">${sanitizeInput(message.text)}</div>
        </div>
    `).join('');
    
    messagesList.innerHTML = messagesHtml;
    messagesList.scrollTop = messagesList.scrollHeight;
}

/**
 * Initialize messaging
 */
function initializeMessaging() {
    const messageForm = document.getElementById('message-form');
    
    messageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const senderName = document.getElementById('sender-name').value.trim();
        const senderEmail = document.getElementById('sender-email').value.trim();
        const messageText = document.getElementById('message-text').value.trim();
        
        if (!senderName || !messageText) {
            showToast('Please fill in your name and message.', 'error');
            return;
        }
        
        if (!currentItem) {
            showToast('No item selected.', 'error');
            return;
        }
        
        const newMessage = {
            messageId: generateUUID(),
            senderName: sanitizeInput(senderName),
            senderEmail: sanitizeInput(senderEmail),
            text: sanitizeInput(messageText),
            timestamp: new Date().toISOString()
        };
        
        // Add message to item
        const updatedMessages = [...(currentItem.messages || []), newMessage];
        const updatedItem = updateItem(currentItem.id, { messages: updatedMessages });
        
        if (updatedItem) {
            currentItem = updatedItem;
            showToast('Message sent!', 'success');
            
            // Clear form
            messageForm.reset();
            
            // Refresh messages
            renderMessages();
            
            // Send email notification if enabled
            const settings = getSettings();
            if (settings.emailEnabled && currentItem.reporterEmail && currentItem.reporterEmail !== senderEmail) {
                sendEmailNotification(
                    currentItem.reporterEmail,
                    'New Message',
                    `You have a new message about your ${currentItem.status} item "${currentItem.title}" from ${senderName}.`
                );
            }
        } else {
            showToast('Error sending message.', 'error');
        }
    });
}

// =============================================================================
// ADMIN FUNCTIONS
// =============================================================================

/**
 * Show admin view
 */
function showAdminView() {
    const adminLogin = document.getElementById('admin-login');
    const adminPanel = document.getElementById('admin-panel');
    
    if (adminLoggedIn) {
        adminLogin.classList.add('hidden');
        adminPanel.classList.remove('hidden');
        renderAdminPanel();
    } else {
        adminLogin.classList.remove('hidden');
        adminPanel.classList.add('hidden');
    }
}

/**
 * Render admin panel
 */
function renderAdminPanel() {
    const settings = getSettings();
    const requireApprovalCheckbox = document.getElementById('require-approval');
    const emailEnabledCheckbox = document.getElementById('email-enabled');
    const pendingList = document.getElementById('pending-list');
    const adminItemsList = document.getElementById('admin-items-list');
    
    // Update settings checkboxes
    requireApprovalCheckbox.checked = settings.requireApproval;
    emailEnabledCheckbox.checked = settings.emailEnabled;
    
    // Get items
    const allItems = getAllItems();
    const pendingItems = allItems.filter(item => !item.isApproved);
    
    // Render pending items
    if (pendingItems.length === 0) {
        pendingList.innerHTML = '<p>No pending items.</p>';
    } else {
        pendingList.innerHTML = pendingItems.map(item => `
            <div class="admin-item">
                <div class="admin-item-header">
                    <span class="admin-item-title">${sanitizeInput(item.title)}</span>
                    <div class="admin-actions">
                        <button class="btn btn--primary btn--sm" onclick="approveItem('${item.id}')">Approve</button>
                        <button class="btn btn--outline btn--sm" onclick="rejectItem('${item.id}')">Reject</button>
                    </div>
                </div>
                <div class="admin-item-details">
                    <strong>Category:</strong> ${getCategoryLabel(item.category)} | 
                    <strong>Status:</strong> ${item.status} | 
                    <strong>Reporter:</strong> ${sanitizeInput(item.reporterName)}<br>
                    <strong>Description:</strong> ${sanitizeInput(item.description)}
                </div>
            </div>
        `).join('');
    }
    
    // Render all items
    adminItemsList.innerHTML = allItems.map(item => `
        <div class="admin-item">
            <div class="admin-item-header">
                <span class="admin-item-title">${sanitizeInput(item.title)}</span>
                <div class="admin-actions">
                    <span class="badge ${item.isApproved ? 'badge--found' : 'badge--pending'}">
                        ${item.isApproved ? 'Approved' : 'Pending'}
                    </span>
                    ${item.isClaimed ? '<span class="badge badge--claimed">Claimed</span>' : ''}
                    <button class="btn btn--outline btn--sm" onclick="deleteAdminItem('${item.id}')">Delete</button>
                </div>
            </div>
            <div class="admin-item-details">
                <strong>Category:</strong> ${getCategoryLabel(item.category)} | 
                <strong>Status:</strong> ${item.status} | 
                <strong>Reporter:</strong> ${sanitizeInput(item.reporterName)}<br>
                <strong>Created:</strong> ${formatRelativeTime(item.createdAt)}
            </div>
        </div>
    `).join('');
}

/**
 * Initialize admin view
 */
function initializeAdminView() {
    const backBtn = document.getElementById('back-to-home-admin');
    const loginBtn = document.getElementById('admin-login-btn');
    const passcodeInput = document.getElementById('admin-passcode');
    const requireApprovalCheckbox = document.getElementById('require-approval');
    const emailEnabledCheckbox = document.getElementById('email-enabled');
    
    // Back button
    backBtn.addEventListener('click', () => {
        adminLoggedIn = false;
        showView('home');
    });
    
    // Login
    loginBtn.addEventListener('click', () => {
        const passcode = passcodeInput.value;
        if (passcode === CONFIG.ADMIN_PASSCODE) {
            adminLoggedIn = true;
            passcodeInput.value = '';
            showAdminView();
            showToast('Logged in successfully!', 'success');
        } else {
            showToast('Invalid passcode.', 'error');
        }
    });
    
    // Enter key for login
    passcodeInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            loginBtn.click();
        }
    });
    
    // Settings changes
    requireApprovalCheckbox.addEventListener('change', (e) => {
        const settings = getSettings();
        settings.requireApproval = e.target.checked;
        saveSettings(settings);
        showToast('Setting updated!', 'success');
    });
    
    emailEnabledCheckbox.addEventListener('change', (e) => {
        const settings = getSettings();
        settings.emailEnabled = e.target.checked;
        saveSettings(settings);
        showToast('Setting updated!', 'success');
    });
}

// =============================================================================
// ADMIN ITEM ACTIONS (Global functions for onclick handlers)
// =============================================================================

/**
 * Approve pending item
 */
function approveItem(itemId) {
    const updatedItem = updateItem(itemId, { isApproved: true });
    if (updatedItem) {
        showToast('Item approved!', 'success');
        renderAdminPanel();
        
        // Send email notification if enabled
        const settings = getSettings();
        if (settings.emailEnabled && updatedItem.reporterEmail) {
            sendEmailNotification(
                updatedItem.reporterEmail,
                'Item Approved',
                `Your ${updatedItem.status} item "${updatedItem.title}" has been approved and is now visible to others.`
            );
        }
    } else {
        showToast('Error approving item.', 'error');
    }
}

/**
 * Reject pending item
 */
function rejectItem(itemId) {
    showModal(
        'Reject Item',
        'Are you sure you want to reject this item? It will be permanently deleted.',
        () => {
            if (deleteItem(itemId)) {
                showToast('Item rejected and deleted.', 'success');
                renderAdminPanel();
            } else {
                showToast('Error rejecting item.', 'error');
            }
        }
    );
}

/**
 * Delete item from admin panel
 */
function deleteAdminItem(itemId) {
    showModal(
        'Delete Item',
        'Are you sure you want to permanently delete this item?',
        () => {
            if (deleteItem(itemId)) {
                showToast('Item deleted.', 'success');
                renderAdminPanel();
            } else {
                showToast('Error deleting item.', 'error');
            }
        }
    );
}

// Make admin functions global
window.approveItem = approveItem;
window.rejectItem = rejectItem;
window.deleteAdminItem = deleteAdminItem;

// =============================================================================
// EMAIL FUNCTIONS
// =============================================================================

/**
 * Send email notification (mock implementation)
 */
function sendEmailNotification(to, subject, body) {
    // This is a mock implementation
    // In a real application, you would integrate with an email service
    console.log('Email notification:', { to, subject, body });
    
    // Simulate email sending
    setTimeout(() => {
        console.log(`Email sent to ${to}: ${subject}`);
    }, 1000);
}

// =============================================================================
// URL HANDLING AND DEEP LINKING
// =============================================================================

/**
 * Handle URL parameters and deep linking
 */
function handleURLParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const itemId = urlParams.get('item');
    
    if (itemId) {
        const item = getItemById(itemId);
        if (item && item.isApproved) {
            showView('details', itemId);
        } else {
            showToast('Item not found or not available.', 'error');
            showView('home');
        }
    }
}

// =============================================================================
// APPLICATION INITIALIZATION
// =============================================================================

/**
 * Initialize the entire application
 */
function initializeApp() {
    // Initialize data
    initializeData();
    
    // Initialize view handlers
    initializeHomeView();
    initializeReportView();
    initializeDetailsView();
    initializeMessaging();
    initializeAdminView();
    
    // Handle URL params for deep linking
    handleURLParams();
    
    // Handle browser back/forward
    window.addEventListener('popstate', handleURLParams);
    
    console.log('Campus Lost & Found application initialized successfully!');
}

// =============================================================================
// EVENT LISTENERS AND APP STARTUP
// =============================================================================

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);

// Handle keyboard navigation
document.addEventListener('keydown', (e) => {
    // Escape key to close modals
    if (e.key === 'Escape') {
        const modal = document.getElementById('modal');
        if (!modal.classList.contains('hidden')) {
            modal.classList.add('hidden');
        }
    }
});

// Handle offline/online status
window.addEventListener('offline', () => {
    showToast('You are offline. Some features may not work.', 'warning');
});

window.addEventListener('online', () => {
    showToast('Connection restored!', 'success');
});

// Prevent form submission on Enter in search fields
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.id === 'search-input') {
        e.preventDefault();
    }
});

// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        generateUUID,
        sanitizeInput,
        getAllItems,
        addItem,
        updateItem,
        deleteItem,
        filterItems
    };
}
