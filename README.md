# Kanban Board

A simple Kanban board app with real-time updates. Built with React, TypeScript, and Socket.IO.

## What it does

- Create columns and tasks
- Drag and drop tasks between columns
- Real-time updates when multiple people use it
- See who's online

## Tech

- React + TypeScript
- Zustand for state
- Socket.IO for real-time
- Custom CSS (no frameworks)

## Quick start

1. Install frontend deps:
```bash
npm install
npm run dev
```

2. Install backend deps:
```bash
cd server
npm install
npm run dev
```

3. Open http://localhost:5173

## How it works

- Frontend runs on port 5173
- Backend runs on port 3001
- Socket.IO handles real-time updates
- Drag and drop uses @dnd-kit


## Development

- `npm run dev` - Start frontend

