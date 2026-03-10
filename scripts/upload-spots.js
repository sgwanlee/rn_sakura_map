/**
 * Upload cherry blossom spots from CSV to Firestore via firebase-admin + ADC.
 *
 * Prerequisites:
 *   npm install -D firebase-admin
 *   gcloud auth application-default login
 *
 * Usage:
 *   node scripts/upload-spots.js
 */

const fs = require("fs");
const path = require("path");
const { initializeApp, applicationDefault } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

const PROJECT_ID = "sakura-map-15a21";
const COLLECTION = "cherry_spots";

const CSV_PATH = path.join(
  process.env.HOME,
  "Downloads",
  "전국_벚꽃명소_네이버지도_확장판.csv"
);

initializeApp({
  credential: applicationDefault(),
  projectId: PROJECT_ID,
});
const db = getFirestore();

// Known coordinates
const COORDINATES = {
  "어린이대공원": { lat: 37.5500, lng: 127.0800 },
  "워커힐길": { lat: 37.5516, lng: 127.1073 },
  "벚꽃로": { lat: 37.4568, lng: 126.8955 },
  "경희대학교 서울캠퍼스": { lat: 37.5966, lng: 127.0512 },
  "양재천 벚꽃길": { lat: 37.4725, lng: 127.0390 },
  "서울숲": { lat: 37.5444, lng: 127.0374 },
  "석촌호수": { lat: 37.5103, lng: 127.1000 },
  "성내천길": { lat: 37.5180, lng: 127.1150 },
  "안양천 제방(양화교~오금교)": { lat: 37.5350, lng: 126.8650 },
  "여의도 윤중로 벚꽃길": { lat: 37.5286, lng: 126.9318 },
  "남산공원 순환로": { lat: 37.5512, lng: 126.9882 },
  "중랑천 벚꽃길": { lat: 37.6060, lng: 127.0650 },
  "삼회리 벚꽃길": { lat: 37.7970, lng: 127.4730 },
  "에덴벚꽃길": { lat: 37.8150, lng: 127.5100 },
  "서울대공원 벚꽃길": { lat: 37.4275, lng: 127.0168 },
  "팔당호 벚꽃길": { lat: 37.4900, lng: 127.3000 },
  "팔당 물안개공원": { lat: 37.5200, lng: 127.2800 },
  "율동공원": { lat: 37.3830, lng: 127.0980 },
  "경기도청 옛청사 벚꽃길": { lat: 37.2870, lng: 127.0015 },
  "충훈벚꽃길": { lat: 37.3865, lng: 126.9445 },
  "갈산공원": { lat: 37.4900, lng: 127.4900 },
  "흥천 남한강 벚꽃길": { lat: 37.3000, lng: 127.6000 },
  "에버랜드 벚꽃길": { lat: 37.2942, lng: 127.2026 },
  "왕송호수": { lat: 37.3690, lng: 126.9680 },
  "인천대공원": { lat: 37.4450, lng: 126.7530 },
  "신석체육공원": { lat: 37.4800, lng: 126.6500 },
  "SK인천석유화학 벚꽃동산": { lat: 37.5050, lng: 126.6100 },
  "송도 센트럴파크": { lat: 37.3925, lng: 126.6575 },
  "송도 트리플스트리트": { lat: 37.3800, lng: 126.6600 },
  "월미공원": { lat: 37.4750, lng: 126.5980 },
  "자유공원": { lat: 37.4780, lng: 126.6210 },
  "경포생태저류지": { lat: 37.7960, lng: 128.8960 },
  "경포호 벚꽃길": { lat: 37.7940, lng: 128.8880 },
  "설악산 벚꽃길": { lat: 38.1190, lng: 128.4650 },
  "영랑호 벚꽃길": { lat: 38.2120, lng: 128.5650 },
  "반곡역 벚꽃길": { lat: 37.3530, lng: 127.9230 },
  "공지천 벚꽃길": { lat: 37.8750, lng: 127.7300 },
  "의암호 벚꽃길": { lat: 37.8850, lng: 127.7100 },
  "충청남도역사박물관": { lat: 36.4570, lng: 127.1190 },
  "대청호 벚꽃길": { lat: 36.4770, lng: 127.4870 },
  "개심사": { lat: 36.7160, lng: 126.5720 },
  "문수사": { lat: 36.7350, lng: 126.5480 },
  "현충사": { lat: 36.7990, lng: 127.0660 },
  "각원사": { lat: 36.8070, lng: 127.1530 },
  "원성천": { lat: 36.8100, lng: 127.1400 },
  "무심천 벚꽃길": { lat: 36.6340, lng: 127.4880 },
  "상당산성": { lat: 36.6170, lng: 127.5200 },
  "섬진강 벚꽃길": { lat: 35.1170, lng: 127.4530 },
  "월명공원": { lat: 35.9870, lng: 126.7080 },
  "나주읍성": { lat: 34.9870, lng: 126.7170 },
  "관방제림": { lat: 35.3210, lng: 126.9800 },
  "대원사 벚꽃길": { lat: 34.8530, lng: 127.0330 },
  "옥천골 벚꽃길": { lat: 35.3740, lng: 127.1370 },
  "승월마을 승월저수지 벚꽃길": { lat: 34.7400, lng: 127.6600 },
  "여천천 벚꽃길": { lat: 34.7500, lng: 127.6400 },
  "전주동물원 벚꽃길": { lat: 35.8320, lng: 127.1550 },
  "대릉원 돌담길": { lat: 35.8370, lng: 129.2170 },
  "보문호 벚꽃길": { lat: 35.8400, lng: 129.2900 },
  "연지공원": { lat: 35.2350, lng: 128.8750 },
  "이월드": { lat: 35.8534, lng: 128.5647 },
  "맥도생태공원 벚꽃길": { lat: 35.0950, lng: 128.9350 },
  "온천천 벚꽃터널": { lat: 35.2050, lng: 129.0780 },
  "개금벚꽃길": { lat: 35.1380, lng: 129.0180 },
  "동대신동 벚꽃거리": { lat: 35.1050, lng: 129.0150 },
  "남천동 벚꽃거리": { lat: 35.1370, lng: 129.1110 },
  "무거천 벚꽃길": { lat: 35.5380, lng: 129.2560 },
  "진양호공원": { lat: 35.1600, lng: 128.0620 },
  "광려천 벚꽃길": { lat: 35.2200, lng: 128.5700 },
  "경화역 벚꽃길": { lat: 35.1400, lng: 128.6650 },
  "여좌천 로망스다리": { lat: 35.1500, lng: 128.6900 },
  "쌍계사 십리벚꽃길": { lat: 35.2260, lng: 127.6340 },
  "예래동 벚꽃길": { lat: 33.2500, lng: 126.4100 },
  "녹산로": { lat: 33.3550, lng: 126.7400 },
  "관음사 야영장 왕벚나무 자생지": { lat: 33.4250, lng: 126.5470 },
  "삼성혈": { lat: 33.5050, lng: 126.5310 },
  "신산공원": { lat: 33.5040, lng: 126.5180 },
  "전농로 왕벚꽃길": { lat: 33.5070, lng: 126.5350 },
  "제주대학교 입구": { lat: 33.4530, lng: 126.5620 },
  "장전리 왕벚꽃길": { lat: 33.4500, lng: 126.3500 },
};

function slugify(title) {
  return title
    .replace(/\s+/g, "_")
    .replace(/[()~]/g, "")
    .toLowerCase();
}

async function main() {
  const csv = fs.readFileSync(CSV_PATH, "utf-8");
  const lines = csv.trim().split("\n").slice(1);

  const batch = db.batch();
  let count = 0;

  for (const line of lines) {
    const parts = line.split(",");
    const region = parts[0]?.trim();
    const subRegion = parts[1]?.trim();
    const title = parts[2]?.trim();
    const mapUrl = parts[3]?.trim();
    if (!title) continue;

    const id = slugify(title);
    const coords = COORDINATES[title] || { lat: 0, lng: 0 };

    batch.set(db.collection(COLLECTION).doc(id), {
      region,
      subRegion,
      title,
      mapUrl,
      latitude: coords.lat,
      longitude: coords.lng,
    });
    count++;
    console.log(`  [${count}] ${region} > ${subRegion} > ${title}`);
  }

  console.log(`\nUploading ${count} spots to Firestore...`);
  await batch.commit();
  console.log("Done!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Upload failed:", err);
  process.exit(1);
});
