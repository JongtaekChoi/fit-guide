export type Point = { x: number; y: number };

export type LandmarkKey =
  | "headTop"
  | "chin"
  | "headLeft"
  | "headRight"
  | "leftShoulder"
  | "rightShoulder"
  | "leftWrist"
  | "rightWrist"
  | "leftHip"
  | "rightHip"
  | "waist"
  | "leftAnkle"
  | "rightAnkle";

export type Landmarks = Record<LandmarkKey, Point>;

export const landmarkLabels: Record<LandmarkKey, string> = {
  headTop: "머리 꼭대기",
  chin: "턱 아래",
  headLeft: "머리 왼쪽",
  headRight: "머리 오른쪽",
  leftShoulder: "왼쪽 어깨",
  rightShoulder: "오른쪽 어깨",
  leftWrist: "왼쪽 손목",
  rightWrist: "오른쪽 손목",
  leftHip: "왼쪽 골반",
  rightHip: "오른쪽 골반",
  waist: "허리선",
  leftAnkle: "왼쪽 발목",
  rightAnkle: "오른쪽 발목",
};

export const initialLandmarks: Landmarks = {
  headTop: { x: 0.5, y: 0.08 },
  chin: { x: 0.5, y: 0.19 },
  headLeft: { x: 0.45, y: 0.13 },
  headRight: { x: 0.55, y: 0.13 },
  leftShoulder: { x: 0.37, y: 0.24 },
  rightShoulder: { x: 0.63, y: 0.24 },
  leftWrist: { x: 0.27, y: 0.5 },
  rightWrist: { x: 0.73, y: 0.5 },
  leftHip: { x: 0.43, y: 0.53 },
  rightHip: { x: 0.57, y: 0.53 },
  waist: { x: 0.5, y: 0.44 },
  leftAnkle: { x: 0.43, y: 0.91 },
  rightAnkle: { x: 0.57, y: 0.91 },
};

const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
const midpoint = (a: Point, b: Point): Point => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

const percent = (value: number) => Math.round(value * 100);

export type RatioResult = {
  label: string;
  value: string;
  explanation: string;
};

export function calculateRatios(points: Landmarks): RatioResult[] {
  const shoulder = midpoint(points.leftShoulder, points.rightShoulder);
  const hip = midpoint(points.leftHip, points.rightHip);
  const ankle = midpoint(points.leftAnkle, points.rightAnkle);
  const totalHeight = distance(points.headTop, ankle);

  if (totalHeight < 0.01) return [];

  const head = distance(points.headTop, points.chin) / totalHeight;
  const torso = distance(shoulder, hip) / totalHeight;
  const legs = distance(hip, ankle) / totalHeight;
  const arms =
    (distance(points.leftShoulder, points.leftWrist) +
      distance(points.rightShoulder, points.rightWrist)) /
    2 /
    totalHeight;
  const shoulderToHead = distance(points.leftShoulder, points.rightShoulder) /
    Math.max(distance(points.headLeft, points.headRight), 0.01);
  const waistPosition = distance(points.headTop, points.waist) / totalHeight;
  const shoulderToHip = distance(points.leftShoulder, points.rightShoulder) /
    Math.max(distance(points.leftHip, points.rightHip), 0.01);

  return [
    {
      label: "상체 : 하체",
      value: `${percent(torso)} : ${percent(legs)}`,
      explanation: torso > legs ? "상체 비율이 상대적으로 긴 편" : "하체 비율이 상대적으로 긴 편",
    },
    {
      label: "팔 길이",
      value: `${percent(arms)}% · 키 대비`,
      explanation: arms > 0.34 ? "팔 길이가 상대적으로 긴 편" : "팔 길이가 전체 비율과 균형적인 편",
    },
    {
      label: "어깨 : 머리너비",
      value: `${shoulderToHead.toFixed(1)} : 1`,
      explanation: shoulderToHead > 2.5 ? "머리 대비 어깨가 넓게 보이는 편" : "머리 대비 어깨 폭이 균형적인 편",
    },
    {
      label: "허리선 위치",
      value: `${percent(waistPosition)}% · 위에서부터`,
      explanation: waistPosition > 0.46 ? "허리선이 낮게 보일 수 있는 편" : "허리선이 비교적 높게 보이는 편",
    },
    {
      label: "어깨 : 골반",
      value: `${shoulderToHip.toFixed(1)} : 1`,
      explanation: shoulderToHip > 1.2 ? "상체가 역삼각형 방향의 실루엣" : "어깨와 골반 폭이 비교적 균형적인 실루엣",
    },
    {
      label: "머리 길이",
      value: `${percent(head)}% · 키 대비`,
      explanation: "사진 기준 상대 비율",
    },
  ];
}

export function buildGuidance(results: RatioResult[]) {
  const torso = results.find((result) => result.label === "상체 : 하체")?.explanation ?? "";
  const waist = results.find((result) => result.label === "허리선 위치")?.explanation ?? "";

  return [
    {
      title: "상의 길이",
      text: torso.includes("상체") ? "골반을 크게 덮는 긴 상의보다, 밑단이 골반 중간 부근에 오는 길이를 먼저 비교해 보세요." : "상의 총장을 지나치게 짧게 고정하기보다, 전체 실루엣과 바지 밑위를 함께 비교해 보세요.",
    },
    {
      title: "바지 선택",
      text: waist.includes("낮게") ? "중간 이상 밑위의 바지와 상의를 살짝 넣어 입는 방법이 시각적 허리선을 높이는 데 도움이 될 수 있어요." : "바지 밑위와 기장은 현재의 비교적 높은 허리선이 자연스럽게 유지되도록 고르세요.",
    },
    {
      title: "전체 비율",
      text: "상·하의 색 경계를 실제 허리선 부근에 두고, 구매 전에는 총장과 밑위를 함께 확인해 보세요.",
    },
  ];
}
