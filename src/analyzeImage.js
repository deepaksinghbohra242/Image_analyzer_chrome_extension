import {
  BodyParts,
  Gross,
  Lingerie,
  Profanity,
  Racy,
} from "./Data";

export async function analyzeImage(url, API_Key) {
  const requestBody = {
    requests: [
      {
        image: { source: { imageUri: url } },
        features: [
          { type: "SAFE_SEARCH_DETECTION" },
          { type: "LABEL_DETECTION" },
          { type: "TEXT_DETECTION" },
        ],
      },
    ],
  };

  try {
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${API_Key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      }
    );

    const data = await response.json();
    const annotations = data.responses?.[0] || {};

    const labels = annotations.labelAnnotations || [];
    const safeSearch = annotations.safeSearchAnnotation || {};
    const textAnnotations = annotations.textAnnotations || [];

    console.log("Labels:", labels); 

    const categories = {
      racy: { totalScore: 0, count: 0, descriptions: "" },
      "underwear/lingerie": { totalScore: 0, count: 0, descriptions: "" },
      "body parts": { totalScore: 0, count: 0, descriptions: "" },
      gross: { totalScore: 0, count: 0, descriptions: "" },
      profanity: { totalScore: 0, count: 0, descriptions: "" },
      other: { totalScore: 0, count: 0, descriptions: "" },
    };

    function categorizeText(text) {
      const lowerText = text.toLowerCase();
      
      if (Lingerie.some((word) => new RegExp(`\\b${word}\\b`, "i").test(lowerText))) {
        return "underwear/lingerie";
      } else if (BodyParts.some((word) => new RegExp(`\\b${word}\\b`, "i").test(lowerText))) {
        return "body parts";
      } else if (Gross.some((word) => new RegExp(`\\b${word}\\b`, "i").test(lowerText))) {
        return "gross";
      } else if (Profanity.some((word) => new RegExp(`\\b${word}\\b`, "i").test(lowerText))) {
        return "profanity";
      } else if (Racy.some((word) => new RegExp(`\\b${word}\\b`, "i").test(lowerText))) {
        return "racy";
      }
      return "other";
    }

    for (let label of labels) {
      const desc = label.description.toLowerCase();
      const score = label.score;
      const category = categorizeText(desc);

      categories[category].totalScore += score;
      categories[category].count += 1;
      categories[category].descriptions += desc + ", ";
    }

    if (textAnnotations.length > 1) {
      for (let i = 1; i < textAnnotations.length; i++) {
        const annotation = textAnnotations[i];
        const desc = annotation.description.toLowerCase();
        const category = categorizeText(desc);

        categories[category].totalScore += 1;
        categories[category].count += 1;
        categories[category].descriptions += desc + ", ";
      }
    }

    const safeSearchCategories = ["adult", "racy"];
    for (const type of safeSearchCategories) {
      const likelihood = safeSearch[type];
      let scoreToAdd = 0;
      
      if (likelihood === "VERY_LIKELY") {
        scoreToAdd = 1;
      } else if (likelihood === "LIKELY") {
        scoreToAdd = 0.9;
      } else if (likelihood === "POSSIBLE") {
        scoreToAdd = 0.8;
      }
      
      if (scoreToAdd > 0) {
        categories["racy"].descriptions += "racy content, ";
        categories["racy"].totalScore += scoreToAdd;
        categories["racy"].count += 1;
      }
    }

    const finalCategories = {};
    for (const [key, value] of Object.entries(categories)) {
      const { totalScore, count, descriptions } = value;
      finalCategories[key] = {
        percentageScore:
          count > 0 ? ((totalScore / count) * 100).toFixed(2) + "%" : "0%",
        descriptions: descriptions.endsWith(", ")
          ? descriptions.slice(0, -2)
          : descriptions,
      };
    }

    return finalCategories;
  } catch (error) {
    console.error("Error analyzing image:", error);
    return null;
  }
}