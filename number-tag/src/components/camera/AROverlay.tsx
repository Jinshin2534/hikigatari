import { useRef, useEffect } from 'react';
import type { DetectedFace } from '../../hooks/useFaceDetection';
import type { UserWithNumber } from '../../types';
import { CATEGORY_LABELS } from '../../types';
import type { NumberCategory } from '../../types';

interface AROverlayProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  faces: DetectedFace[];
  nearbyUsers: UserWithNumber[];
  onFaceTap?: (userId: string) => void;
}

export function AROverlay({ videoRef, faces, nearbyUsers, onFaceTap }: AROverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // canvas サイズを video に合わせる
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const observer = new ResizeObserver(() => {
      canvas.width = video.clientWidth;
      canvas.height = video.clientHeight;
    });
    observer.observe(video);
    return () => observer.disconnect();
  }, [videoRef]);

  // 顔の上に数字を描画
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 顔とユーザーをインデックスで対応（プロトタイプ：順番で割り当て）
    faces.forEach((face, i) => {
      const userWithNumber = nearbyUsers[i % nearbyUsers.length];
      if (!userWithNumber) return;

      const { number, profile } = userWithNumber;
      const level = number.display_level;

      const centerX = face.x + face.width / 2;
      const tagY = face.y - 12;
      const fontSize = Math.max(16, Math.min(28, face.width * 0.3));

      // ラベルテキスト
      let label = String(number.number_value);
      if (level >= 2) label += `  ${profile.nickname}`;
      if (level >= 3) label += `  ${CATEGORY_LABELS[number.category as NumberCategory]}`;

      ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
      const metrics = ctx.measureText(label);
      const padX = 14;
      const padY = 8;
      const tagW = metrics.width + padX * 2;
      const tagH = fontSize + padY * 2;

      // 背景の丸角矩形
      ctx.fillStyle = number.color;
      ctx.beginPath();
      const r = tagH / 2;
      const x0 = centerX - tagW / 2;
      const y0 = tagY - tagH;
      ctx.moveTo(x0 + r, y0);
      ctx.lineTo(x0 + tagW - r, y0);
      ctx.arcTo(x0 + tagW, y0, x0 + tagW, y0 + r, r);
      ctx.lineTo(x0 + tagW, y0 + tagH - r);
      ctx.arcTo(x0 + tagW, y0 + tagH, x0 + tagW - r, y0 + tagH, r);
      ctx.lineTo(x0 + r, y0 + tagH);
      ctx.arcTo(x0, y0 + tagH, x0, y0 + tagH - r, r);
      ctx.lineTo(x0, y0 + r);
      ctx.arcTo(x0, y0, x0 + r, y0, r);
      ctx.closePath();
      ctx.fill();

      // テキスト
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, centerX, y0 + tagH / 2);
    });
  }, [faces, nearbyUsers]);

  // タップでユーザー詳細へ
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const tapX = e.clientX - rect.left;
    const tapY = e.clientY - rect.top;

    const hitIndex = faces.findIndex(face =>
      tapX >= face.x && tapX <= face.x + face.width &&
      tapY >= face.y - face.height * 0.3 && tapY <= face.y + face.height
    );

    if (hitIndex >= 0 && onFaceTap) {
      const user = nearbyUsers[hitIndex % nearbyUsers.length];
      if (user) onFaceTap(user.profile.id);
    }
  };

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      className="absolute inset-0 pointer-events-auto"
      style={{ cursor: faces.length > 0 ? 'pointer' : 'default' }}
    />
  );
}
