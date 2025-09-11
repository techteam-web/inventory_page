const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const floorsRouter = require("./routes/floors");

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 4000;

// ✅ CORRECTED: Handle both ports 3000 and 5173 for React
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:5173'];

// Security middleware
app.use(helmet());

// ✅ EXPRESS CORS CONFIGURATION
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST"],
  credentials: true
}));

app.use(express.json());

// ✅ SOCKET.IO WITH MATCHING CORS CONFIGURATION
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// ✅ PASS IO INSTANCE TO FLOORS ROUTER
floorsRouter.setSocketIO(io);

// Routes
app.use("/api/floors", floorsRouter);

// Health check
app.get("/health", (req, res) => {
  res.json({ 
    status: "OK", 
    connectedClients: io.engine.clientsCount,
    timestamp: new Date().toISOString(),
    allowedOrigins: allowedOrigins
  });
});

// ⚡ WebSocket Connection Handling
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id} (Total: ${io.engine.clientsCount})`);
  
  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id} (Total: ${io.engine.clientsCount})`);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    error: "Something went wrong!",
    timestamp: new Date().toISOString()
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🏢 Floors API: http://localhost:${PORT}/api/floors`);
  console.log(`⚡ WebSocket server ready for real-time updates`);
  console.log(`🌐 Allowed origins: ${allowedOrigins.join(', ')}`);
});
