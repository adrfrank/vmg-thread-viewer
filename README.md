# VMG Thread Viewer

A web application for viewing and managing VMG (Voice Message) files in a chat-like interface.

## Features

- **Message Repository**: Local storage system for VMG messages, contacts, and conversations
- **Contact Management**: Automatic contact creation and management
- **Conversation Grouping**: Messages are grouped by phone number (conversation key)
- **Data Persistence**: All data is stored locally using browser localStorage
- **Export/Import**: Backup and restore functionality

## Message Repository

The `MessageRepository` class provides a complete local storage solution for VMG messages with the following capabilities:

### Core Features

- **Message Storage**: Save and retrieve VMG messages
- **Contact Management**: Automatic contact creation from phone numbers
- **Conversation Grouping**: Messages are grouped by the other party's phone number
- **Data Persistence**: Uses browser localStorage for data persistence

### Key Methods

#### Message Operations
- `saveMessage(message)` - Save a VMG message and automatically create contacts/conversations
- `getAllMessages()` - Retrieve all stored messages
- `getMessagesByConversation(phoneNumber)` - Get messages for a specific conversation
- `deleteMessage(messageId)` - Delete a specific message

#### Contact Operations
- `saveContact(number, name)` - Save or update a contact
- `getAllContacts()` - Get all contacts
- `getContact(phoneNumber)` - Get a specific contact
- `updateContactName(phoneNumber, name)` - Update contact name

#### Conversation Operations
- `getAllConversations()` - Get all conversations
- `getConversation(phoneNumber)` - Get a specific conversation
- `deleteConversation(phoneNumber)` - Delete a conversation and all its messages

#### Data Management
- `exportData()` - Export all data as JSON
- `importData(data)` - Import data from JSON
- `clearAll()` - Clear all stored data
- `getStats()` - Get storage statistics

### Usage Example

```javascript
// Initialize the repository
const repository = new MessageRepository();

// Parse and save a VMG message
const vmgContent = `BEGIN:VCARD
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

const message = VmgMessage.parse(vmgContent, VmgMessageType.INCOMING);
repository.saveMessage(message);

// Get messages for a conversation
const messages = repository.getMessagesByConversation('+1234567890');

// Get all conversations
const conversations = repository.getAllConversations();

// Update contact name
repository.updateContactName('+1234567890', 'John Doe (Updated)');
```

### Data Structure

#### Message Object
```javascript
{
    id: "unique_id",
    message: "Message content",
    sender: "+1234567890",
    receiver: "Me",
    datetime: Date,
    nkdatetime: Date,
    type: "INCOMING" | "OUTGOING",
    filename: "message.vmg",
    storedAt: "2023-12-15T14:30:25.000Z"
}
```

#### Contact Object
```javascript
{
    id: "unique_id",
    number: "+1234567890",
    name: "John Doe",
    createdAt: "2023-12-15T14:30:25.000Z"
}
```

#### Conversation Object
```javascript
{
    id: "unique_id",
    phoneNumber: "+1234567890",
    createdAt: "2023-12-15T14:30:25.000Z",
    lastMessageAt: "2023-12-15T16:20:15.000Z",
    messageCount: 3
}
```

### Conversation Key Logic

The conversation key is determined by the message type:
- **INCOMING messages**: Conversation key = `sender` (the person who sent the message)
- **OUTGOING messages**: Conversation key = `receiver` (the person who received the message)

This ensures that all messages between you and a specific contact are grouped together in the same conversation.

### Automatic Contact Creation

Every time a message is saved:
1. Phone numbers are extracted from sender and receiver fields
2. New contacts are automatically created for unknown phone numbers
3. Contact names default to "Contact {phoneNumber}" if no name is provided
4. Existing contacts are updated if a name is provided

### Browser Compatibility

The MessageRepository uses browser localStorage, which is supported by all modern browsers. Data persists between browser sessions but is specific to the domain.

### Demo

The project includes a demo file (`message-repository-demo.js`) that demonstrates all the main features. Open the browser console to see the demo output.

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the server: `npm start`
4. Open `http://localhost:3000` in your browser
5. Open the browser console to see the demo output

## File Structure

```
vmg-thread-viewer/
├── index.js                 # Express server
├── package.json            # Dependencies
├── public/
│   ├── index.html          # Main HTML file
│   ├── styles.css          # CSS styles
│   ├── script.js           # Main application script
│   ├── vmgMessages.js      # VMG message parser
│   └── js/
│       ├── message-repository.js      # Message repository class
│       └── message-repository-demo.js # Demo/example usage
└── README.md               # This file
``` 