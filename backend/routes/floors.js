const express = require("express");
const NodeCache = require("node-cache");
const googleSheetsService = require("../services/googleSheetsService");

const router = express.Router();

// Increased cache duration during high load
const cache = new NodeCache({
  stdTTL: 600, // 10 minutes instead of 5
  checkperiod: 60,
  useClones: false // Better performance for large objects
});

let ioInstance = null;
let backgroundRefreshInterval = null;
let lastDataHash = null;
let isRefreshing = false; // Prevent concurrent refreshes

const setSocketIO = (io) => {
  ioInstance = io;
  startBackgroundRefresh();
};

// Improved background refresh with queue management
const startBackgroundRefresh = () => {
  if (backgroundRefreshInterval) {
    clearInterval(backgroundRefreshInterval);
  }

  backgroundRefreshInterval = setInterval(async () => {
    if (isRefreshing) {
      console.log('🔄 Refresh already in progress, skipping...');
      return;
    }

    try {
      isRefreshing = true;
      console.log('🔄 Background refresh started');
      
      const freshData = await googleSheetsService.getFloors();
      const currentDataHash = JSON.stringify(freshData);
      
      if (currentDataHash !== lastDataHash) {
        console.log('🔥 Data changed! Broadcasting to all clients...');
        
        cache.set('floors', freshData);
        cache.set('last_refresh_time', new Date().toISOString());
        
        if (ioInstance) {
          ioInstance.emit('floorsUpdated', {
            data: freshData,
            source: 'background_refresh',
            timestamp: new Date().toISOString(),
            count: freshData.length
          });
          console.log(`✅ Broadcasted update to ${ioInstance.engine.clientsCount} clients`);
        }
        
        lastDataHash = currentDataHash;
      } else {
        console.log('📊 No changes detected');
      }
    } catch (error) {
      console.error('❌ Background refresh failed:', error.message);
      // Don't clear cache on background refresh failure
    } finally {
      isRefreshing = false;
    }
  }, 45000); // Increased to 45 seconds to reduce load
};

// Enhanced main route with better timeout handling
router.get("/", async (req, res) => {
  const startTime = Date.now();
  
  try {
    const forceRefresh = req.query.refresh === 'true';
    console.log(`🔍 Floors API called ${forceRefresh ? '(force refresh)' : ''}`);

    // Always try cache first unless force refresh
    const cachedData = forceRefresh ? null : cache.get('floors');
    if (cachedData) {
      console.log(`⚡ Returning cached data (${Date.now() - startTime}ms)`);
      return res.json({
        success: true,
        data: cachedData,
        cached: true,
        source: 'cache',
        lastRefresh: cache.get('last_refresh_time'),
        responseTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      });
    }

    // Prevent concurrent API calls
    if (isRefreshing && !forceRefresh) {
      console.log('🔄 Refresh in progress, returning stale cache if available');
      const staleData = cache.get('floors', true); // Get even expired cache
      if (staleData) {
        return res.json({
          success: true,
          data: staleData,
          cached: true,
          stale: true,
          source: 'stale_cache',
          message: 'Returning stale data while refresh is in progress',
          responseTime: Date.now() - startTime,
          timestamp: new Date().toISOString()
        });
      }
    }

    try {
      isRefreshing = true;
      console.log('📊 Fetching fresh data from Google Sheets');
      
      // Set a 30-second timeout for the entire operation
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout - Google Sheets took too long')), 30000)
      );
      
      const dataPromise = googleSheetsService.getFloors();
      const sheetsFloors = await Promise.race([dataPromise, timeoutPromise]);
      
      // Update cache
      cache.set('floors', sheetsFloors);
      cache.set('last_refresh_time', new Date().toISOString());
      lastDataHash = JSON.stringify(sheetsFloors);

      // Broadcast if manual refresh
      if (forceRefresh && ioInstance) {
        ioInstance.emit('floorsUpdated', {
          data: sheetsFloors,
          source: 'manual_refresh',
          timestamp: new Date().toISOString(),
          count: sheetsFloors.length
        });
      }

      console.log(`✅ Successfully fetched ${sheetsFloors.length} floors (${Date.now() - startTime}ms)`);
      
      return res.json({
        success: true,
        data: sheetsFloors,
        cached: false,
        source: 'google_sheets',
        count: sheetsFloors.length,
        responseTime: Date.now() - startTime,
        lastRefresh: new Date().toISOString(),
        timestamp: new Date().toISOString()
      });

    } catch (sheetsError) {
      console.error('❌ Google Sheets service failed:', sheetsError.message);
      
      // Try to return stale cached data as fallback
      const fallbackData = cache.get('floors', true); // Get expired cache
      if (fallbackData) {
        console.log('📦 Returning stale cached data as fallback');
        return res.json({
          success: true,
          data: fallbackData,
          cached: true,
          stale: true,
          source: 'fallback_cache',
          warning: 'Google Sheets unavailable, returning cached data',
          error: sheetsError.message,
          responseTime: Date.now() - startTime,
          timestamp: new Date().toISOString()
        });
      }

      // No cache available, return error
      return res.status(503).json({
        success: false,
        error: 'Service temporarily unavailable',
        message: 'Google Sheets is not responding and no cached data is available',
        details: sheetsError.message,
        responseTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      });
    } finally {
      isRefreshing = false;
    }

  } catch (error) {
    console.error('❌ Complete API failure:', error);
    isRefreshing = false;
    
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      responseTime: Date.now() - startTime,
      timestamp: new Date().toISOString()
    });
  }
});

// Add timeout endpoint for monitoring
router.get("/status", (req, res) => {
  res.json({
    service: 'floors-api',
    status: 'online',
    isRefreshing: isRefreshing,
    connectedClients: ioInstance?.engine?.clientsCount || 0,
    cache: {
      keys: cache.keys().length,
      lastRefresh: cache.get('last_refresh_time'),
      hasData: !!cache.get('floors')
    },
    backgroundRefreshActive: !!backgroundRefreshInterval,
    timestamp: new Date().toISOString()
  });
});

// Keep existing routes...
router.get("/:id", async (req, res) => {
  // Your existing single floor route code
});

router.post("/refresh", async (req, res) => {
  // Your existing refresh route code
});

module.exports = router;
module.exports.setSocketIO = setSocketIO;
