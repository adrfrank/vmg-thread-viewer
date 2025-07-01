// Simple message sending functionality
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const chatMessages = document.getElementById('chatMessages');

function addMessage(text, isSent = true) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isSent ? 'sent' : 'received'}`;
    
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    messageDiv.innerHTML = `
        <div class="message-content">
            <p>${text}</p>
            <span class="message-time">${timeString}</span>
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendMessage() {
    const text = messageInput.value.trim();
    if (text) {
        addMessage(text, true);
        messageInput.value = '';
        
        // Simulate a response after 1 second
        setTimeout(() => {
            addMessage('Message received! This is where VMG thread data would appear.', false);
        }, 1000);
    }
}

// Drag and Drop functionality for text files
function setupDragAndDrop() {
    const chatContainer = document.querySelector('.chat-container');
    
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        chatContainer.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });
    
    // Highlight drop area when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
        chatContainer.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        chatContainer.addEventListener(eventName, unhighlight, false);
    });
    
    // Handle dropped files
    chatContainer.addEventListener('drop', handleDrop, false);
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlight(e) {
    const chatContainer = document.querySelector('.chat-container');
    chatContainer.classList.add('drag-over');
}

function unhighlight(e) {
    const chatContainer = document.querySelector('.chat-container');
    chatContainer.classList.remove('drag-over');
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    
    if (files.length > 0) {
        const file = files[0];
        
        // Check if it's a text file
        if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.vmg')) {
            addMessage(`📁 File dropped: ${file.name}`, false);
            
            const reader = new FileReader();
            reader.onload = function(e) {
                const content = e.target.result;
                
                // Log the content to console
                console.log('=== File Content ===');
                console.log('Filename:', file.name);
                console.log('File size:', file.size, 'bytes');
                console.log('Content:');
                console.log(content);
                console.log('===================');
                
                // Add a message showing the file was processed
                addMessage(`✅ File "${file.name}" processed successfully! Check the console for content.`, false);
                
                // You can also display a preview of the content in the chat
                const preview = content.length > 200 ? content.substring(0, 200) + '...' : content;
                addMessage(`📄 Preview: ${preview}`, false);
            };
            
            reader.onerror = function() {
                addMessage(`❌ Error reading file: ${file.name}`, false);
                console.error('Error reading file:', file.name);
            };
            
            reader.readAsText(file);
        } else {
            addMessage(`❌ Please drop a text file (.txt, .vmg, or plain text). Received: ${file.type}`, false);
        }
    }
}

// Event listeners
sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Initialize drag and drop
setupDragAndDrop(); 