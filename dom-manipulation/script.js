const quotes = [
    { text: "The only way to do great work is to love what you do.", category: "Inspiration" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { text: "In the middle of difficulty lies opportunity.", category: "Motivation" }
];


// show random quote
function showRandomQuote() {
    const quoteDisplay = document.getElementById('quoteDisplay');
    if (quotes.length === 0) {
        quoteDisplay.textContent = "No quotes available.";
        return;
    }
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[randomIndex];
    quoteDisplay.innerHTML = `<p>"${randomQuote.text}"</p><p>- ${randomQuote.category}</p>`;
}

// add quote from button

function addQuote() {
    // Get the values from the input fields
    const text = document.getElementById('newQuoteText').value.trim();
    const category = document.getElementById('newQuoteCategory').value.trim();

    // Check if both fields are filled
    if (text && category) {
        // Add the new quote to the array
        quotes.push({ text, category });
        
        // Clear the input fields
        document.getElementById('newQuoteText').value = '';
        document.getElementById('newQuoteCategory').value = '';
        // Confirmation 
        alert('Quote added successfully!');
        
        // Show the newly added quote 
        showRandomQuote();
    } else {
        alert('Please fill in both fields!');
    }
}

// event listener for 'show new quote' button

document.getElementById('newQuote').addEventListener('click', showRandomQuote);