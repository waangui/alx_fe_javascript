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
  console.log("Add quote form is ready");
}


// add quote from button

function addQuote() {
    // Get the values from the input fields
    const text = document.getElementById('newQuoteText').value.trim();
    const category = document.getElementById('newQuoteCategory').value.trim();

    // Check if both fields are filled
    // Validate
    if (!text || !category) {
        alert("Please fill both fields!");
        return false;
    }

    // Add to array
    quotes.push({ text, category });
  
    // Clear form
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';
  
    // Show new quote
     document.getElementById('quoteDisplay').innerHTML = `
        <p>Added:</p>
        <blockquote>"${text}"</blockquote>
        <cite>— ${category}</cite>
        `;
  
  return false; // Prevent form submission
}





// event listener for 'show new quote' button

document.getElementById('newQuote').addEventListener('click', showRandomQuote);
createAddQuoteForm();
showRandomQuote();