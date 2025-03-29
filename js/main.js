// Create a global error handler for script loading issues
window.addEventListener('error', function(e) {
    console.error('Script error occurred:', e.message);
    // Only show alerts for major issues
    if (e.message.includes('schema') || e.message.includes('Cannot read properties of undefined')) {
        alert('A script loading error occurred. Some features may not work properly.');
    }
});

// Add copy to clipboard functionality
document.getElementById('copy-btn').addEventListener('click', debounce(() => {
    const promptOutput = document.getElementById('prompt-output');
    navigator.clipboard.writeText(promptOutput.textContent)
        .then(() => {
            const copyBtn = document.getElementById('copy-btn');
            copyBtn.textContent = 'Copied!';
            setTimeout(() => {
                copyBtn.textContent = 'Copy to Clipboard';
            }, 2000);
        })
        .catch(err => {
            console.error('Error copying text: ', err);
        });
}, 300));

// Debounce function to limit the rate at which a function can fire
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}
