# CoLab

A real-time collaborative code editor with project synchronization and live named user cursors.


## Table of Contents
- [About](#about)
- [Features](#features)
- [Demo](#demo)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Configuration](#configuration)
- [Project Structure](#project-structure)
- [Running Tests](#running-tests)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)
- [Acknowledgements](#acknowledgements)

## About
CoLab is a real-time collaborative code editor for developers and teams. It solves the problem of friction in remote pair programming by allowing anyone to share an entire project and folder tree via a single invite link. With live named cursors, Monaco Editor, and in-browser code execution, teammates can build and run code together seamlessly.

## Features
- **Real-Time Editing**: Concurrent code editing with Monaco Editor & Yjs.
- **Full Project Sharing**: Share whole folders and multiple files via invite link.
- **Named Cursors**: See collaborators' names and colored flags on their cursors.
- **Run Code**: Run JavaScript directly in the browser with live console output.

## Demo
Live demo: `http://localhost:5173`

## Getting Started

### Prerequisites
- Node.js >= 18
- npm or yarn

### Installation

# 1. Clone repository
git clone https://github.com/heypratap/CoLab
cd colab

# 2. Install dependencies
cd backend && npm install
cd ../frontend && npm install
cd ..


## Usage

# Terminal 1: Run Backend (port 5000)
cd backend && npm run dev

# Terminal 2: Run Frontend (port 5173)
cd frontend && npm run dev


1. Open `http://localhost:5173` in your browser.
2. Click **Invite** to copy your project link and share it with collaborators.

## Configuration
| Variable | Description | Default | Required |
| :--- | :--- | :--- | :--- |
| `PORT` | Backend server port | `5000` | No |

## Project Structure

colab/
├── backend/    # Express + Socket.io + Yjs WebSocket server          
│   ├── server.js
│   └── package.json
├── frontend/         # React + Vite + Monaco Editor
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   └── App.jsx
│   └── package.json
└── README.md


## Running Tests
cd frontend
npm run dev


## Contributing
1. Fork the project
2. Create your branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -m "Add new feature"`)
4. Push to branch (`git push origin feature/new-feature`)
5. Open a Pull Request

## License
Distributed under the MIT License.

## Contact
Project Link: [https://github.com/heypratap/CoLab](https://github.com/heypratap/CoLab)

## Acknowledgements
- [Yjs](https://github.com/yjs/yjs)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- [Socket.io](https://socket.io/)
- [Vite](https://vite.dev/)
