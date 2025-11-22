"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Camera, Video, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Holistic, Results } from "@mediapipe/holistic";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import {
  POSE_CONNECTIONS,
  HAND_CONNECTIONS,
  FACEMESH_TESSELATION,
} from "@mediapipe/holistic";

type SignDetectionProps = {
  videoUrl: string;
  targetSign: string;
  challengeId: number;
  onComplete: (isCorrect: boolean) => void;
};

export const SignDetection = ({
  videoUrl,
  targetSign,
  challengeId,
  onComplete,
}: SignDetectionProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<{
    isCorrect: boolean;
    confidence: number;
    detectedSign?: string;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const holisticRef = useRef<Holistic | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize MediaPipe Holistic (Pose + Hands + Face)
  const initializeHolistic = useCallback(() => {
    if (holisticRef.current) return;

    const holistic = new Holistic({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`;
      },
    });

    holistic.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      smoothSegmentation: false,
      refineFaceLandmarks: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    holistic.onResults((results: Results) => {
      if (canvasRef.current && videoRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Clear canvas
        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw pose landmarks (body/arms)
        if (results.poseLandmarks) {
          drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, {
            color: "#00FF00",
            lineWidth: 4,
          });
          drawLandmarks(ctx, results.poseLandmarks, {
            color: "#FF0000",
            lineWidth: 2,
            radius: 4,
          });
        }

        // Draw left hand landmarks
        if (results.leftHandLandmarks) {
          drawConnectors(ctx, results.leftHandLandmarks, HAND_CONNECTIONS, {
            color: "#00FFFF",
            lineWidth: 3,
          });
          drawLandmarks(ctx, results.leftHandLandmarks, {
            color: "#0088FF",
            lineWidth: 2,
            radius: 3,
          });
        }

        // Draw right hand landmarks
        if (results.rightHandLandmarks) {
          drawConnectors(ctx, results.rightHandLandmarks, HAND_CONNECTIONS, {
            color: "#00FFFF",
            lineWidth: 3,
          });
          drawLandmarks(ctx, results.rightHandLandmarks, {
            color: "#0088FF",
            lineWidth: 2,
            radius: 3,
          });
        }

        ctx.restore();
      }
    });

    holisticRef.current = holistic;
  }, []);

  // Detect pose and hands continuously
  const detectHolistic = useCallback(async () => {
    if (
      videoRef.current &&
      holisticRef.current &&
      videoRef.current.readyState === 4
    ) {
      try {
        await holisticRef.current.send({ image: videoRef.current });
      } catch (error) {
        console.error("Error detecting holistic:", error);
      }
    }

    // Continue detection loop
    animationFrameRef.current = requestAnimationFrame(detectHolistic);
  }, []);

  const stopCamera = useCallback(() => {
    // Cancel animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach((track) => track.stop());
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    try {
      // Stop any existing camera stream first
      stopCamera();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          if (canvasRef.current && videoRef.current) {
            // Set canvas size to match video
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
          }

          // Initialize MediaPipe Holistic and start detection
          initializeHolistic();
          detectHolistic();
        };
      }
      toast.success("Camera đã sẵn sàng!");
    } catch (error: any) {
      console.error("Error accessing camera:", error);

      // Detailed error messages based on error type
      if (
        error.name === "NotAllowedError" ||
        error.name === "PermissionDeniedError"
      ) {
        toast.error(
          "Trình duyệt chặn quyền camera!\n\nCách sửa:\n1. Nhấn vào biểu tượng bên cạnh URL\n2. Chọn 'Cho phép' camera\n3. Tải lại trang (F5)",
          { duration: 10000 }
        );
      } else if (
        error.name === "NotFoundError" ||
        error.name === "DevicesNotFoundError"
      ) {
        toast.error("❌ Không tìm thấy camera! Vui lòng kết nối webcam.", {
          duration: 5000,
        });
      } else if (
        error.name === "NotReadableError" ||
        error.name === "TrackStartError"
      ) {
        toast.error(
          "❌ Camera đang được sử dụng!\n\nĐóng các ứng dụng khác (Zoom, Teams, v.v.) và thử lại.",
          { duration: 5000 }
        );
      } else {
        toast.error(`❌ Lỗi: ${error.message}`, { duration: 5000 });
      }
    }
  }, [stopCamera, initializeHolistic, detectHolistic]);

  const startRecording = () => {
    if (!videoRef.current?.srcObject) {
      toast.error("Vui lòng bật camera trước");
      return;
    }

    const stream = videoRef.current.srcObject as MediaStream;
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: "video/webm",
    });

    mediaRecorderRef.current = mediaRecorder;
    chunksRef.current = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    mediaRecorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      await analyzeSign(blob);
    };

    mediaRecorder.start();
    setIsRecording(true);

    // Auto-stop after 5 seconds
    setTimeout(() => {
      if (mediaRecorder.state === "recording") {
        stopRecording();
      }
    }, 5000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const analyzeSign = async (videoBlob: Blob) => {
    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append("video", videoBlob);
      formData.append("targetSign", targetSign);
      formData.append("challengeId", challengeId.toString());

      const response = await fetch("/api/detect-sign", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Detection failed");
      }

      const data = await response.json();

      setResult({
        isCorrect: data.isCorrect,
        confidence: data.confidence,
        detectedSign: data.detectedSign,
      });

      // Auto-continue after showing result
      setTimeout(() => {
        onComplete(data.isCorrect);
      }, 2000);
    } catch (error) {
      console.error("Error analyzing sign:", error);
      toast.error("Lỗi phân tích. Vui lòng thử lại.");
      setIsAnalyzing(false);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Reset state and restart camera when challenge changes
  useEffect(() => {
    // Reset all state when new challenge comes
    setResult(null);
    setIsAnalyzing(false);
    setIsRecording(false);
    chunksRef.current = [];

    // Start fresh camera
    startCamera();

    return () => {
      stopCamera();
      // Cleanup MediaPipe Holistic
      if (holisticRef.current) {
        holisticRef.current.close();
        holisticRef.current = null;
      }
    };
  }, [challengeId, targetSign, startCamera, stopCamera]); // Restart when challenge changes

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-center gap-8 lg:flex-row">
      {/* Left: Reference Video */}
      <div className="w-full flex-1">
        <h3 className="mb-4 text-center text-xl font-bold">Video mẫu</h3>
        <div className="aspect-video w-full overflow-hidden rounded-xl border-4 border-green-500 bg-gray-100 shadow-lg">
          <iframe
            src={`${videoUrl}?autoplay=1&loop=1&title=0&byline=0&portrait=0&badge=0`}
            className="h-full w-full"
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        </div>
        <div className="mt-4 text-center">
          <div className="inline-block rounded-xl border-2 border-green-500 bg-green-100 px-6 py-3">
            <p className="text-2xl font-bold text-green-700">{targetSign}</p>
          </div>
        </div>
      </div>

      {/* Right: User's Camera */}
      <div className="w-full flex-1">
        <h3 className="mb-4 text-center text-xl font-bold">Lượt của bạn</h3>
        <div className="relative aspect-video w-full overflow-hidden rounded-xl border-4 border-blue-500 bg-gray-900 shadow-lg">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full scale-x-[-1] object-cover"
          />

          {/* Canvas overlay for hand landmarks */}
          <canvas
            ref={canvasRef}
            className="absolute left-0 top-0 h-full w-full scale-x-[-1]"
          />

          {/* Recording Indicator */}
          {isRecording && (
            <div className="absolute right-4 top-4 flex animate-pulse items-center gap-2 rounded-full bg-red-500 px-3 py-1 text-white">
              <div className="h-3 w-3 rounded-full bg-white" />
              <span className="text-sm font-bold">REC</span>
            </div>
          )}

          {/* Result Overlay */}
          {result && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80">
              <div className="text-center">
                {result.isCorrect ? (
                  <>
                    <CheckCircle className="mx-auto mb-4 h-24 w-24 text-green-500" />
                    <p className="mb-2 text-3xl font-bold text-white">
                      Chính xác! 🎉
                    </p>
                    <p className="text-xl text-gray-300">
                      Độ chính xác: {result.confidence}%
                    </p>
                  </>
                ) : (
                  <>
                    <XCircle className="mx-auto mb-4 h-24 w-24 text-red-500" />
                    <p className="mb-2 text-3xl font-bold text-white">
                      Chưa đúng 😊
                    </p>
                    <p className="text-xl text-gray-300">
                      Phát hiện: {result.detectedSign || "Không rõ"}
                    </p>
                    <p className="mt-2 text-lg text-gray-400">Hãy thử lại!</p>
                  </>
                )}
              </div>
            </div>
          )}

          {isAnalyzing && !result && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80">
              <div className="text-center">
                <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                <p className="text-xl font-bold text-white">
                  Đang phân tích...
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="mt-6 flex flex-col gap-3">
          {!isRecording && !isAnalyzing && !result && (
            <>
              <Button
                onClick={startRecording}
                size="lg"
                variant="super"
                className="w-full"
              >
                <Video className="mr-2" />
                Bắt đầu ghi hình (5s)
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Thực hiện dấu hiệu trước camera
              </p>
            </>
          )}

          {isRecording && (
            <Button
              onClick={stopRecording}
              size="lg"
              variant="danger"
              className="w-full"
            >
              Dừng và phân tích
            </Button>
          )}

          {result && !result.isCorrect && (
            <Button
              onClick={() => {
                setResult(null);
                setIsAnalyzing(false);
              }}
              size="lg"
              variant="secondary"
              className="w-full"
            >
              Thử lại
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
