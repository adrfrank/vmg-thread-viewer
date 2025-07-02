# VMG Thread Viewer

A simple web application for viewing VMG (Voice Message) files in a chat-like interface.

## Features

- View VMG messages in a chat format
- Automatic contact management
- Group messages by conversation
- Local storage for data persistence
- Export/import functionality

## Quick Start

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the server: `npm start`
4. Open `http://localhost:3000` in your browser

## How it Works

The app parses VMG files and displays them as conversations. Messages are automatically grouped by phone number, and contacts are created for each unique number.

### Basic Usage

```javascript
// Initialize the message repository
const repository = new MessageRepository();

// Parse and save a VMG message
const message = VmgMessage.parse(vmgContent, VmgMessageType.INCOMING);
repository.saveMessage(message);

// Get messages for a conversation
const messages = repository.getMessagesByConversation('+1234567890');
```

## File Structure

```
vmg-thread-viewer/
├── index.js                 # Express server
├── public/
│   ├── index.html          # Main HTML file
│   ├── script.js           # Main application script
│   ├── vmgMessages.js      # VMG message parser
│   └── js/
│       └── message-repository.js  # Message storage system
└── README.md
```

## Data Storage

All data is stored locally in your browser using localStorage. This means:
- Data persists between sessions
- No server-side database required
- Data is specific to your browser/domain 