/**
 * Message Repository for local storage of VMG messages, contacts, and conversations
 */
class MessageRepository {
    constructor() {
        this.storageKeys = {
            messages: 'vmg_messages',
            contacts: 'vmg_contacts',
            conversations: 'vmg_conversations'
        };
        this.initializeStorage();
    }

    /**
     * Initialize storage if it doesn't exist
     */
    initializeStorage() {
        if (!localStorage.getItem(this.storageKeys.messages)) {
            localStorage.setItem(this.storageKeys.messages, JSON.stringify([]));
        }
        if (!localStorage.getItem(this.storageKeys.contacts)) {
            localStorage.setItem(this.storageKeys.contacts, JSON.stringify([]));
        }
        if (!localStorage.getItem(this.storageKeys.conversations)) {
            localStorage.setItem(this.storageKeys.conversations, JSON.stringify([]));
        }
    }

    /**
     * Save a message and automatically create/update contacts and conversations
     * @param {VmgMessage} message - The message to save
     */
    saveMessage(message) {
        if (!message || !(message instanceof VmgMessage)) {
            throw new Error('Invalid message object');
        }

        // Get existing messages
        const messages = this.getAllMessages();
        
        // Add unique ID to message if it doesn't have one
        if (!message.id) {
            message.id = this.generateId();
        }
        
        // Add timestamp if not present
        if (!message.storedAt) {
            message.storedAt = new Date().toISOString();
        }

        // Save message
        messages.push(message);
        localStorage.setItem(this.storageKeys.messages, JSON.stringify(messages));

        // Extract phone numbers and save contacts
        const phoneNumbers = this.extractPhoneNumbers(message);
        phoneNumbers.forEach(number => {
            this.saveContact(number, message.filename.split('_')[0]);
        });

        // Save conversation
        this.saveConversation(message);

        return message;
    }

    /**
     * Extract phone numbers from a message (sender and receiver)
     * @param {VmgMessage} message 
     * @returns {string[]} Array of phone numbers
     */
    extractPhoneNumbers(message) {
        const numbers = [];
        
        // Add sender if it's a phone number (not 'Me')
        if (message.sender && message.sender !== 'Me') {
            numbers.push(message.sender);
        }
        
        // Add receiver if it's a phone number (not 'Me')
        if (message.receiver && message.receiver !== 'Me') {
            numbers.push(message.receiver);
        }
        
        return [...new Set(numbers)]; // Remove duplicates
    }

    /**
     * Get conversation key from message (phone number of the other party)
     * @param {VmgMessage} message 
     * @returns {string} Phone number
     */
    getConversationKey(message) {
        if (message.type === VmgMessageType.INCOMING) {
            return message.sender;
        } else {
            return message.receiver;
        }
    }

    /**
     * Save a contact
     * @param {string} number - Phone number
     * @param {string} name - Contact name (optional)
     */
    saveContact(number, name = null) {
        if (!number) return;

        const contacts = this.getAllContacts();
        const existingContact = contacts.find(c => c.number === number);
        
        if (existingContact) {
            // Update existing contact if name is provided
            if (name && name.trim()) {
                existingContact.name = name.trim();
                localStorage.setItem(this.storageKeys.contacts, JSON.stringify(contacts));
            }
        } else {
            // Create new contact
            const newContact = {
                id: this.generateId(),
                number: number,
                name: name ? name.trim() : `Contact ${number}`,
                createdAt: new Date().toISOString()
            };
            contacts.push(newContact);
            localStorage.setItem(this.storageKeys.contacts, JSON.stringify(contacts));
        }
    }

    /**
     * Save conversation metadata
     * @param {VmgMessage} message 
     */
    saveConversation(message) {
        const conversationKey = this.getConversationKey(message);
        if (!conversationKey) return;

        const conversations = this.getAllConversations();
        const existingConversation = conversations.find(c => c.phoneNumber === conversationKey);
        
        if (existingConversation) {
            // Update existing conversation
            existingConversation.lastMessageAt = message.datetime ? message.datetime.toISOString() : new Date().toISOString();
            existingConversation.messageCount = this.getMessagesByConversation(conversationKey).length;
        } else {
            // Create new conversation
            const newConversation = {
                id: this.generateId(),
                phoneNumber: conversationKey,
                createdAt: new Date().toISOString(),
                lastMessageAt: message.datetime ? message.datetime.toISOString() : new Date().toISOString(),
                messageCount: 1
            };
            conversations.push(newConversation);
        }
        
        localStorage.setItem(this.storageKeys.conversations, JSON.stringify(conversations));
    }

    /**
     * Get all messages
     * @returns {VmgMessage[]}
     */
    getAllMessages() {
        const messagesData = localStorage.getItem(this.storageKeys.messages);
        const messages = JSON.parse(messagesData || '[]');
        
        // Convert back to VmgMessage objects
        return messages.map(msgData => {
            const msg = new VmgMessage(
                msgData.id,
                msgData.message,
                msgData.sender,
                msgData.receiver,
                msgData.datetime ? new Date(msgData.datetime) : null,
                msgData.nkdatetime ? new Date(msgData.nkdatetime) : null,
                msgData.filename,
                msgData.type
            );
            // Restore additional properties
            Object.assign(msg, {
                storedAt: msgData.storedAt
            });
            return msg;
        });
    }

    /**
     * Get messages by conversation (phone number)
     * @param {string} phoneNumber 
     * @returns {VmgMessage[]}
     */
    getMessagesByConversation(phoneNumber) {
        const allMessages = this.getAllMessages();
        return allMessages.filter(message => {
            const conversationKey = this.getConversationKey(message);
            return conversationKey === phoneNumber;
        }).sort((a, b) => {
            // Sort by datetime (oldest first)
            const dateA = a.datetime || new Date(0);
            const dateB = b.datetime || new Date(0);
            return dateA - dateB;
        });
    }

    /**
     * Get all conversations
     * @returns {Array} Array of conversation objects
     */
    getAllConversations() {
        const conversationsData = localStorage.getItem(this.storageKeys.conversations);
        return JSON.parse(conversationsData || '[]');
    }

    /**
     * Get conversation by phone number
     * @param {string} phoneNumber 
     * @returns {Object|null}
     */
    getConversation(phoneNumber) {
        const conversations = this.getAllConversations();
        return conversations.find(c => c.phoneNumber === phoneNumber) || null;
    }

    /**
     * Get all contacts
     * @returns {Array} Array of contact objects
     */
    getAllContacts() {
        const contactsData = localStorage.getItem(this.storageKeys.contacts);
        return JSON.parse(contactsData || '[]');
    }

    /**
     * Get contact by phone number
     * @param {string} phoneNumber 
     * @returns {Object|null}
     */
    getContact(phoneNumber) {
        const contacts = this.getAllContacts();
        return contacts.find(c => c.number === phoneNumber) || null;
    }

    /**
     * Update contact name
     * @param {string} phoneNumber 
     * @param {string} name 
     */
    updateContactName(phoneNumber, name) {
        if (!phoneNumber || !name) return false;
        
        const contacts = this.getAllContacts();
        const contact = contacts.find(c => c.number === phoneNumber);
        
        if (contact) {
            contact.name = name.trim();
            localStorage.setItem(this.storageKeys.contacts, JSON.stringify(contacts));
            return true;
        }
        
        return false;
    }

    /**
     * Delete a message
     * @param {string} messageId 
     */
    deleteMessage(messageId) {
        const messages = this.getAllMessages();
        const filteredMessages = messages.filter(msg => msg.id !== messageId);
        localStorage.setItem(this.storageKeys.messages, JSON.stringify(filteredMessages));
        
        // Rebuild conversations after deletion
        this.rebuildConversations();
    }

    /**
     * Delete a conversation and all its messages
     * @param {string} phoneNumber 
     */
    deleteConversation(phoneNumber) {
        const messages = this.getAllMessages();
        const filteredMessages = messages.filter(msg => {
            const conversationKey = this.getConversationKey(msg);
            return conversationKey !== phoneNumber;
        });
        localStorage.setItem(this.storageKeys.messages, JSON.stringify(filteredMessages));
        
        // Remove conversation from conversations list
        const conversations = this.getAllConversations();
        const filteredConversations = conversations.filter(c => c.phoneNumber !== phoneNumber);
        localStorage.setItem(this.storageKeys.conversations, JSON.stringify(filteredConversations));
    }

    /**
     * Rebuild conversations metadata (useful after bulk operations)
     */
    rebuildConversations() {
        const messages = this.getAllMessages();
        const conversationMap = new Map();
        
        messages.forEach(message => {
            const conversationKey = this.getConversationKey(message);
            if (!conversationKey) return;
            
            if (!conversationMap.has(conversationKey)) {
                conversationMap.set(conversationKey, {
                    id: this.generateId(),
                    phoneNumber: conversationKey,
                    createdAt: message.storedAt || new Date().toISOString(),
                    lastMessageAt: message.datetime ? message.datetime.toISOString() : new Date().toISOString(),
                    messageCount: 0
                });
            }
            
            const conversation = conversationMap.get(conversationKey);
            conversation.messageCount++;
            
            if (message.datetime) {
                const messageDate = new Date(message.datetime);
                const lastDate = new Date(conversation.lastMessageAt);
                if (messageDate > lastDate) {
                    conversation.lastMessageAt = message.datetime.toISOString();
                }
            }
        });
        
        const conversations = Array.from(conversationMap.values());
        localStorage.setItem(this.storageKeys.conversations, JSON.stringify(conversations));
    }

    /**
     * Clear all data
     */
    clearAll() {
        localStorage.removeItem(this.storageKeys.messages);
        localStorage.removeItem(this.storageKeys.contacts);
        localStorage.removeItem(this.storageKeys.conversations);
        this.initializeStorage();
    }

    /**
     * Get storage statistics
     * @returns {Object}
     */
    getStats() {
        const messages = this.getAllMessages();
        const contacts = this.getAllContacts();
        const conversations = this.getAllConversations();
        
        return {
            totalMessages: messages.length,
            totalContacts: contacts.length,
            totalConversations: conversations.length,
            storageSize: JSON.stringify(messages).length + 
                        JSON.stringify(contacts).length + 
                        JSON.stringify(conversations).length
        };
    }

    /**
     * Generate a unique ID
     * @returns {string}
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Export all data as JSON
     * @returns {Object}
     */
    exportData() {
        return {
            messages: this.getAllMessages(),
            contacts: this.getAllContacts(),
            conversations: this.getAllConversations(),
            exportedAt: new Date().toISOString()
        };
    }

    /**
     * Import data from JSON
     * @param {Object} data 
     */
    importData(data) {
        if (data.messages) {
            localStorage.setItem(this.storageKeys.messages, JSON.stringify(data.messages));
        }
        if (data.contacts) {
            localStorage.setItem(this.storageKeys.contacts, JSON.stringify(data.contacts));
        }
        if (data.conversations) {
            localStorage.setItem(this.storageKeys.conversations, JSON.stringify(data.conversations));
        }
        
        // Rebuild conversations to ensure consistency
        this.rebuildConversations();
    }
}

// Export for browser environment
window.MessageRepository = MessageRepository;
