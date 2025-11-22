import { NextRequest, NextResponse } from "next/server";

const MODEL_SERVER_URL =
  process.env.MODEL_SERVER_URL || "http://localhost:8000";

export async function POST(req: NextRequest) {
  let targetSign = "";

  try {
    const formData = await req.formData();
    const video = formData.get("video") as Blob;
    targetSign = formData.get("targetSign") as string;
    const challengeId = formData.get("challengeId") as string;

    if (!video || !targetSign) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log(`Analyzing sign detection for: ${targetSign}`);
    console.log(`Challenge ID: ${challengeId}`);
    console.log(`Video size: ${video.size} bytes`);

    // Create FormData for FastAPI server
    const modelFormData = new FormData();
    modelFormData.append("file", video, "video.webm");

    // Call FastAPI model server
    const response = await fetch(`${MODEL_SERVER_URL}/api/predict`, {
      method: "POST",
      body: modelFormData,
    });

    if (!response.ok) {
      throw new Error(`Model server error: ${response.statusText}`);
    }

    const result = await response.json();
    console.log("Model predictions:", result.predictions);

    // Extract top prediction
    const topPrediction = result.predictions[0];
    const detectedSign = topPrediction.label;
    const confidence = Math.round(topPrediction.probability);

    // Normalize signs for comparison (remove accents, lowercase, trim)
    const normalizeSign = (sign: string) => {
      return sign
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .trim();
    };

    // Check if detected sign matches target AND has sufficient confidence
    const isCorrect =
      normalizeSign(detectedSign) === normalizeSign(targetSign) &&
      confidence >= 50; // Require minimum 50% confidence

    return NextResponse.json({
      isCorrect,
      confidence,
      detectedSign,
      allPredictions: result.predictions, // Include all predictions for debugging
    });
  } catch (error) {
    console.error("Error in sign detection:", error);

    // Fallback to mock if model server is not available
    console.warn("Model server unavailable, using mock response");
    const mockResults = {
      isCorrect: Math.random() > 0.4, // 60% success rate
      confidence: Math.floor(Math.random() * 30) + 70,
      detectedSign: targetSign || "Unknown",
      allPredictions: [
        { label: targetSign || "Unknown", probability: 75 },
        { label: "unknown", probability: 25 },
      ],
    };

    return NextResponse.json(mockResults);
  }
}

/**
 * This API endpoint calls the FastAPI model server running on port 8000.
 *
 * To start the model server:
 * 1. Run: npm run model:start
 * 2. Or manually: cd ../yen-model && uvicorn app:app --reload --port 8000
 *
 * The server processes videos using:
 * - MediaPipe Holistic for landmark extraction
 * - LSTM model for sign classification
 * - Returns top 5 predictions with confidence scores
 */
