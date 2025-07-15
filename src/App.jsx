import React, { useState, useEffect } from "react";
import { analyzeImage } from "./analyzeImage";
import { createSpreadsheet, appendRow, flattenAnalysisResult } from "./spreadsheet";
import "./app.css";

function App() {
  const [url, setUrl] = useState();
  const [timestamp, setTimestamp] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("Initializing...");
  const API_Key = import.meta.env.VITE_API_KEY;

  useEffect(() => {
    if (typeof chrome !== "undefined" && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentUrl = tabs[0]?.url;
        if (currentUrl) {
          setUrl(currentUrl);
          setTimestamp(new Date().toISOString());
          setStatus("URL detected");
        }
      });
    }
  }, []);

  useEffect(() => {
    if (chrome.identity) {
      setStatus("Authenticating...");
      chrome.identity.getAuthToken({ interactive: true }, (token) => {
        if (chrome.runtime.lastError || !token) {
          console.error("Auth error:", chrome.runtime.lastError?.message);
          setStatus("Authentication failed");
          return;
        }

        setAuthToken(token);
        setStatus("Getting user info...");

        fetch("https://www.googleapis.com/oauth2/v1/userinfo?alt=json", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.email) {
              setEmail(data.email);
              setStatus("User authenticated");
            }
          })
          .catch((err) => {
            console.error("Failed to fetch user info", err);
            setStatus("Failed to get user info");
          });
      });
    }
  }, []);

  useEffect(() => {
    if (url && API_Key) {
      setStatus("Analyzing image...");
      setLoading(true);
      
      analyzeImage(url, API_Key)
        .then((categorized) => {
          console.log("Analysis result:", categorized);
          setResult(categorized);
          setStatus("Analysis complete");
          setLoading(false);
        })
        .catch((err) => {
          console.error("Analyze error:", err);
          setStatus("Analysis failed");
          setLoading(false);
        });
    }
  }, [url, API_Key]);

  useEffect(() => {
    if (result && email && authToken && url && timestamp) {
      setStatus("Preparing spreadsheet data...");
      
      const flattenedRow = flattenAnalysisResult(email, url, timestamp, result);
            
      setStatus("Checking for existing spreadsheet...");
      
      fetch(
        "https://www.googleapis.com/drive/v3/files?q=name='balveers' and mimeType='application/vnd.google-apps.spreadsheet'",
        {
          headers: {
            Authorization: "Bearer " + authToken,
          },
        }
      )
        .then((response) => response.json())
        .then((data) => {
          if (data.files && data.files.length > 0) {
            setStatus("Adding data to existing spreadsheet...");
            const spreadsheetId = data.files[0].id;
            
            appendRow(authToken, spreadsheetId, flattenedRow)
              .then(() => {
                setStatus("Data added successfully!");
              })
              .catch((err) => {
                setStatus("Error adding data to spreadsheet");
              });
          } else {
            setStatus("Creating new spreadsheet...");
            
            createSpreadsheet(authToken, flattenedRow)
              .then(() => {
                setStatus("Spreadsheet created and data added!");
              })
              .catch((err) => {
                setStatus("Error creating spreadsheet");
              });
          }
        })
        .catch((err) => {
          setStatus("Error checking for spreadsheet");
        });
    }
  }, [result, email, authToken, url, timestamp]);

  return (
    <div className="App">
      <h1>Image Analyzer</h1>
      <div>
        <p><strong>Status:</strong> <span style={{color: status.includes('Error') || status.includes('failed') ? 'red' : status.includes('success') ? 'green' : 'blue'}}>{status}</span></p>
        <p><strong>URL:</strong> {url}</p>
        <p><strong>Email:</strong> {email}</p>
        <p><strong>Timestamp:</strong> {timestamp}</p>
        <p><strong>Analysis Status:</strong> {result ? "Complete" : loading ? "Analyzing..." : "Waiting"}</p>
        
        {loading && <div style={{marginTop: '10px'}}>⏳ Processing...</div>}
        
        {result && (
          <div style={{marginTop: '20px'}}>
            <h3>Analysis Result:</h3>
            <div style={{background: '#f5f5f5', padding: '10px', borderRadius: '5px', maxHeight: '300px', overflow: 'auto'}}>
              <pre>{JSON.stringify(result, null, 2)}</pre>
            </div>
            
            <h3>Spreadsheet Data Preview:</h3>
            <div style={{background: '#f0f8ff', padding: '10px', borderRadius: '5px', marginTop: '10px'}}>
              {Object.entries(result).map(([category, data]) => (
                <div key={category} style={{marginBottom: '5px'}}>
                  <strong>{category}:</strong> {data.percentageScore} - {data.descriptions || 'No description'}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;