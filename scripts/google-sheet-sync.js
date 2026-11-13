/**
 * Google Apps Script - WinApps Sales Contact & Lead Receiver
 * 
 * Instructions:
 * 1. Open Google Sheets (https://sheets.new)
 * 2. Click "Extensions" > "Apps Script"
 * 3. Replace all existing code with this file's contents
 * 4. Save and click "Deploy" > "New deployment"
 * 5. Type: "Web app"
 * 6. Execute as: "Me"
 * 7. Who has access: "Anyone"
 * 8. Deploy, authorize permissions, and copy the Web App URL!
 */

function doPost(e) {
  const lock = LockService.getScriptLock();
  // Wait up to 10 seconds for other processes to finish
  lock.tryLock(10000);

  try {
    const doc = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = doc.getActiveSheet();

    // Parse incoming data (handles both JSON and form urlencoded)
    let data = {};
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    // Format current timestamp
    const timestamp = Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone() || "Asia/Kolkata",
      "yyyy-MM-dd HH:mm:ss"
    );

    // Columns mapping
    const headers = [
      "Timestamp",
      "Source",
      "Full Name",
      "Email",
      "Phone",
      "Company",
      "Country",
      "Budget",
      "Needs / Services",
      "Message"
    ];

    // If sheet is empty, create beautiful formatted headers
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#1e293b"); // Slate dark
      headerRange.setFontColor("#ffffff");   // White text
      sheet.setFrozenRows(1);                // Freeze top row
    }

    // Prepare row values matching the header order
    const row = [
      timestamp,
      data.source || "Website",
      data.name || "",
      data.email || "",
      data.phone || "",
      data.company || "",
      data.country || "",
      data.budget || "",
      data.needs || "",
      data.message || ""
    ];

    // Append lead data to sheet
    sheet.appendRow(row);

    // Auto-resize columns for readability
    for (let col = 1; col <= headers.length; col++) {
      sheet.autoResizeColumn(col);
    }

    return ContentService.createTextOutput(
      JSON.stringify({ status: "success", message: "Lead saved successfully" })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: "error", message: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService.createTextOutput("Google Apps Script Web App is active and ready to receive POST requests.");
}
