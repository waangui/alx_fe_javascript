let quotes = JSON.parse(localStorage.getItem('quotes')) || [
    { text: "The only way to do great work is to love what you do.", category: "Inspiration" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { text: "In the middle of difficulty lies opportunity.", category: "Motivation" },
    { text: "Life is like riding a bicycle. To keep your balance, you must keep moving.", category: "Life"},
    { text: "The worst sin - perhaps the only sin - passion can commit, is to be joyless.", category: "Passion"}

];

// Save quotes to local storage
async function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter){
        localStorage.setItem('lastCategoryFilter', categoryFilter.value);
    }

    postToServer(quotes).then(success=> {
        if (success) console.log("Quotes synced with server");
    })
}

// Merge server & local quotes
function mergeQuotes(localQuotes, serverQuotes) {
    const conflicts = [];
    const merged = [...localQuotes];
    
    serverQuotes.forEach(serverQuote => {
        const existingIndex = merged.findIndex(localQuote => 
            (localQuote.id && localQuote.id === serverQuote.id) ||
            (localQuote.text === serverQuote.text && 
             localQuote.category === serverQuote.category)
        );
        
        
        if (existingIndex === -1) {
            // New quote from server
            merged.push(serverQuote);
        } else {
            // Conflict resolution (server takes precedence)
            if (JSON.stringify(merged[existingIndex]) !== JSON.stringify(serverQuote)) {
                conflicts.push({
                    id: serverQuote.id || serverQuote.text+serverQuote.category,
                    text: serverQuote.text,
                    serverVersion: serverQuote,
                    localVersion: merged[existingIndex]
                });
                merged[existingIndex] = serverQuote; // Server wins by default
            }
        }
    });
    
    
     return { mergedQuotes: merged, conflicts };
}



// Periodic sync function
async function syncWithServer() {
   try {
        console.log("Starting sync...");
        const serverQuotes = await fetchQuotesFromServer();
        const { mergedQuotes, conflicts } = mergeQuotes(quotes, serverQuotes);
        
        // Only update if changes exist
        if (JSON.stringify(mergedQuotes) !== JSON.stringify(quotes)) {
            quotes = mergedQuotes;
            saveQuotes();
            
            // Notify user
            const message = serverQuotes.length > 0 
                ? `Synced ${serverQuotes.length} update(s) from server`
                : "No new updates from server";
            
            showSyncNotification(message, conflicts);
            updateUI();
        }
        
        // Update sync timestamp
        lastSyncTimestamp = Date.now();
        localStorage.setItem('lastSyncTimestamp', lastSyncTimestamp);
        
        // Schedule next sync
        setTimeout(syncWithServer, SYNC_INTERVAL);
        
    } catch (error) {
        console.error("Sync failed:", error);
        setTimeout(syncWithServer, SYNC_INTERVAL); // Retry
    }
}

// Add new quote
function addQuote() {
    const text = document.getElementById('newQuoteText').value.trim();
    const category = document.getElementById('newQuoteCategory').value.trim();
    
    if (text && category) {
        quotes.push({ text, category });
        saveQuotes(); // Save to localStorage
        
        // Clear inputs
        document.getElementById('newQuoteText').value = '';
        document.getElementById('newQuoteCategory').value = '';
        
        // Handle new categories
        const categories = [...new Set(quotes.map(q => q.category))];
        if (!categories.includes(category)) {
            populateCategories(); // Refresh dropdown if new category
        }
        
        filterQuotes(); // Show updated quotes
        alert('Quote added successfully!');
    } else {
        alert('Please fill in both fields!');
    }
}

// Show random quote
function showRandomQuote() {
    const quoteDisplay = document.getElementById('quoteDisplay');
    if (quotes.length === 0) {
        quoteDisplay.textContent = "No quotes available. Add some! ";
        return;
    }
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[randomIndex];
    quoteDisplay.innerHTML = ` <blockquote>"${randomQuote.text}"</blockquote>
        <cite>— ${randomQuote.category}</cite> `;
}



function createAddQuoteForm() {
    // Create form elements
    const formContainer = document.createElement('div');
    formContainer.id = 'addQuoteForm';
    
    const heading = document.createElement('h3');
    heading.textContent = 'Add Your Own Quote';
    
    const textInput = document.createElement('input');
    textInput.type = 'text';
    textInput.id = 'newQuoteText';
    textInput.placeholder = 'Enter quote text';
    
    const categoryInput = document.createElement('input');
    categoryInput.type = 'text';
    categoryInput.id = 'newQuoteCategory';
    categoryInput.placeholder = 'Enter category';
    
    const addButton = document.createElement('button');
    addButton.textContent = 'Add Quote';

    // Create export button
    const exportButton = document.createElement('button');
    exportButton.textContent = 'Export Quotes';
    exportButton.id = 'exportQuotes';

    // Create import file input
    const importLabel = document.createElement('label');
    importLabel.textContent = 'Import Quotes: ';
    
    const importInput = document.createElement('input');
    importInput.type = 'file';
    importInput.id = 'importFile';
    importInput.accept = '.json';


    
    // Add event listener to button
    addButton.addEventListener('click', addQuote);

    
    
    // Assemble the form
    formContainer.appendChild(heading);
    formContainer.appendChild(textInput);
    formContainer.appendChild(categoryInput);
    formContainer.appendChild(addButton);
    formContainer.appendChild(exportButton);
    formContainer.appendChild(importLabel);
    formContainer.appendChild(importInput);
    
    

    
    // Add the form to the body (or a specific container)
    document.body.appendChild(formContainer);
}

// Export quotes to JSON file
function exportQuotes() {
    if (quotes.length === 0) {
        alert('No quotes to export!');
        return;
    }
    
    const data = JSON.stringify(quotes, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotes.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Import quotes from JSON file
function importFromJsonFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
        try {
            const importedQuotes = JSON.parse(event.target.result);
            if (Array.isArray(importedQuotes)) {
                quotes = [...quotes, ...importedQuotes];
                saveQuotes();
                // include new categories in drop-down 
                populateCategories(); 
                // update to show filtered quotes
                filterQuotes();

                alert(`Successfully imported ${importedQuotes.length} quotes!`);
            } else {
                alert('Invalid format');
            }
        } catch (error) {
            alert('Error reading file: ' + error.message);
        }
        // Reset file input
        event.target.value = '';
    };
    fileReader.readAsText(file);
}

// Populate category dropdown with unique categories
function populateCategories() {
    const categoryFilter = document.getElementById('categoryFilter');
    const currentSelection = categoryFilter ? categoryFilter.value : 'all';
    
    // Clear existing options except "All Categories"
    while (categoryFilter.options.length > 1) {
        categoryFilter.remove(1);
    }
    
    // Get unique categories from quotes
    const categories = [...new Set(quotes.map(quote => quote.category))];
    
    // Add each category as an option
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
    
    // Restore selection if it still exists
    if (categoryFilter.querySelector(`option[value="${currentSelection}"]`)) {
        categoryFilter.value = currentSelection;
    } else {
        categoryFilter.value = 'all';
    }
    
    // Save the current selection
    saveQuotes();
}

// Filter quotes based on selected category
function filterQuotes() {
    const categoryFilter = document.getElementById('categoryFilter');
    const selectedCategory = categoryFilter.value;
    
    // Save selected filter
    localStorage.setItem('lastCategoryFilter', selectedCategory);
    
    // Show random quote from filtered category
    if (selectedCategory === 'all') {
        showRandomQuote();
    } else {
        const filteredQuotes = quotes.filter(quote => quote.category === selectedCategory);
        if (filteredQuotes.length === 0) {
            document.getElementById('quoteDisplay').textContent = `No quotes in category "${selectedCategory}".`;
            return;
        }
        const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
        const randomQuote = filteredQuotes[randomIndex];
        document.getElementById('quoteDisplay').innerHTML = `
            <blockquote>"${randomQuote.text}"</blockquote>
            <cite>— ${randomQuote.category}</cite>
        `;
    }
}

// Server simulation 
const API_URL = 'https://jsonplaceholder.typicode.com/posts'; // JSONPlaceholder
const SERVER_DELAY = 2000; // 2 second delay 
const SYNC_INTERVAL = 30000; // 30 seconds
let lastSyncTimestamp = 0;


// Simulate fetching quotes from server
async function fetchQuotesFromServer() {
    try {
         const response = await fetch(`${SERVER_URL}?since=${lastSyncTimestamp}`, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        const data = await response.json();
        return data.quotes || [];
    } catch (error) {
        console.error("Fetch error:", error);
        showSyncNotification("Failed to sync with server");
        return [];
    }
}


// Simulate sending quotes to server
async function postToServer(quotesToSend) {
    try {
      const response = await fetch(SERVER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ 
                quotes: quotesToSend
                
             })
        });
        
        if (!response.ok) throw new Error('Server rejected update');
        return true;
    } catch (error) {
        console.error("Post error:", error);
        showSyncNotification("Failed to update server");
        return false;
    } 
}

function showSyncNotification(message, conflicts = []) {
    const notification = document.getElementById('sync-notification');
    const messageEl = document.getElementById('sync-message');
    const conflictDiv = document.getElementById('conflict-resolution');
    const choicesDiv = document.getElementById('conflict-choices');
    
    messageEl.textContent = message;
    conflictDiv.style.display = conflicts.length ? 'block' : 'none';
    choicesDiv.innerHTML = '';
    
    conflicts.forEach(conflict => {
        const div = document.createElement('div');
        div.innerHTML = `
            <p>${conflict.text}</p>
            <button data-id="${conflict.id}" data-choice="server">Use Server Version</button>
            <button data-id="${conflict.id}" data-choice="local">Keep My Version</button>
        `;
        choicesDiv.appendChild(div);
    });
    
    notification.style.display = 'block';
}

// Initialize with proper headers
document.addEventListener('DOMContentLoaded', () => {
    // ... existing init code ...
    
    // Conflict resolution handlers
    document.getElementById('dismiss-sync').addEventListener('click', () => {
        document.getElementById('sync-notification').style.display = 'none';
    });
    
    document.addEventListener('click', function(e) {
        if (e.target.matches('#conflict-choices button[data-choice]')) {
            handleConflictChoice(
                e.target.dataset.id,
                e.target.dataset.choice
            );
        }
    });
});

function handleConflictChoice(quoteId, choice) {
    const index = quotes.findIndex(q => 
        (q.id || q.text+q.category) === quoteId
    );
    
    if (index !== -1) {
        if (choice === 'local') {
            quotes[index].timestamp = Date.now(); // Mark as updated
            saveQuotes();
            updateUI();
        }
        
    }
}

// Notification system
function showSyncNotification(message, conflicts = []) {
    const notification = document.getElementById('sync-notification');
    const messageEl = document.getElementById('sync-message');
    const conflictDiv = document.getElementById('conflict-resolution');
    const choicesDiv = document.getElementById('conflict-choices');
    
    messageEl.textContent = message;
    conflictDiv.style.display = conflicts.length ? 'block' : 'none';
    choicesDiv.innerHTML = '';
    
    conflicts.forEach(conflict => {
        const conflictEl = document.createElement('div');
        conflictEl.innerHTML = `
            <p>Conflict found: "${conflict.text}"</p>
            <button data-id="${conflict.id}" data-version="server">Use Server Version</button>
            <button data-id="${conflict.id}" data-version="local">Keep Local Version</button>
        `;
        choicesDiv.appendChild(conflictEl);
    });
    
    notification.style.display = 'block';
}

// Handle conflict resolution
document.getElementById('dismiss-sync').addEventListener('click', () => {
    document.getElementById('sync-notification').style.display = 'none';
});

document.addEventListener('click', (e) => {
    if (e.target.matches('#conflict-choices button[data-version]')) {
        const quoteId = e.target.dataset.id;
        const version = e.target.dataset.version;
        
        const quoteIndex = quotes.findIndex(q => 
            (q.id || q.text+q.category) === quoteId
        );
        
        if (quoteIndex !== -1 && version === 'local') {
            // Restore local version and update timestamp
            quotes[quoteIndex].timestamp = Date.now();
            saveQuotes();
            updateUI();
        }
        
        // Remove this conflict from UI
        e.target.parentElement.remove();
    }
});




// event listener for 'show new quote' button
document.addEventListener('DOMContentLoaded', async () => {
    // Load last sync time
    lastSyncTimestamp = parseInt(localStorage.getItem('lastSyncTimestamp')) || 0;
    
    document.getElementById('newQuote').addEventListener('click', showRandomQuote);
    createAddQuoteForm();
    showRandomQuote();
    populateCategories(); 
    filterQuotes();


     // Initial sync with server
    await syncWithServer();

    // Set up periodic sync
    setInterval(syncWithServer, SYNC_INTERVAL);
});


function updateUI() {
    populateCategories(); 
    filterQuotes();
    saveQuotes();
 } 

