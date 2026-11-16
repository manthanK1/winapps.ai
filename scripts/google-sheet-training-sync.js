/**
 * Google Apps Script - WinApps Training Inquiry Receiver
 * 
 * Instructions:
 * 1. Open your Google Sheet (from your screenshot: "Untitled spreadsheet")
 * 2. Click "Extensions" > "Apps Script"
 * 3. Delete everything in Code.gs and paste THIS entire code
 * 4. Click the Save icon (Floppy disk / Ctrl+S)
 * 5. Click "Deploy" > "Manage deployments" (or "New deployment")
 *    - Click the Pencil icon to Edit
 *    - Under "Version", choose "New version"
 *    - Under "Who has access", select "Anyone" (VERY IMPORTANT! Do NOT select "Only myself")
 *    - Click "Deploy"
 * 6. Copy the Web App URL and make sure it ends with /exec
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  // Wait up to 10 seconds for concurrent requests
  lock.tryLock(10000);

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Parse incoming data (handles JSON, FormData, and urlencoded)
    var data = {};
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    // Format current timestamp (Indian Standard Time)
    var timestamp = Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone() || "Asia/Kolkata",
      "yyyy-MM-dd HH:mm:ss"
    );

    // If sheet is empty, create formatted headers
    if (sheet.getLastRow() === 0) {
      var headers = [
        "Timestamp",
        "Full Name",
        "Email Address",
        "Phone / WhatsApp",
        "Program / Track",
        "Questions / Message",
        "Source"
      ];
      sheet.appendRow(headers);
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#0f172a"); // Dark slate
      headerRange.setFontColor("#ffffff");   // White text
      sheet.setFrozenRows(1);
    }

    // Append lead row
    sheet.appendRow([
      timestamp,
      data.name || "",
      data.email || "",
      data.phone || "",
      data.course || data.program || "",
      data.message || "",
      data.source || "Training Inquiry"
    ]);

    // Auto-fit columns
    for (var col = 1; col <= 7; col++) {
      sheet.autoResizeColumn(col);
    }

    return ContentService.createTextOutput(
      JSON.stringify({ result: "success", message: "Inquiry saved successfully" })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ result: "error", error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService.createTextOutput("Winapps Training Web App is active and ready to receive inquiries.");
}
