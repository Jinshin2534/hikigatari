import { useRef, useState, useEffect, useCallback } from 'react';
import * as faceapi from 'face-api.js';

export interface DetectedFace {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface UseFaceDetectionOptions {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  enabled: boolean;
}

export function useFaceDetection({ videoRef, canvasRef, enabled }: UseFaceDetectionOptions) {
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faces, setFaces] = useState<DetectedFace[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // モデルのロード
  useEffect(() => {
    const load = async () => {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      setModelsLoaded(true);
    };
    void load();
  }, []);

  const detectFaces = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !modelsLoaded || video.readyState < 2) return;

    const detections = await faceapi.detectAllFaces(
      video,
      new faceapi.TinyFaceDetectorOptions({ inputSize: 320 })
    );

    // 映像サイズ → canvas サイズへ座標変換
    const scaleX = canvas.width / video.videoWidth;
    const scaleY = canvas.height / video.videoHeight;

    setFaces(detections.map(d => ({
      x: d.box.x * scaleX,
      y: d.box.y * scaleY,
      width: d.box.width * scaleX,
      height: d.box.height * scaleY,
    })));
  }, [videoRef, canvasRef, modelsLoaded]);

  // 100ms 間隔で検出 (約10fps)
  useEffect(() => {
    if (!enabled || !modelsLoaded) {
      setFaces([]);
      return;
    }
    intervalRef.current = setInterval(() => { void detectFaces(); }, 100);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [enabled, modelsLoaded, detectFaces]);

  return { faces, modelsLoaded };
}
