const express = require("express");
const NodeCache = require("node-cache");
const googleSheetsService = require("../services/googleSheetsService");
const floors = require("../data/floors.json");

const router = express.Router();

// Cache configuration
const cache = new NodeCache({ 
  stdTTL: 300,      
  checkperiod: 60   
});

// ✅ STORE IO INSTANCE GLOBALLY IN THIS MODULE
let ioInstance = null;
let backgroundRefreshInterval = null;
let lastDataHash = null;

// ✅ FUNCTION TO SET IO INSTANCE FROM SERVER
const setSocketIO = (io) => {
  ioInstance = io;
  startBackgroundRefresh();
};

// ✅ CORRECTED BACKGROUND REFRESH FUNCTION
const startBackgroundRefresh = () => {
  if (backgroundRefreshInterval) {
    clearInterval(backgroundRefreshInterval);
  }

  backgroundRefreshInterval = setInterval(async () => {
    try {
      console.log('🔄 Background refresh started');
      const freshData = await googleSheetsService.getFloors();
      
      // Create hash to detect changes
      const currentDataHash = JSON.stringify(freshData);
      
      if (currentDataHash !== lastDataHash) {
        console.log('🔥 Data changed! Broadcasting to all clients...');
        
        // Update cache
        cache.set('floors', freshData);
        cache.set('last_refresh_time', new Date().toISOString());
        
        // ✅ CORRECTED: Use ioInstance directly, not router.get()
        if (ioInstance) {
          ioInstance.emit('floorsUpdated', {
            data: freshData,
            source: 'google_sheets',
            timestamp: new Date().toISOString(),
            count: freshData.length
          });
          
          console.log(`✅ Broadcasted update to ${ioInstance.engine.clientsCount} clients`);
        } else {
          console.warn('⚠️ Socket.IO instance not available for broadcast');
        }
        
        lastDataHash = currentDataHash;
      } else {
        console.log('📊 No changes detected');
      }
      
    } catch (error) {
      console.error('❌ Background refresh failed:', error);
    }
  }, 30000); // Check every 30 seconds
};

// GET all floors
router.get("/", async (req, res) => {
  try {
    const forceRefresh = req.query.refresh === 'true';
    console.log(`🔍 Floors API called ${forceRefresh ? '(force refresh)' : ''}`);

    const cachedData = forceRefresh ? null : cache.get('floors');
    if (cachedData) {
      console.log('⚡ Returning cached data');
      return res.json({
        success: true,
        data: cachedData,
        cached: true,
        source: 'cache',
        lastRefresh: cache.get('last_refresh_time'),
        timestamp: new Date().toISOString()
      });
    }

    try {
      console.log('📊 Fetching fresh data from Google Sheets');
      const sheetsFloors = await googleSheetsService.getFloors();
      
      cache.set('floors', sheetsFloors);
      cache.set('last_refresh_time', new Date().toISOString());
      lastDataHash = JSON.stringify(sheetsFloors);
      
      // ✅ BROADCAST FOR MANUAL REFRESH
      if (forceRefresh && ioInstance) {
        ioInstance.emit('floorsUpdated', {
          data: sheetsFloors,
          source: 'manual_refresh',
          timestamp: new Date().toISOString(),
          count: sheetsFloors.length
        });
      }
      
      console.log(`✅ Successfully fetched ${sheetsFloors.length} floors from Google Sheets`);
      
      return res.json({
        success: true,
        data: sheetsFloors,
        cached: false,
        source: 'google_sheets',
        count: sheetsFloors.length,
        lastRefresh: new Date().toISOString(),
        timestamp: new Date().toISOString()
      });

    } catch (sheetsError) {
      console.warn('⚠️ Google Sheets failed, falling back to JSON file:', sheetsError.message);
      
      return res.json({
        success: true,
        data: floors,
        cached: false,
        source: 'json_fallback',
        count: floors.length,
        warning: 'Using fallback data due to Google Sheets error',
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('❌ Complete API failure:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch floors data',
      timestamp: new Date().toISOString()
    });
  }
});

// GET single floor by id
router.get("/:id", async (req, res) => {
  try {
    let floorsData;
    
    const cachedData = cache.get('floors');
    if (cachedData) {
      floorsData = cachedData;
    } else {
      try {
        floorsData = await googleSheetsService.getFloors();
        cache.set('floors', floorsData);
      } catch (error) {
        console.warn('Using fallback JSON for single floor request');
        floorsData = floors;
      }
    }
    
    const floor = floorsData.find(f => f.id === req.params.id);
    
    if (floor) {
      res.json({
        success: true,
        data: floor,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(404).json({ 
        success: false,
        message: "Floor not found",
        requestedId: req.params.id,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error fetching single floor:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Manual refresh with instant broadcast
router.post("/refresh", async (req, res) => {
  try {
    console.log('🔄 Manual refresh requested');
    
    // Clear cache and fetch fresh data
    cache.del('floors');
    const freshData = await googleSheetsService.getFloors();
    cache.set('floors', freshData);
    cache.set('last_refresh_time', new Date().toISOString());
    lastDataHash = JSON.stringify(freshData);
    
    // ✅ INSTANT BROADCAST TO ALL CLIENTS
    if (ioInstance) {
      ioInstance.emit('floorsUpdated', {
        data: freshData,
        source: 'manual_refresh',
        timestamp: new Date().toISOString(),
        count: freshData.length
      });
      
      console.log(`⚡ Instant broadcast sent to ${ioInstance.engine.clientsCount} clients`);
    }
    
    res.json({ 
      success: true, 
      message: 'Data refreshed and broadcast to all clients',
      clientsNotified: ioInstance?.engine?.clientsCount || 0,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Monitoring endpoint
router.get("/websocket-status", (req, res) => {
  res.json({
    connectedClients: ioInstance?.engine?.clientsCount || 0,
    backgroundRefreshActive: !!backgroundRefreshInterval,
    lastDataHash: lastDataHash ? 'Set' : 'Not Set',
    socketIOAvailable: !!ioInstance,
    cache: {
      size: cache.keys().length,
      lastRefresh: cache.get('last_refresh_time')
    },
    timestamp: new Date().toISOString()
  });
});

// ✅ EXPORT THE SETUP FUNCTION
module.exports = router;
module.exports.setSocketIO = setSocketIO;
