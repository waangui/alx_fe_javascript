let quotes = JSON.parse(localStorage.getItem('quotes')) || [
    { text: "The only way to do great work is to love what you do.", category: "Inspiration" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { text: "In the middle of difficulty lies opportunity.", category: "Motivation" }
];

// Save quotes to local storage
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
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
    addButton.addEventListener('click', function() {
        const text = textInput.value.trim();
        const category = categoryInput.value.trim();
        
        if (text && category) {
            quotes.push({ text, category });
            textInput.value = '';
            categoryInput.value = '';
            showRandomQuote();
            alert('Quote added successfully!');
        } else {
            alert('Please fill in both fields!');
        }
    });

    
    
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
            if (Array.isArray(importedQuotes) && importedQuotes.length > 0) {
                quotes.push(...importedQuotes);
                saveQuotes();
                showRandomQuote();
                alert(`Successfully imported ${importedQuotes.length} quotes!`);
            } else {
                alert('The file doesn\'t contain valid quotes!');
            }
        } catch (e) {
            alert('Error reading file: ' + e.message);
        }
        // Reset file input
        event.target.value = '';
    };
    fileReader.readAsText(file);
}

// event listener for 'show new quote' button

document.getElementById('newQuote').addEventListener('click', showRandomQuote);
createAddQuoteForm();
showRandomQuote();
saveQuotes();