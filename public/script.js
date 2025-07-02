// Global variables
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const chatMessages = document.getElementById('chatMessages');
const conversationList = document.getElementById('conversationList');
const refreshConversationsBtn = document.getElementById('refreshConversations');
const currentConversationTitle = document.getElementById('currentConversationTitle');
const currentConversationStatus = document.getElementById('currentConversationStatus');

// Settings panel elements
const settingsBtn = document.getElementById('settingsBtn');
const settingsPanel = document.getElementById('settingsPanel');
const closeSettingsBtn = document.getElementById('closeSettings');
const deleteAllBtn = document.getElementById('deleteAllBtn');
const totalMessagesEl = document.getElementById('totalMessages');
const totalConversationsEl = document.getElementById('totalConversations');
const totalContactsEl = document.getElementById('totalContacts');

const messageRepository = new MessageRepository();
let currentConversation = null;

// Conversation management
function renderConversations() {
    const conversations = messageRepository.getAllConversations();
    const contacts = messageRepository.getAllContacts();
    
    // Clear existing conversations
    conversationList.innerHTML = '';
    
    if (conversations.length === 0) {
        conversationList.innerHTML = `
            <div class="conversation-item placeholder">
                <div class="conversation-info">
                    <p>No conversations yet</p>
                    <span>Drop VMG files to get started</span>
                </div>
            </div>
        `;
        return;
    }
    
    // Sort conversations by last message time (newest first)
    conversations.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
    
    conversations.forEach(conversation => {
        const contact = contacts.find(c => c.number === conversation.phoneNumber);
        const contactName = contact ? contact.name : conversation.phoneNumber;
        
        const conversationElement = document.createElement('div');
        conversationElement.className = 'conversation-item';
        conversationElement.dataset.phoneNumber = conversation.phoneNumber;
        
        const lastMessageTime = new Date(conversation.lastMessageAt);
        const timeString = formatTime(lastMessageTime);
        
        conversationElement.innerHTML = `
            <div class="conversation-avatar">
                <i class="fas fa-user"></i>
            </div>
            <div class="conversation-info">
                <p>${contactName}</p>
                <span>${conversation.messageCount} message${conversation.messageCount !== 1 ? 's' : ''}</span>
            </div>
            <div class="conversation-meta">
                <div class="conversation-time">${timeString}</div>
                <div class="conversation-count">${conversation.messageCount}</div>
            </div>
        `;
        
        conversationElement.addEventListener('click', () => {
            selectConversation(conversation.phoneNumber);
        });
        
        conversationList.appendChild(conversationElement);
    });
}

function selectConversation(phoneNumber) {
    // Remove active class from all conversations
    document.querySelectorAll('.conversation-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class to selected conversation
    const selectedItem = document.querySelector(`[data-phone-number="${phoneNumber}"]`);
    if (selectedItem) {
        selectedItem.classList.add('active');
    }
    
    currentConversation = phoneNumber;
    
    // Update header
    const contacts = messageRepository.getAllContacts();
    const contact = contacts.find(c => c.number === phoneNumber);
    const contactName = contact ? contact.name : phoneNumber;
    
    currentConversationTitle.textContent = contactName;
    currentConversationStatus.textContent = phoneNumber;
    
    // Load messages for this conversation
    loadMessagesForConversation(phoneNumber);
}

function loadMessagesForConversation(phoneNumber) {
    const messages = messageRepository.getMessagesByConversation(phoneNumber);
    
    // Clear existing messages
    chatMessages.innerHTML = '';
    
    if (messages.length === 0) {
        chatMessages.innerHTML = `
            <div class="message received">
                <div class="message-content">
                    <p>No messages in this conversation yet.</p>
                    <span class="message-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
            </div>
        `;
        return;
    }
    
    // Sort messages by datetime (oldest first)
    messages.sort((a, b) => {
        const dateA = a.datetime || new Date(0);
        const dateB = b.datetime || new Date(0);
        return dateA - dateB;
    });
    
    let lastMessageDate = null;
    
    messages.forEach(message => {
        const messageDate = message.datetime || new Date();
        
        // Add date separator if day changes
        if (lastMessageDate === null || !isSameDay(lastMessageDate, messageDate)) {
            addDateSeparator(messageDate);
        }
        
        addMessageToChat(message.message, message.type === VmgMessageType.OUTGOING, messageDate);
        lastMessageDate = messageDate;
    });
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addMessageToChat(text, isSent = true, messageTime = null) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isSent ? 'sent' : 'received'}`;
    
    const time = messageTime || new Date();
    const timeString = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    messageDiv.innerHTML = `
        <div class="message-content">
            <p>${text}</p>
            <span class="message-time">${timeString}</span>
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
}

function formatTime(date) {
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
        return 'Yesterday';
    } else {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
}

function isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
}

function addDateSeparator(date) {
    const separatorDiv = document.createElement('div');
    separatorDiv.className = 'date-separator';
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    let dateText;
    if (isSameDay(date, today)) {
        dateText = 'Today';
    } else if (isSameDay(date, yesterday)) {
        dateText = 'Yesterday';
    } else {
        dateText = date.toLocaleDateString([], { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }
    
    separatorDiv.innerHTML = `<span>${dateText}</span>`;
    chatMessages.appendChild(separatorDiv);
}

// Simple message sending functionality (for demo purposes)
function addMessage(text, isSent = true) {
    if (!currentConversation) {
        alert('Please select a conversation first');
        return;
    }
    
    const now = new Date();
    
    // Add date separator if this is the first message or if day changed
    const lastMessage = chatMessages.lastElementChild;
    if (!lastMessage || lastMessage.classList.contains('date-separator')) {
        addDateSeparator(now);
    } else {
        const lastMessageTime = lastMessage.querySelector('.message-time');
        if (lastMessageTime) {
            // This is a simplified check - in a real app you'd store the actual date
            const lastDate = new Date(); // This would be the actual last message date
            if (!isSameDay(lastDate, now)) {
                addDateSeparator(now);
            }
        }
    }
    
    addMessageToChat(text, isSent, now);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendMessage() {
    const text = messageInput.value.trim();
    if (text && currentConversation) {
        addMessage(text, true);
        messageInput.value = '';
        
        // Simulate a response after 1 second
        setTimeout(() => {
            addMessage('Message received! This is where VMG thread data would appear.', false);
        }, 1000);
    } else if (!currentConversation) {
        alert('Please select a conversation first');
    }
}

// Drag and Drop functionality for text files
function setupDragAndDrop() {
    const appContainer = document.querySelector('.app-container');
    
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        appContainer.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });
    
    // Highlight drop area when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
        appContainer.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        appContainer.addEventListener(eventName, unhighlight, false);
    });
    
    // Handle dropped files
    appContainer.addEventListener('drop', handleDrop, false);
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlight(e) {
    const appContainer = document.querySelector('.app-container');
    appContainer.classList.add('drag-over');
}

function unhighlight(e) {
    const appContainer = document.querySelector('.app-container');
    appContainer.classList.remove('drag-over');
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    
    for (const file of files) {
        // Check if it's a text file
        if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.vmg')) {
            sendNotification(`📁 File dropped: ${file.name}`);
            
            const reader = new FileReader();
            reader.onload = function(e) {
                const msg = VmgMessage.parse(e.target.result, file.name, VmgMessageType.INCOMING);

                messageRepository.saveMessage(msg);
                
                if (!currentConversation) {
                    const conversationKey = messageRepository.getConversationKey(msg);
                    selectConversation(conversationKey);
                }
            };
            
            reader.onerror = function() {
                sendNotification(`❌ Error reading file: ${file.name}`);
            };
            
            reader.readAsText(file, 'utf-16');
        } else {
            sendNotification(`❌ Please drop a text file (.txt, .vmg, or plain text). Received: ${file.type}`, false);
        }
    }

    // Refresh conversations and select the new one if no conversation is selected
    renderConversations();
}

// Settings Panel Functions
function openSettingsPanel() {
    console.log('Opening settings panel...');
    console.log('Settings panel element:', settingsPanel);
    console.log('Settings panel classes:', settingsPanel.classList);
    
    settingsPanel.classList.add('open');
    updateStorageStats();
    
    console.log('Settings panel classes after opening:', settingsPanel.classList);
}

function closeSettingsPanel() {
    console.log('Closing settings panel...');
    settingsPanel.classList.remove('open');
}

function updateStorageStats() {
    console.log('Updating storage stats...');
    const stats = messageRepository.getStats();
    console.log('Stats:', stats);
    
    totalMessagesEl.textContent = stats.totalMessages;
    totalConversationsEl.textContent = stats.totalConversations;
    totalContactsEl.textContent = stats.totalContacts;
}

function deleteAllConversations() {
    console.log('Delete all conversations clicked');
    const confirmed = confirm('Are you sure you want to delete all conversations, messages, and contacts? This action cannot be undone.');
    
    if (confirmed) {
        try {
            messageRepository.clearAll();
            
            // Clear current conversation
            currentConversation = null;
            
            // Update UI
            renderConversations();
            chatMessages.innerHTML = `
                <div class="message received">
                    <div class="message-content">
                        <p>Welcome to VMG Thread Viewer! 👋</p>
                        <span class="message-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                </div>
                
                <div class="message sent">
                    <div class="message-content">
                        <p>All conversations have been deleted. Drop VMG files to get started.</p>
                        <span class="message-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                </div>
            `;
            
            // Update header
            currentConversationTitle.textContent = 'VMG Thread Viewer';
            currentConversationStatus.textContent = 'Select a conversation';
            
            // Update settings stats
            updateStorageStats();
            
            // Close settings panel
            closeSettingsPanel();
            
            // Show success notification
            sendNotification('✅ All conversations have been deleted successfully');
            
        } catch (error) {
            console.error('Error deleting all conversations:', error);
            sendNotification('❌ Error deleting conversations. Please try again.');
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

refreshConversationsBtn.addEventListener('click', () => {
    renderConversations();
});

// Settings panel event listeners
console.log('Setting up settings panel event listeners...');
console.log('Settings button:', settingsBtn);
console.log('Close button:', closeSettingsBtn);
console.log('Delete all button:', deleteAllBtn);

settingsBtn.addEventListener('click', () => {
    console.log('Settings button clicked!');
    openSettingsPanel();
});

closeSettingsBtn.addEventListener('click', () => {
    console.log('Close button clicked!');
    closeSettingsPanel();
});

deleteAllBtn.addEventListener('click', () => {
    console.log('Delete all button clicked!');
    deleteAllConversations();
});

// Close settings panel when clicking outside
document.addEventListener('click', (e) => {
    if (settingsPanel.classList.contains('open') && 
        !settingsPanel.contains(e.target) && 
        !settingsBtn.contains(e.target)) {
        closeSettingsPanel();
    }
});

// Close settings panel with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && settingsPanel.classList.contains('open')) {
        closeSettingsPanel();
    }
});

function sendNotification(message) {
    console.log(message);
}

// Initialize
console.log('Initializing VMG Thread Viewer...');
console.log('Settings panel elements found:');
console.log('- Settings button:', settingsBtn);
console.log('- Settings panel:', settingsPanel);
console.log('- Close button:', closeSettingsBtn);
console.log('- Delete all button:', deleteAllBtn);
console.log('- Total messages element:', totalMessagesEl);
console.log('- Total conversations element:', totalConversationsEl);
console.log('- Total contacts element:', totalContactsEl);

setupDragAndDrop();
renderConversations();