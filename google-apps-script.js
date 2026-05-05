/**
 * ============================================================================
 * TravelIQ Google Apps Script - Complete Form Data Collection
 * ============================================================================
 *
 * DEPLOYMENT INSTRUCTIONS:
 * 1. Select ALL code in the Apps Script editor (Ctrl+A / Cmd+A)
 * 2. Delete it, then paste this entire file
 * 3. Click Save (floppy disk icon)
 * 4. Click Deploy > Manage deployments > edit existing > Deploy
 *    (The URL stays the same — no changes needed in your app)
 *
 * SHEETS USED:
 * - Leads         | Timestamp, Type, Name, Email, Agency, Plan, Message, WantsDemo
 * - Chat History  | Timestamp, Sender, Text, Sources
 * - Suppliers     | (dynamic headers)
 * - BlogPosts     | id, title, date, imageUrl, summary, author, content, published, createdAt
 * ============================================================================
 */

// Configuration - Your Google Sheet ID
const SPREADSHEET_ID = '1FGoBLFC2fIfHc-F45_0wqeVNVrzi5On3WhqUunIvPpc';

// Your notification email — leads will be emailed here instantly
const NOTIFICATION_EMAIL = 'hello@beeancy.com';

// Sheet names
const SHEETS = {
  LEADS: 'Leads',
  CHAT_HISTORY: 'Chat History',
  SUPPLIERS: 'Suppliers',
  BLOG_POSTS: 'BlogPosts'   // ← NEW: for blog management
};

// ============================================================================
// HTTP HANDLERS
// ============================================================================

function doGet(e) {
  try {
    const action = e.parameter.action;

    switch (action) {
      case 'getLeads':
        return createJsonResponse(getLeads());
      case 'getVeeChatHistory':
        return createJsonResponse(getVeeChatHistory());
      case 'getSuppliers':
        return createJsonResponse(getSuppliers());
      case 'getBlogPosts':                          // ← NEW
        return createJsonResponse(getBlogPosts());
      default:
        return createJsonResponse({ success: false, message: 'Unknown action: ' + action });
    }
  } catch (error) {
    return createJsonResponse({ success: false, message: error.toString() });
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    const payload = data.payload;

    switch (action) {
      case 'addLead':
        return createJsonResponse(addLead(payload.lead));
      case 'addVeeChatMessage':
        return createJsonResponse(addVeeChatMessage(payload.message));
      case 'saveSuppliers':
        return createJsonResponse(saveSuppliers(payload.suppliers));
      case 'saveBlogPost':                          // ← NEW
        return createJsonResponse(saveBlogPost(payload.post));
      case 'deleteBlogPost':                        // ← NEW
        return createJsonResponse(deleteBlogPost(payload.id));
      default:
        return createJsonResponse({ success: false, message: 'Unknown action: ' + action });
    }
  } catch (error) {
    return createJsonResponse({ success: false, message: error.toString() });
  }
}

// ============================================================================
// UTILITY
// ============================================================================

function createJsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateSheet(sheetName) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    if (!ss) throw new Error('Could not open spreadsheet with ID: ' + SPREADSHEET_ID);

    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      initializeSheetHeaders(sheet, sheetName);
    }
    return sheet;
  } catch (error) {
    Logger.log('Error in getOrCreateSheet for "' + sheetName + '": ' + error.toString());
    throw new Error('Failed to access spreadsheet: ' + error.toString());
  }
}

function initializeSheetHeaders(sheet, sheetName) {
  switch (sheetName) {
    case SHEETS.LEADS:
      sheet.getRange(1, 1, 1, 8).setValues([['Timestamp', 'Type', 'Name', 'Email', 'Agency', 'Plan', 'Message', 'WantsDemo']]);
      sheet.getRange(1, 1, 1, 8).setFontWeight('bold').setBackground('#00d4ff');
      break;
    case SHEETS.CHAT_HISTORY:
      sheet.getRange(1, 1, 1, 4).setValues([['Timestamp', 'Sender', 'Text', 'Sources']]);
      sheet.getRange(1, 1, 1, 4).setFontWeight('bold').setBackground('#00d4ff');
      break;
    case SHEETS.BLOG_POSTS:                         // ← NEW
      sheet.getRange(1, 1, 1, 9).setValues([['id', 'title', 'date', 'imageUrl', 'summary', 'author', 'content', 'published', 'createdAt']]);
      sheet.getRange(1, 1, 1, 9).setFontWeight('bold').setBackground('#00d4ff');
      sheet.setFrozenRows(1);
      break;
    case SHEETS.SUPPLIERS:
      // Headers set dynamically when saving suppliers
      break;
  }
}

// ============================================================================
// LEADS
// ============================================================================

function addLead(lead) {
  const sheet = getOrCreateSheet(SHEETS.LEADS);

  const firstRow = sheet.getRange(1, 1, 1, 8).getValues()[0];
  if (firstRow[0] !== 'Timestamp') {
    initializeSheetHeaders(sheet, SHEETS.LEADS);
  }

  const name = lead.name || (((lead.firstName || '') + ' ' + (lead.lastName || '')).trim());

  const rowData = [
    lead.timestamp || new Date().toISOString(),
    lead.type || 'Unknown',
    name,
    lead.email || '',
    lead.agency || '',
    lead.plan || '',
    lead.message || '',
    lead.wantsDemo === true ? 'Yes' : lead.wantsDemo === false ? 'No' : ''
  ];

  sheet.appendRow(rowData);

  // ← NEW: send email notification immediately after saving
  sendLeadNotification(lead, name);

  return { success: true, message: 'Lead added successfully' };
}

function getLeads() {
  const sheet = getOrCreateSheet(SHEETS.LEADS);
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) return { success: true, data: [] };

  const headers = data[0];
  const leads = data.slice(1).map(row => {
    const lead = {};
    headers.forEach((header, index) => {
      const key = header.toLowerCase().replace(/\s+/g, '');
      lead[key] = row[index];
    });
    return {
      timestamp: lead.timestamp || '',
      type: lead.type || '',
      name: lead.name || '',
      email: lead.email || '',
      agency: lead.agency || '',
      plan: lead.plan || '',
      message: lead.message || '',
      wantsDemo: lead.wantsdemo === 'Yes'
    };
  });

  return { success: true, data: leads };
}

// ============================================================================
// EMAIL NOTIFICATIONS  ← NEW
// ============================================================================

function sendLeadNotification(lead, name) {
  try {
    const displayName = name || lead.email || 'Unknown';
    const subject = '🔔 New TravelIQ Lead: ' + (lead.type || 'Unknown');
    const body =
      'A new lead has been captured on TravelIQ:\n\n' +
      '• Type:    ' + (lead.type || 'Unknown') + '\n' +
      '• Name:    ' + displayName + '\n' +
      '• Email:   ' + (lead.email || '—') + '\n' +
      '• Agency:  ' + (lead.agency || '—') + '\n' +
      '• Plan:    ' + (lead.plan || '—') + '\n' +
      '• Time:    ' + new Date(lead.timestamp || Date.now()).toLocaleString('en-GB') + '\n' +
      (lead.message ? '\n• Message:\n  ' + lead.message + '\n' : '') +
      '\n──────────────────────────────\n' +
      'Log in to your admin panel to view all leads.';

    GmailApp.sendEmail(NOTIFICATION_EMAIL, subject, body);
  } catch (e) {
    // Non-fatal — lead is already saved, just log the failure
    Logger.log('Email notification failed: ' + e.toString());
  }
}

// ============================================================================
// BLOG POSTS  ← NEW
// ============================================================================

function getBlogPosts() {
  try {
    const sheet = getOrCreateSheet(SHEETS.BLOG_POSTS);
    const data = sheet.getDataRange().getValues();

    if (data.length <= 1) return { success: true, data: [] };

    const headers = data[0];
    const posts = data.slice(1).map(function(row) {
      const post = {};
      headers.forEach(function(h, i) { post[h] = row[i]; });
      return post;
    });

    return { success: true, data: posts };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

function saveBlogPost(post) {
  try {
    const sheet = getOrCreateSheet(SHEETS.BLOG_POSTS);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const idCol = headers.indexOf('id');

    // Look for an existing row with this ID (update)
    let existingRow = -1;
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][idCol]) === String(post.id)) {
        existingRow = i + 1; // 1-indexed sheet row
        break;
      }
    }

    const row = [
      post.id,
      post.title,
      post.date,
      post.imageUrl,
      post.summary,
      post.author,
      post.content,
      post.published,
      post.createdAt || new Date().toISOString()
    ];

    if (existingRow > 0) {
      sheet.getRange(existingRow, 1, 1, row.length).setValues([row]);
    } else {
      sheet.appendRow(row);
    }

    return { success: true };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

function deleteBlogPost(postId) {
  try {
    const sheet = getOrCreateSheet(SHEETS.BLOG_POSTS);
    const data = sheet.getDataRange().getValues();
    const idCol = data[0].indexOf('id');

    // Walk backwards so row deletion doesn't shift indices
    for (let i = data.length - 1; i >= 1; i--) {
      if (String(data[i][idCol]) === String(postId)) {
        sheet.deleteRow(i + 1);
        break;
      }
    }

    return { success: true };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

// ============================================================================
// VEECHAT HISTORY
// ============================================================================

function addVeeChatMessage(message) {
  const sheet = getOrCreateSheet(SHEETS.CHAT_HISTORY);

  const firstRow = sheet.getRange(1, 1, 1, 4).getValues()[0];
  if (firstRow[0] !== 'Timestamp') {
    initializeSheetHeaders(sheet, SHEETS.CHAT_HISTORY);
  }

  const rowData = [
    message.timestamp || new Date().toISOString(),
    message.sender || 'unknown',
    message.text || '',
    message.sources ? JSON.stringify(message.sources) : ''
  ];

  sheet.appendRow(rowData);

  return { success: true, message: 'Chat message added successfully' };
}

function getVeeChatHistory() {
  const sheet = getOrCreateSheet(SHEETS.CHAT_HISTORY);
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) return { success: true, data: [] };

  const messages = data.slice(1).map(row => {
    let sources = [];
    try { if (row[3]) sources = JSON.parse(row[3]); } catch (e) {}
    return {
      timestamp: row[0] || '',
      sender: row[1] || 'unknown',
      text: row[2] || '',
      sources: sources
    };
  });

  return { success: true, data: messages };
}

// ============================================================================
// SUPPLIERS
// ============================================================================

function saveSuppliers(suppliers) {
  const sheet = getOrCreateSheet(SHEETS.SUPPLIERS);

  if (!suppliers || suppliers.length === 0) {
    sheet.clear();
    return { success: true, message: 'Suppliers cleared' };
  }

  const allKeys = new Set();
  suppliers.forEach(s => Object.keys(s).forEach(k => allKeys.add(k)));
  const headers = Array.from(allKeys);

  sheet.clear();
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#00d4ff');

  const rows = suppliers.map(supplier =>
    headers.map(header => {
      const value = supplier[header];
      return typeof value === 'object' ? JSON.stringify(value) : (value !== undefined ? value : '');
    })
  );

  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }

  return { success: true, message: 'Saved ' + suppliers.length + ' suppliers' };
}

function getSuppliers() {
  const sheet = getOrCreateSheet(SHEETS.SUPPLIERS);
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) return { success: true, data: [] };

  const headers = data[0];
  const suppliers = data.slice(1).map(row => {
    const supplier = {};
    headers.forEach((header, index) => {
      let value = row[index];
      if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
        try { value = JSON.parse(value); } catch (e) {}
      }
      supplier[header] = value;
    });
    return supplier;
  });

  return { success: true, data: suppliers };
}

// ============================================================================
// SETUP & TEST HELPERS (run these manually from the Apps Script editor)
// ============================================================================

function testSetup() {
  const sheets = [SHEETS.LEADS, SHEETS.CHAT_HISTORY, SHEETS.SUPPLIERS, SHEETS.BLOG_POSTS];
  sheets.forEach(name => {
    const sheet = getOrCreateSheet(name);
    Logger.log('Sheet "' + name + '" ready: ' + sheet.getLastRow() + ' rows');
  });
  Logger.log('Setup complete!');
}

function initializeAllSheets() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    Logger.log('Connected to: ' + ss.getName());

    [SHEETS.LEADS, SHEETS.CHAT_HISTORY, SHEETS.BLOG_POSTS].forEach(name => {
      let sheet = ss.getSheetByName(name);
      if (!sheet) sheet = ss.insertSheet(name);
      else sheet.clear();
      initializeSheetHeaders(sheet, name);
      sheet.setFrozenRows(1);
    });

    let suppliersSheet = ss.getSheetByName(SHEETS.SUPPLIERS);
    if (!suppliersSheet) ss.insertSheet(SHEETS.SUPPLIERS);

    Logger.log('All sheets initialised successfully!');
    return { success: true, message: 'All sheets initialised' };
  } catch (error) {
    Logger.log('Error: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}

function testConnection() {
  try {
    Logger.log('Testing connection... Spreadsheet ID: ' + SPREADSHEET_ID);
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    Logger.log('✓ Connected to: ' + ss.getName());
    const sheet = ss.getSheetByName(SHEETS.LEADS) || ss.insertSheet(SHEETS.LEADS);
    Logger.log('✓ Sheet access working');
    sheet.getRange('A1').setValue('Test Connection - ' + new Date().toISOString());
    Logger.log('✓ Sheet writing working — all tests passed!');
    return { success: true, message: 'Connection test successful' };
  } catch (error) {
    Logger.log('✗ Test failed: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}
