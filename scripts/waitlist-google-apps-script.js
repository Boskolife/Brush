/**
 * Google Apps Script for saving waitlist emails to a Google Sheet.
 *
 * Setup:
 * 1. Create a Google Sheet (e.g. "BRUSH Waitlist").
 * 2. Extensions → Apps Script → paste this file → save.
 * 3. Set WAITLIST_SECRET below to a random string.
 * 4. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Copy the Web App URL into .env as VITE_WAITLIST_SCRIPT_URL
 *    and use the same secret in VITE_WAITLIST_SCRIPT_TOKEN.
 * 6. After updating this script, create a new Web app deployment.
 */

const WAITLIST_SECRET =
  '7d9adb21620501d9ec85790f33f494e0710b3ff0a226adc73de686089c6bcb47';
const SHEET_NAME = 'Waitlist';

function ensureHeaders(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Email', 'Subscribed At', 'Location']);
    return;
  }

  if (sheet.getLastColumn() < 3) {
    sheet.getRange(1, 3).setValue('Location');
  }
}

function getWaitlistSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  ensureHeaders(sheet);

  return sheet;
}

function normalizeLocation(location) {
  const value = String(location || '')
    .trim()
    .slice(0, 200);

  return value || 'Unknown';
}

function parsePayload(e) {
  if (!e || !e.postData || !e.postData.contents) {
    throw new Error('Missing request body.');
  }

  return JSON.parse(e.postData.contents);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function emailAlreadyExists(sheet, email) {
  const lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    return false;
  }

  const emails = sheet.getRange(2, 1, lastRow - 1, 1).getValues();

  return emails.some(function (row) {
    return (
      String(row[0] || '')
        .trim()
        .toLowerCase() === email
    );
  });
}

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

function doPost(e) {
  try {
    const payload = parsePayload(e);
    const token = String(payload.token || '');
    const email = String(payload.email || '')
      .trim()
      .toLowerCase();
    const location = normalizeLocation(payload.location);

    if (token !== WAITLIST_SECRET) {
      return jsonResponse({ success: false, error: 'Unauthorized' });
    }

    if (!isValidEmail(email)) {
      return jsonResponse({ success: false, error: 'Invalid email' });
    }

    const sheet = getWaitlistSheet();

    if (emailAlreadyExists(sheet, email)) {
      return jsonResponse({ success: true, duplicate: true });
    }

    sheet.appendRow([email, new Date().toISOString(), location]);

    return jsonResponse({ success: true });
  } catch (error) {
    return jsonResponse({
      success: false,
      error: error && error.message ? error.message : 'Unknown error',
    });
  }
}
