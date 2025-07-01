/**
 * Demo/Example usage of MessageRepository
 * This file demonstrates how to use the MessageRepository class
 */

// Example usage function
function demonstrateMessageRepository() {
    console.log('Starting MessageRepository demo...');
    
    // Initialize the repository
    const repository = new MessageRepository();
    
    // Example VMG message content (incoming)
    const incomingVmgContent = `BEGIN:VCARD
VERSION:2.1
N:;John Doe;;;
FN:John Doe
TEL:+1234567890
END:VCARD
BEGIN:VENV
BEGIN:VBODY
Date:15.12.2023 14:30:25
Hello! How are you doing today?
END:VBODY
END:VENV`;
    
    // Example VMG message content (outgoing)
    const outgoingVmgContent = `BEGIN:VCARD
VERSION:2.1
N:;Jane Smith;;;
FN:Jane Smith
TEL:+0987654321
END:VCARD
BEGIN:VENV
BEGIN:VBODY
Date:15.12.2023 15:45:10
I'm doing great, thanks for asking!
END:VBODY
END:VENV`;
    
    try {
        // Parse and save incoming message
        const incomingMessage = VmgMessage.parse(incomingVmgContent, VmgMessageType.INCOMING);
        repository.saveMessage(incomingMessage);
        console.log('Saved incoming message:', incomingMessage.toString());
        
        // Parse and save outgoing message
        const outgoingMessage = VmgMessage.parse(outgoingVmgContent, VmgMessageType.OUTGOING);
        repository.saveMessage(outgoingMessage);
        console.log('Saved outgoing message:', outgoingMessage.toString());
        
        // Add more messages to the same conversation
        const anotherIncomingContent = `BEGIN:VCARD
VERSION:2.1
N:;John Doe;;;
FN:John Doe
TEL:+1234567890
END:VCARD
BEGIN:VENV
BEGIN:VBODY
Date:15.12.2023 16:20:15
Can we meet tomorrow?
END:VBODY
END:VENV`;
        
        const anotherIncomingMessage = VmgMessage.parse(anotherIncomingContent, VmgMessageType.INCOMING);
        repository.saveMessage(anotherIncomingMessage);
        
        // Demonstrate retrieving data
        console.log('\n--- Repository Data ---');
        
        // Get all conversations
        const conversations = repository.getAllConversations();
        console.log('All conversations:', conversations);
        
        // Get messages for a specific conversation
        const johnMessages = repository.getMessagesByConversation('+1234567890');
        console.log('Messages with John (+1234567890):', johnMessages.length, 'messages');
        
        // Get all contacts
        const contacts = repository.getAllContacts();
        console.log('All contacts:', contacts);
        
        // Update contact name
        repository.updateContactName('+1234567890', 'John Doe (Updated)');
        console.log('Updated contact name for +1234567890');
        
        // Get storage statistics
        const stats = repository.getStats();
        console.log('Storage stats:', stats);
        
        // Demonstrate conversation retrieval
        console.log('\n--- Conversation Details ---');
        conversations.forEach(conversation => {
            const contact = repository.getContact(conversation.phoneNumber);
            const messages = repository.getMessagesByConversation(conversation.phoneNumber);
            
            console.log(`Conversation with ${contact ? contact.name : conversation.phoneNumber}:`);
            console.log(`  - Phone: ${conversation.phoneNumber}`);
            console.log(`  - Messages: ${conversation.messageCount}`);
            console.log(`  - Last message: ${conversation.lastMessageAt}`);
            console.log(`  - Actual messages: ${messages.length}`);
        });
        
    } catch (error) {
        console.error('Error in demo:', error);
    }
}

// Function to test bulk operations
function testBulkOperations() {
    console.log('\n--- Testing Bulk Operations ---');
    
    const repository = new MessageRepository();
    
    // Create multiple test messages
    const testMessages = [
        {
            content: `BEGIN:VCARD
VERSION:2.1
N:;Alice;;;
FN:Alice
TEL:+1111111111
END:VCARD
BEGIN:VENV
BEGIN:VBODY
Date:15.12.2023 10:00:00
Hi there!
END:VBODY
END:VENV`,
            type: VmgMessageType.INCOMING
        },
        {
            content: `BEGIN:VCARD
VERSION:2.1
N:;Bob;;;
FN:Bob
TEL:+2222222222
END:VCARD
BEGIN:VENV
BEGIN:VBODY
Date:15.12.2023 11:00:00
Hello Bob!
END:VBODY
END:VENV`,
            type: VmgMessageType.OUTGOING
        },
        {
            content: `BEGIN:VCARD
VERSION:2.1
N:;Alice;;;
FN:Alice
TEL:+1111111111
END:VCARD
BEGIN:VENV
BEGIN:VBODY
Date:15.12.2023 12:00:00
How are you?
END:VBODY
END:VENV`,
            type: VmgMessageType.INCOMING
        }
    ];
    
    // Save all messages
    testMessages.forEach((msgData, index) => {
        try {
            const message = VmgMessage.parse(msgData.content, msgData.type);
            repository.saveMessage(message);
            console.log(`Saved test message ${index + 1}`);
        } catch (error) {
            console.error(`Error saving test message ${index + 1}:`, error);
        }
    });
    
    // Show results
    console.log('Total messages:', repository.getAllMessages().length);
    console.log('Total conversations:', repository.getAllConversations().length);
    console.log('Total contacts:', repository.getAllContacts().length);
}

// Function to demonstrate data export/import
function testDataExportImport() {
    console.log('\n--- Testing Data Export/Import ---');
    
    const repository = new MessageRepository();
    
    // Export current data
    const exportedData = repository.exportData();
    console.log('Exported data structure:', Object.keys(exportedData));
    console.log('Export timestamp:', exportedData.exportedAt);
    
    // Clear all data
    repository.clearAll();
    console.log('Cleared all data');
    
    // Import data back
    repository.importData(exportedData);
    console.log('Imported data back');
    
    // Verify data is restored
    console.log('Messages after import:', repository.getAllMessages().length);
    console.log('Conversations after import:', repository.getAllConversations().length);
    console.log('Contacts after import:', repository.getAllContacts().length);
}

// Auto-run demo when page loads (if this script is included)
if (typeof window !== 'undefined' && window.MessageRepository) {
    // Wait a bit for other scripts to load
    setTimeout(() => {
        console.log('=== MessageRepository Demo ===');
        demonstrateMessageRepository();
        testBulkOperations();
        testDataExportImport();
        console.log('=== Demo Complete ===');
    }, 1000);
}

// Export functions for manual testing
window.demonstrateMessageRepository = demonstrateMessageRepository;
window.testBulkOperations = testBulkOperations;
window.testDataExportImport = testDataExportImport; 