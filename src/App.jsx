import React, { useState, useEffect } from "react";
import { analyzeImage } from "./analyzeImage";
import "./app.css";

function App() {
  const [url, setUrl] = useState(
    "https://upload.wikimedia.org/wikipedia/commons/f/f7/M16_and_AK-47_comparison.png"
  );
  const [timestamp, setTimestamp] = useState("");
  const [result, setResult] = useState(null);
  const API_Key = import.meta.env.VITE_API_KEY;

  useEffect(() => {
    if (typeof chrome !== "undefined" && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentUrl = tabs[0]?.url;
        if (currentUrl) {
          setUrl(currentUrl);
          setTimestamp(new Date().toISOString());

          analyzeImage(currentUrl, API_Key)
            .then((categorized) => setResult(categorized))
            .catch((err) => console.error("Analyze error:", err));
        }
      });
    }
  }, []);

  const handleClick = async () => {
    if (!url) return;

    try {
      const categorized = await analyzeImage(url, API_Key);
      setResult(categorized);
      setTimestamp(new Date().toISOString());
    } catch (err) {
      console.error("Analyze error on button click:", err);
    }
  };
  console.log("Result:", result);

  return (
    <>
      <div className="container">
        <h1>Image Analyzer</h1>
        <button onClick={handleClick}>Analyze Again</button>

        <div>
          <strong>URL:</strong> {url || "Fetching..."}
        </div>
        <div>
          <strong>Timestamp:</strong> {timestamp}
        </div>

        {result && (
          <div>
            <h2>Results:</h2>
            <ul className="result-list">
              {Object.entries(result).map(([key, value]) => {
                const descriptions = Array.isArray(value?.descriptions)
                  ? value.descriptions
                  : value?.descriptions
                  ? [value.descriptions]
                  : [];

                if (descriptions.length > 0 && descriptions[0] !== "") {
                  return (
                    <li key={key}>
                      <strong>{key}</strong>: {descriptions.join(", ")}
                    </li>
                  );
                }
                return null;
              })}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
