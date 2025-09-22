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

// Increase server timeouts
server.keepAliveTimeout = 120000; // 2 minutes
server.headersTimeout = 125000;   // Slightly higher than keepAlive
server.timeout = 120000;          // 2 minutes request timeout

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:5173'];

app.use(helmet());

app.use(cors({
  origin: function (origin, callback) {
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

app.use(express.json({ limit: '10mb' })); // Increase payload limit

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  },
  pingTimeout: 60000,    // 1 minute
  pingInterval: 25000,   // 25 seconds
  upgradeTimeout: 30000, // 30 seconds
  allowEIO3: true
});

floorsRouter.setSocketIO(io);

// Add request timeout middleware
app.use((req, res, next) => {
  req.setTimeout(115000); // 115 seconds
  res.setTimeout(115000);
  next();
});

app.use("/api/floors", floorsRouter);

// Enhanced health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    connectedClients: io.engine.clientsCount,
    timestamp: new Date().toISOString(),
    allowedOrigins: allowedOrigins,
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id} (Total: ${io.engine.clientsCount})`);
  
  // Send connection confirmation with timeout
  socket.emit('connected', {
    message: 'WebSocket connected successfully',
    timestamp: new Date().toISOString()
  });

  socket.on('disconnect', (reason) => {
    console.log(`🔌 Client disconnected: ${socket.id} (Reason: ${reason}) (Total: ${io.engine.clientsCount})`);
  });

  socket.on('error', (error) => {
    console.error(`🔌 Socket error for ${socket.id}:`, error);
  });
});

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
  console.log(`⏱️  Request timeout: 115s, Keep-alive: 120s`);
});
