const quotes = [
    { text: "The only way to do great work is to love what you do.", category: "Inspiration" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { text: "In the middle of difficulty lies opportunity.", category: "Motivation" }
];


// show random quote
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
    
    // Add the form to the body (or a specific container)
    document.body.appendChild(formContainer);
}

// event listener for 'show new quote' button

document.getElementById('newQuote').addEventListener('click', showRandomQuote);
createAddQuoteForm();
showRandomQuote();