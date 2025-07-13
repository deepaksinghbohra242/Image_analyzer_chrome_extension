import {
  BodyParts,
  Gross,
  Lingerie,
  Profanity,
  Racy,
  Inappropriate,
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
    const annotations = data.responses[0];

    const labels = annotations.labelAnnotations || [];

    const categories = {
      racy: { totalScore: 0, count: 0, descriptions: "" },
      "underwear/lingerie": { totalScore: 0, count: 0, descriptions: "" },
      "body parts": { totalScore: 0, count: 0, descriptions: "" },
      gross: { totalScore: 0, count: 0, descriptions: "" },
      profanity: { totalScore: 0, count: 0, descriptions: "" },
      inappropriate: { totalScore: 0, count: 0, descriptions: "" },
      other: { totalScore: 0, count: 0, descriptions: "" },
    };

    for (let label of labels) {
      const desc = label.description.toLowerCase();
      const score = label.score;

      let category = "other";
      if (
        Lingerie.some((word) => new RegExp(`\\b${word}\\b`, "i").test(desc))
      ) {
        category = "underwear/lingerie";
      } else if (
        BodyParts.some((word) => new RegExp(`\\b${word}\\b`, "i").test(desc))
      ) {
        category = "body parts";
      } else if (
        Gross.some((word) => new RegExp(`\\b${word}\\b`, "i").test(desc))
      ) {
        category = "gross";
      } else if (
        Profanity.some((word) => new RegExp(`\\b${word}\\b`, "i").test(desc))
      ) {
        category = "profanity";
      } else if (
        Racy.some((word) => new RegExp(`\\b${word}\\b`, "i").test(desc))
      ) {
        category = "racy";
      } else if (
        Inappropriate.some((word) =>
          new RegExp(`\\b${word}\\b`, "i").test(desc)
        )
      ) {
        category = "inappropriate";
      }

      categories[category].totalScore += score;
      categories[category].count += 1;
      categories[category].descriptions += desc + ", ";
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
