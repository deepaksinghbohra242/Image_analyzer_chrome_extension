import React, { useEffect, useState } from 'react';
import { analyzeImage } from './analyzeImage';
import { getCurrentTabUrl, getGoogleEmail, getCurrentTimestamp } from './getUserData';

function Test() {
  const [data, setData] = useState({ url: '', time: '', email: '' });
  const [result, setResult] = useState(null);
  const API_Key = import.meta.env.VITE_API_KEY;

  useEffect(() => {
    (async () => {
      try {
        const [url, email] = await Promise.all([
          getCurrentTabUrl(),
          getGoogleEmail()
        ]);
        const time = getCurrentTimestamp();

        setData({ url, time, email });

        // Optional: only analyze if it's an image URL
        if (url && (url.endsWith('.jpg') || url.endsWith('.png') || url.endsWith('.jpeg'))) {
          const categorized = await analyzeImage(url, API_Key);
          setResult(categorized);
        }
      } catch (err) {
        console.error('Error:', err);
      }
    })();
  }, []);

  async function handleClick() {
    if (!data.url) return;
    try {
      const categorized = await analyzeImage(data.url, API_Key);
      setResult(categorized);
    } catch (err) {
      console.error('Analyze error:', err);
    }
  }

  return (
    <div style={{ padding: "20px", width: 350 }}>
      <h2>Image Analysis</h2>
      <p><strong>Email:</strong> {data.email || "Loading..."}</p>
      <p><strong>Timestamp:</strong> {data.time || "Loading..."}</p>
      <p><strong>URL:</strong> {data.url || "Loading..."}</p>

      {data.url && (
        <img src={data.url} alt="Analyzed" width={300} style={{ marginTop: 10 }} />
      )}

      <br />
      <button onClick={handleClick} style={{ marginTop: 10 }}>
        Analyze Image
      </button>

      {result && (
        <div style={{ marginTop: "20px" }}>
          {Object.entries(result).map(([category, items]) => (
            <div key={category}>
              <h4>{category.toUpperCase()}</h4>
              {items.length > 0 ? (
                <ul>
                  {items.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p>None detected.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Test;
