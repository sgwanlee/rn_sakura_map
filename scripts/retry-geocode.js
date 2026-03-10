const path = require("path");
const { initializeApp, applicationDefault } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { syncLocal } = require("./sync-local");
require("dotenv").config();

const PROJECT_ID = "sakura-map-15a21";
const COLLECTION = "cherry_spots";
const NAVER_CLIENT_ID = process.env.EXPO_PUBLIC_NAVER_MAP_CLIENT_ID;
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET;

initializeApp({ credential: applicationDefault(), projectId: PROJECT_ID });
const db = getFirestore();

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function geocode(address) {
  const url = `https://maps.apigw.ntruss.com/map-geocode/v2/geocode?query=${encodeURIComponent(address)}`;
  const res = await fetch(url, {
    headers: {
      "X-NCP-APIGW-API-KEY-ID": NAVER_CLIENT_ID,
      "X-NCP-APIGW-API-KEY": NAVER_CLIENT_SECRET,
    },
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (data.addresses && data.addresses.length > 0) {
    return { lat: parseFloat(data.addresses[0].y), lng: parseFloat(data.addresses[0].x) };
  }
  return null;
}

// "일대" 제거한 주소로 재시도
const FAILED = [
  { id: "워커힐길", address: "서울 광진구 워커힐로" },
  { id: "벚꽃로", address: "서울 금천구 벚꽃로" },
  { id: "성내천길", address: "서울 송파구 성내천로" },
  { id: "안양천_제방양화교~오금교", address: "서울 양천구 안양천로" },
  { id: "여의도_윤중로_벚꽃길", address: "서울 영등포구 여의서로" },
  { id: "남산공원_순환로", address: "서울 중구 남산공원길 105" },
  { id: "중랑천_벚꽃길", address: "서울 중랑구 중랑천로" },
  { id: "삼회리_벚꽃길", address: "경기 가평군 설악면 삼회리" },
  { id: "팔당호_벚꽃길", address: "경기 광주시 남종면 산수로" },
  { id: "충훈벚꽃길", address: "경기 안양시 만안구 석수동" },
  { id: "갈산공원", address: "경기 양평군 양평읍 양근리" },
  { id: "흥천_남한강_벚꽃길", address: "경기 여주시 흥천면 귀백리" },
  { id: "왕송호수", address: "경기 의왕시 왕송못동로" },
  { id: "신석체육공원", address: "인천 동구 신석동" },
  { id: "경포호_벚꽃길", address: "강원 강릉시 저동" },
  { id: "영랑호_벚꽃길", address: "강원 속초시 영랑호반길" },
  { id: "반곡역_벚꽃길", address: "강원 원주시 반곡동" },
  { id: "공지천_벚꽃길", address: "강원 춘천시 근화동" },
  { id: "의암호_벚꽃길", address: "강원 춘천시 삼천동" },
  { id: "원성천", address: "충남 천안시 동남구 원성동" },
  { id: "무심천_벚꽃길", address: "충북 청주시 상당구 무심동로" },
  { id: "상당산성", address: "충북 청주시 상당구 산성로" },
  { id: "섬진강_벚꽃길", address: "전남 구례군 문척면 섬진강대로" },
  { id: "나주읍성", address: "전남 나주시 정수루길" },
  { id: "대원사_벚꽃길", address: "전남 보성군 문덕면 죽산리" },
  { id: "옥천골_벚꽃길", address: "전북 순창군 순창읍 옥천로" },
  { id: "여천천_벚꽃길", address: "전남 여수시 선원동" },
  { id: "대릉원_돌담길", address: "경북 경주시 계림로" },
  { id: "보문호_벚꽃길", address: "경북 경주시 보문로" },
  { id: "맥도생태공원_벚꽃길", address: "부산 강서구 낙동남로 1240" },
  { id: "온천천_벚꽃터널", address: "부산 동래구 온천천로" },
  { id: "개금벚꽃길", address: "부산 부산진구 개금온정로" },
  { id: "동대신동_벚꽃거리", address: "부산 서구 대신공원로" },
  { id: "광려천_벚꽃길", address: "경남 창원시 마산회원구 내서읍" },
  { id: "경화역_벚꽃길", address: "경남 창원시 진해구 경화동" },
  { id: "여좌천_로망스다리", address: "경남 창원시 진해구 여좌동" },
  { id: "쌍계사_십리벚꽃길", address: "경남 하동군 화개면 화개로" },
  { id: "전농로_왕벚꽃길", address: "제주 제주시 전농로" },
  { id: "장전리_왕벚꽃길", address: "제주 제주시 애월읍 장전리" },
];

async function main() {
  let ok = 0, fail = 0;
  const stillFailed = [];

  for (const item of FAILED) {
    console.log(`Geocoding: ${item.id} (${item.address})`);
    const coords = await geocode(item.address);
    await sleep(100);
    if (coords) {
      console.log(`  OK: ${coords.lat}, ${coords.lng}`);
      const updates = { latitude: coords.lat, longitude: coords.lng };
      await db.collection(COLLECTION).doc(item.id).update(updates);
      syncLocal(item.id, updates);
      ok++;
    } else {
      console.log(`  STILL FAILED`);
      stillFailed.push(item);
      fail++;
    }
  }

  console.log(`\n=== Results: ${ok} OK, ${fail} FAILED ===`);
  if (stillFailed.length > 0) {
    console.log("Still failed:");
    stillFailed.forEach(f => console.log(`  - ${f.id}: ${f.address}`));
  }
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
