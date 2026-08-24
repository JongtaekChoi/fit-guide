"use client";

import { ChangeEvent, PointerEvent, useMemo, useRef, useState } from "react";
import {
  buildGuidance,
  calculateRatios,
  initialLandmarks,
  landmarkLabels,
  LandmarkKey,
  Landmarks,
} from "../lib/ratio";

const landmarkKeys = Object.keys(landmarkLabels) as LandmarkKey[];

const connections: [LandmarkKey, LandmarkKey][] = [
  ["headTop", "chin"],
  ["headLeft", "headRight"],
  ["leftShoulder", "rightShoulder"],
  ["leftShoulder", "leftWrist"],
  ["rightShoulder", "rightWrist"],
  ["leftShoulder", "leftHip"],
  ["rightShoulder", "rightHip"],
  ["leftHip", "rightHip"],
  ["leftHip", "leftAnkle"],
  ["rightHip", "rightAnkle"],
];

export default function Home() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [landmarks, setLandmarks] = useState<Landmarks>(initialLandmarks);
  const [selected, setSelected] = useState<LandmarkKey>("headTop");
  const [isDragging, setIsDragging] = useState<LandmarkKey | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => calculateRatios(landmarks), [landmarks]);
  const guidance = useMemo(() => buildGuidance(results), [results]);

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      window.alert("이미지 파일만 올릴 수 있어요.");
      return;
    }

    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setImageUrl(URL.createObjectURL(file));
    setLandmarks(initialLandmarks);
  };

  const updatePoint = (event: PointerEvent<SVGSVGElement>, key: LandmarkKey) => {
    const box = event.currentTarget.getBoundingClientRect();
    const x = Math.min(0.98, Math.max(0.02, (event.clientX - box.left) / box.width));
    const y = Math.min(0.98, Math.max(0.02, (event.clientY - box.top) / box.height));
    setLandmarks((current) => ({ ...current, [key]: { x, y } }));
  };

  const onPointerMove = (event: PointerEvent<SVGSVGElement>) => {
    if (!isDragging) return;
    updatePoint(event, isDragging);
  };

  return (
    <main>
      <section className="hero">
        <p className="eyebrow">FitGuide · Photo Ratio POC</p>
        <h1>내 몸의 비율을<br />먼저 이해해보세요.</h1>
        <p className="lede">
          전신사진 위의 기준점을 보정하면 상·하체, 어깨, 팔, 다리의 상대 비율을 확인할 수 있어요.
          사진은 이 브라우저 밖으로 전송되지 않습니다.
        </p>
      </section>

      <section className="workspace">
        <div className="panel upload-panel">
          <div className="panel-heading">
            <span className="step">01</span>
            <div>
              <h2>정면 전신사진</h2>
              <p>전신과 발바닥이 보이도록, 카메라는 허리 높이에서 촬영해 주세요.</p>
            </div>
          </div>

          <button className="upload-button" onClick={() => inputRef.current?.click()}>
            {imageUrl ? "다른 사진 선택" : "사진 선택"}
          </button>
          <input ref={inputRef} className="sr-only" type="file" accept="image/*" onChange={handleFile} />

          <ul className="shooting-guide">
            <li>몸의 윤곽이 보이는 단색 옷을 권장해요.</li>
            <li>팔과 다리는 몸통에서 살짝 떨어뜨려 주세요.</li>
            <li>거울 셀카와 과도한 광각은 피하세요.</li>
          </ul>
        </div>

        <div className="panel canvas-panel">
          <div className="panel-heading">
            <span className="step">02</span>
            <div>
              <h2>기준점 보정</h2>
              <p>점은 드래그하거나, 아래 목록에서 선택한 뒤 사진을 눌러 옮길 수 있어요.</p>
            </div>
          </div>

          {imageUrl ? (
            <div className="image-stage">
              <img src={imageUrl} alt="업로드한 전신사진" draggable={false} />
              <svg
                viewBox="0 0 1000 1000"
                preserveAspectRatio="none"
                onPointerMove={onPointerMove}
                onPointerUp={() => setIsDragging(null)}
                onPointerLeave={() => setIsDragging(null)}
                onClick={(event) => {
                  if (!isDragging) updatePoint(event, selected);
                }}
              >
                {connections.map(([from, to]) => (
                  <line
                    key={`${from}-${to}`}
                    x1={landmarks[from].x * 1000}
                    y1={landmarks[from].y * 1000}
                    x2={landmarks[to].x * 1000}
                    y2={landmarks[to].y * 1000}
                  />
                ))}
                {landmarkKeys.map((key) => (
                  <g key={key} className={selected === key ? "active-point" : ""}>
                    <circle
                      cx={landmarks[key].x * 1000}
                      cy={landmarks[key].y * 1000}
                      r="18"
                      onPointerDown={(event) => {
                        event.stopPropagation();
                        setSelected(key);
                        setIsDragging(key);
                        event.currentTarget.setPointerCapture(event.pointerId);
                      }}
                    />
                    <text x={landmarks[key].x * 1000 + 24} y={landmarks[key].y * 1000 - 18}>
                      {landmarkLabels[key]}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          ) : (
            <div className="empty-stage">
              <span>사진을 선택하면<br />여기에 기준점이 표시됩니다.</span>
            </div>
          )}

          <div className="landmark-picker">
            {landmarkKeys.map((key) => (
              <button
                className={selected === key ? "selected" : ""}
                key={key}
                onClick={() => setSelected(key)}
              >
                {landmarkLabels[key]}
              </button>
            ))}
          </div>
        </div>

        <div className="panel results-panel">
          <div className="panel-heading">
            <span className="step">03</span>
            <div>
              <h2>내 비율 카드</h2>
              <p>절대 치수가 아닌 사진 속 상대 비율입니다.</p>
            </div>
          </div>

          <div className="ratio-list">
            {results.map((result) => (
              <article className="ratio-card" key={result.label}>
                <span>{result.label}</span>
                <strong>{result.value}</strong>
                <p>{result.explanation}</p>
              </article>
            ))}
          </div>

          <div className="guidance">
            <p className="guidance-label">기본 코디 원칙</p>
            {guidance.map((item) => (
              <article key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
