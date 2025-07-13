# 🧠 Image Analyzer Chrome Extension

A Chrome Extension that uses the **Google Vision API** to analyze images for inappropriate content, racy content, profanity, and more. Just right-click on an image, and get detailed content analysis using AI.

---

## 🚀 Features

- 🖼️ Right-click any image to analyze
- 🔍 Detect categories like:
  - Inappropriate
  - Racy
  - Profanity
  - Gross
  - Body Parts
- 🔐 Uses Google Cloud Vision API
- ⚡ Built using React + Vite for fast performance

---

## 📦 Tech Stack

- React
- Vite
- Google Vision API
- Chrome Extension (Manifest v3)

---

## 🔧 Setup Instructions

### 1. **Clone the Repository**
```bash
git clone https://github.com/your-username/image-analyzer-extension.git
cd image-analyzer-extension


### 2. **Install Dependencies**
```bash 
npm install


### 3. Add Google API Key
Create a .env file in the root directory:
```.env
VITE_API_KEY="your_google_vision_api_key"

### 4. Build the Extension
```bash
npm run build
This will generate a dist/ folder containing the compiled extension

### 5.  Load Extension in Chrome
- Open Chrome
- Go to chrome://extensions/
- Enable Developer Mode (top-right)
- Click Load unpacked
- Select the dist/ folder
You should now see the extension active

### 6. Usuage 
- Right-click on any image in your browser
- Choose "Analyze with Image Analyzer"
- A new tab will open showing the analysis results based on the Vision API response