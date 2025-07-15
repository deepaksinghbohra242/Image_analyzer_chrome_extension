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
      console.error("Error creating spreadsheet:", data);
      return;
    }

    console.log("Spreadsheet created:", data.spreadsheetId);
    
    const headersSuccess = await addHeaders(token, data.spreadsheetId);
    
    if (headersSuccess) {
      await appendRow(token, data.spreadsheetId, result);
    }
    
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
    
    if (!sheetInfoResponse.ok) {
      console.error("Error getting sheet info:", sheetInfo);
      return;
    }
    
    const sheetName = sheetInfo.sheets[0].properties.title;
    
    console.log("Adding headers to sheet:", sheetName);
    
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!A1:O1?valueInputOption=USER_ENTERED`,
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
      return false;
    }
    
    console.log("Headers added successfully");
    return true;
  } catch (error) {
    console.error("Error in addHeaders:", error);
    return false;
  }
}

export async function appendRow(token, spreadsheetId, rowData) {
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
    
    if (!sheetInfoResponse.ok) {
      console.error("Error getting sheet info:", sheetInfo);
      return;
    }
    
    const sheetName = sheetInfo.sheets[0].properties.title;
    
    console.log("Using sheet name:", sheetName);
    
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!A2:Z:append?valueInputOption=USER_ENTERED`,
      {
        method: "POST",
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