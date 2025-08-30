# Testing Real-Time Collaboration

## 🚀 Quick Start

1. **Start the backend server:**
   ```bash
   cd server
   npm run dev
   ```
   You should see: `🚀 Server running on port 3001` and `📡 Socket.IO server ready for real-time connections`

2. **Start the frontend (in a new terminal):**
   ```bash
   npm run dev
   ```
   Frontend will run on http://localhost:5173

3. **Open multiple browser tabs/windows:**
   - Tab 1: http://localhost:5173
   - Tab 2: http://localhost:5173
   - Tab 3: http://localhost:5173

## 🔍 What to Look For

### **Connection Status Indicator:**
- 🟢 **Green**: Connected to server
- 🟡 **Yellow**: Connecting...
- 🔴 **Red**: Disconnected

### **User Count:**
- Should show "1 user online" in first tab
- Should show "2 users online" when second tab opens
- Should show "3 users online" when third tab opens

### **Real-Time Updates:**
1. **Create a task** in Tab 1
2. **Watch it appear** in Tab 2 and Tab 3 instantly
3. **Edit the task** in Tab 2
4. **See changes** in Tab 1 and Tab 3 instantly
5. **Move the task** in Tab 3
6. **See the move** in Tab 1 and Tab 2 instantly

## 🐛 Troubleshooting

### **If collaboration isn't working:**

1. **Check backend console:**
   - Should show "User connected. Total users: X"
   - Should show "Broadcasting createTask:", etc.

2. **Check frontend console:**
   - Should show "✅ Connected to Socket.IO server"
   - Should show "📡 Listening for createTask events"

3. **Check connection status:**
   - Should show "Connected" (green dot)
   - User count should increase with each new tab

4. **Common issues:**
   - Backend not running (check port 3001)
   - CORS issues (check browser console for errors)
   - Network blocking (check firewall/antivirus)

## 📱 Testing Scenarios

### **Basic Collaboration:**
- Create columns and tasks
- Edit task details
- Move tasks between columns
- Delete tasks and columns

### **Advanced Features:**
- Test undo/redo across tabs
- Test column reordering
- Test task assignments and due dates
- Test priority changes

### **Edge Cases:**
- Close one tab (user count should decrease)
- Refresh a tab (should reconnect automatically)
- Test with slow network (should show reconnection attempts)

## 🎯 Expected Behavior

- **Instant updates** across all tabs
- **User count accuracy** (matches number of open tabs)
- **No data loss** during operations
- **Smooth reconnection** if connection drops
- **Console logging** for debugging

## 🔧 Debug Mode

Open browser console to see:
- Connection status messages
- Event emissions and receptions
- User connection/disconnection events
- Any errors or warnings
