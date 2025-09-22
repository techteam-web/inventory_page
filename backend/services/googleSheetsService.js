const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

class GoogleSheetsService {
  constructor() {
    this.sheets = null;
    this.initialized = false;
    this.firstSheetName = null;
    this.retryAttempts = 3;
    this.timeoutMs = 25000; // 25 seconds timeout
  }

  async initialize() {
    try {
      if (this.initialized) return;
      console.log('🔧 Initializing Google Sheets service...');

      let credentials;
      const secretPath = '/etc/secrets/service-account-key.json';
      const localPath = path.resolve('./service-account-key.json');

      if (fs.existsSync(secretPath)) {
        console.log('📄 Using secret file from Render');
        credentials = JSON.parse(fs.readFileSync(secretPath, 'utf8'));
      } else if (fs.existsSync(localPath)) {
        console.log('📄 Using local service account file');
        credentials = JSON.parse(fs.readFileSync(localPath, 'utf8'));
      } else {
        throw new Error('Service account key file not found in secret files or local directory');
      }

      console.log('🔑 Service account email:', credentials.client_email);

      const auth = new google.auth.GoogleAuth({
        credentials: credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
      });

      this.sheets = google.sheets({
        version: 'v4',
        auth: auth,
        timeout: this.timeoutMs // Add timeout to sheets instance
      });

      this.initialized = true;
      console.log('✅ Google Sheets service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Google Sheets service:', error.message);
      throw error;
    }
  }

  async getFirstSheetName() {
    try {
      if (this.firstSheetName) {
        return this.firstSheetName;
      }

      await this.initialize();

      const response = await Promise.race([
        this.sheets.spreadsheets.get({
          spreadsheetId: process.env.GOOGLE_SHEETS_ID,
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Sheet metadata fetch timeout')), this.timeoutMs)
        )
      ]);

      const sheets = response.data.sheets;
      if (!sheets || sheets.length === 0) {
        throw new Error('No sheets found in spreadsheet');
      }

      this.firstSheetName = sheets[0].properties.title;
      console.log(`✅ Using sheet: "${this.firstSheetName}"`);
      return this.firstSheetName;
    } catch (error) {
      console.error('❌ Error getting sheet names:', error.message);
      throw error;
    }
  }

  async getFloors() {
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        console.log(`📊 Fetching data attempt ${attempt}/${this.retryAttempts}`);
        
        await this.initialize();
        const sheetName = await this.getFirstSheetName();
        
        console.log(`📊 Fetching data from sheet: "${sheetName}"`);

        // Use Promise.race for timeout
        const response = await Promise.race([
          this.sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SHEETS_ID,
            range: sheetName,
            valueRenderOption: 'UNFORMATTED_VALUE', // Faster processing
            majorDimension: 'ROWS'
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Google Sheets API timeout')), this.timeoutMs)
          )
        ]);

        const rows = response.data.values;
        if (!rows || rows.length === 0) {
          throw new Error('No data found in spreadsheet');
        }

        console.log(`✅ Retrieved ${rows.length - 1} floor records from Google Sheets`);
        return this.transformData(rows);

      } catch (error) {
        console.error(`❌ Attempt ${attempt} failed:`, error.message);
        
        if (attempt === this.retryAttempts) {
          console.error('❌ All retry attempts failed');
          throw new Error(`Failed to fetch data after ${this.retryAttempts} attempts: ${error.message}`);
        }

        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(`⏳ Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  transformData(rows) {
    const [headers, ...dataRows] = rows;
    
    const parseFloorPlanImages = (floorPlanString) => {
      if (!floorPlanString || floorPlanString.trim() === '') return [];
      return floorPlanString.split(',').map(url => url.trim()).filter(url => url.length > 0);
    };

    return dataRows.map(row => {
      const rowData = {};
      headers.forEach((header, index) => {
        rowData[header] = row[index] || '';
      });

      const floorPlanImages = parseFloorPlanImages(rowData['floor-plan']);

      return {
        id: rowData.id,
        d: rowData.d,
        info: {
          floorNumber: parseInt(rowData.floorNumber) || 0,
          price: rowData.price,
          area: rowData.area,
          bhk: rowData.bhk,
          availability: rowData.availability,
          "floor-plan": rowData['floor-plan'] || null,
          "floor-plan-images": floorPlanImages,
          "has-floor-plan": floorPlanImages.length > 0
        }
      };
    }).filter(floor => floor.id && floor.d);
  }
}

module.exports = new GoogleSheetsService();
