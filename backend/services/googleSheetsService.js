const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

class GoogleSheetsService {
  constructor() {
    this.sheets = null;
    this.initialized = false;
    this.firstSheetName = null;
  }

  async initialize() {
    try {
      if (this.initialized) return;

      console.log('🔧 Initializing Google Sheets service...');
      
      const keyPath = path.resolve(process.env.SERVICE_ACCOUNT_PATH);
      
      if (!fs.existsSync(keyPath)) {
        throw new Error(`Service account key file not found at: ${keyPath}`);
      }

      const credentials = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
      console.log('🔑 Service account email:', credentials.client_email);

      const auth = new google.auth.GoogleAuth({
        credentials: credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
      });

      this.sheets = google.sheets({ 
        version: 'v4', 
        auth: auth
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
      
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      });

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
    try {
      await this.initialize();
      const sheetName = await this.getFirstSheetName();

      console.log(`📊 Fetching data from sheet: "${sheetName}"`);

      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SHEETS_ID,
        range: sheetName,
      });

      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        throw new Error('No data found in spreadsheet');
      }

      console.log(`✅ Retrieved ${rows.length - 1} floor records from Google Sheets`);
      return this.transformData(rows);
    } catch (error) {
      console.error('❌ Error fetching from Google Sheets:', error.message);
      throw error;
    }
  }

  transformData(rows) {
    const [headers, ...dataRows] = rows;
    
    return dataRows.map(row => {
      const rowData = {};
      headers.forEach((header, index) => {
        rowData[header] = row[index] || '';
      });
      
      return {
        id: rowData.id,
        d: rowData.d,
        info: {
          floorNumber: parseInt(rowData.floorNumber) || 0,
          price: rowData.price,
          area: rowData.area,
          bhk: rowData.bhk,
          availability: rowData.availability,
          "floor-plan": rowData['floor-plan'] || null
        }
      };
    }).filter(floor => floor.id && floor.d);
  }
}

module.exports = new GoogleSheetsService();
