import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { email, timestamp } = await req.json();

    // Debug log the environment variables (redacted for security)
    console.log('Environment variables check:', {
      hasClientEmail: !!process.env.GOOGLE_CLIENT_EMAIL,
      hasPrivateKey: !!process.env.GOOGLE_PRIVATE_KEY,
      hasSheetId: !!process.env.SHEET_ID,
      sheetId: process.env.SHEET_ID // this is safe to log
    });

    // Validate required environment variables
    if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || !process.env.SHEET_ID) {
      throw new Error('Missing required environment variables');
    }

    // Clean up private key - this is crucial
    const privateKey = process.env.GOOGLE_PRIVATE_KEY
      .replace(/\\n/g, '\n')
      .replace(/"(.+)"/, '$1'); // Remove any wrapping quotes if present

    // Debug log auth configuration
    console.log('Configuring auth...');
    
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    console.log('Auth configured, creating client...');
    
    const client = await auth.getClient();
    console.log('Client created successfully');

    const sheets = google.sheets({ version: 'v4', auth: client });
    console.log('Sheets instance created');

    try {
      // First, verify we can access the spreadsheet
      const testAccess = await sheets.spreadsheets.get({
        spreadsheetId: process.env.SHEET_ID
      });
      
      console.log('Successfully accessed spreadsheet:', testAccess.data.properties.title);

      // Now try to append the data
      const appendResult = await sheets.spreadsheets.values.append({
        spreadsheetId: process.env.SHEET_ID,
        range: 'A:B',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[email, timestamp]]
        }
      });

      console.log('Successfully appended data');

      return NextResponse.json({
        success: true,
        message: 'Email saved successfully'
      });

    } catch (sheetsError) {
      console.error('Google Sheets API Error:', {
        message: sheetsError.message,
        code: sheetsError.code,
        errors: sheetsError.errors,
        stack: sheetsError.stack
      });

      if (sheetsError.code === 403) {
        return NextResponse.json({
          success: false,
          message: 'Permission denied. Please check service account permissions.',
          error: sheetsError.message
        }, { status: 403 });
      }

      if (sheetsError.code === 404) {
        return NextResponse.json({
          success: false,
          message: 'Spreadsheet not found. Please check SHEET_ID.',
          error: sheetsError.message
        }, { status: 404 });
      }

      return NextResponse.json({
        success: false,
        message: 'Error accessing Google Sheets',
        error: sheetsError.message
      }, { status: 500 });
    }

  } catch (error) {
    console.error('API Route Error:', {
      message: error.message,
      stack: error.stack
    });

    return NextResponse.json({
      success: false,
      message: error.message
    }, { status: 500 });
  }
}