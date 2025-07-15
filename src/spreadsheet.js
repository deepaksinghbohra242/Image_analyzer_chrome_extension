export async function createSpreadsheet(token, result) {
  try {
    const response = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        properties: {
          title: "balveers"
        },
        sheets: [
          {
            properties: {
              title: "sheet1",
            }
          }
        ]
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      return;
    }

    console.log("Spreadsheet created:", data.spreadsheetId);
    
    await addHeaders(token, data.spreadsheetId);
    
    await appendRow(token, data.spreadsheetId, result);
    
  } catch (error) {
    console.error("Error in createSpreadsheet:", error);
  }
}

export async function addHeaders(token, spreadsheetId) {
  const headers = [
    "Email", 
    "URL", 
    "Timestamp", 
    "Body Parts Percentage", 
    "Body Parts Description",
    "Gross Percentage",
    "Gross Description",
    "Other Percentage",
    "Other Description",
    "Profanity Percentage",
    "Profanity Description",
    "Racy Percentage",
    "Racy Description",
    "Underwear/Lingerie Percentage",
    "Underwear/Lingerie Description"
  ];
  
  try {
    const sheetInfoResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`,
      {
        headers: {
          Authorization: "Bearer " + token,
        },
      }
    );
    
    const sheetInfo = await sheetInfoResponse.json();
    const sheetName = sheetInfo.sheets[0].properties.title;
    
    console.log("Adding headers to sheet:", sheetName);
    
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!A1:Q1?valueInputOption=USER_ENTERED`,
      {
        method: "PUT",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          values: [headers]
        })
      }
    );

    const result = await response.json();
    
    if (!response.ok) {
      console.error("Error adding headers:", result);
      return;
    }
    
    console.log("Headers added successfully");
  } catch (error) {
    console.error("Error in addHeaders:", error);
  }
}

export async function appendRow(token, spreadsheetId, rowData) {
  try {
    // First, get the current sheet info to find the correct sheet name
    const sheetInfoResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`,
      {
        headers: {
          Authorization: "Bearer " + token,
        },
      }
    );
    
    const sheetInfo = await sheetInfoResponse.json();
    const sheetName = sheetInfo.sheets[0].properties.title;
    
    console.log("Using sheet name:", sheetName);
    
    // Get current data to find next empty row
    const dataResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!A:Z`,
      {
        headers: {
          Authorization: "Bearer " + token,
        },
      }
    );
    
    const currentData = await dataResponse.json();
    const nextRow = (currentData.values ? currentData.values.length : 0) + 1;
    
    console.log("Inserting at row:", nextRow);
    
    // Insert the row at the specific position
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!A${nextRow}:Z${nextRow}?valueInputOption=USER_ENTERED`,
      {
        method: "PUT",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          values: [rowData]
        })
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      console.error("Error appending row:", data);
      return;
    }
    
    console.log("Row added successfully:", data);
  } catch (error) {
    console.error("Error in appendRow:", error);
  }
}

// Helper function to flatten the analysis result
export function flattenAnalysisResult(email, url, timestamp, analysisResult) {
  const categories = ['body parts', 'gross', 'inappropriate', 'other', 'profanity', 'racy', 'underwear/lingerie'];
  
  const flattenedRow = [email, url, timestamp];
  
  categories.forEach(category => {
    const categoryData = analysisResult[category] || { percentageScore: '0%', descriptions: '' };
    flattenedRow.push(categoryData.percentageScore || '0%');
    flattenedRow.push(categoryData.descriptions || '');
  });
  
  return flattenedRow;
}