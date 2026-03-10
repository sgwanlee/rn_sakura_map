/**
 * failed-addresses.json의 address를 수정한 후 실행하면
 * geocoding → Firestore 업데이트를 수행합니다.
 *
 * Usage:
 *   1. scripts/failed-addresses.json 의 "address" 필드를 수정
 *      - 또는 "lat", "lng" 를 직접 입력하면 geocoding 없이 바로 적용
 *   2. node scripts/fix-addresses.js
 */

const fs = require("fs");
const path = require("path");
const { initializeApp, applicationDefault } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
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

async function main() {
  const jsonPath = path.join(__dirname, "failed-addresses.json");
  const items = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

  let ok = 0, fail = 0;
  const stillFailed = [];

  for (const item of items) {
    // lat, lng가 직접 입력된 경우 geocoding 스킵
    if (item.lat && item.lng) {
      const lat = parseFloat(item.lat);
      const lng = parseFloat(item.lng);
      console.log(`[${item.title}] → 직접 입력: ${lat}, ${lng}`);
      await db.collection(COLLECTION).doc(item.id).set({
        title: item.title,
        ...(item.address ? { address: item.address } : {}),
        latitude: lat,
        longitude: lng,
      }, { merge: true });
      ok++;
      continue;
    }

    console.log(`[${item.title}] → ${item.address}`);
    const coords = await geocode(item.address);
    await sleep(100);

    if (coords) {
      console.log(`  ✓ ${coords.lat}, ${coords.lng}`);
      await db.collection(COLLECTION).doc(item.id).set({
        title: item.title,
        address: item.address,
        latitude: coords.lat,
        longitude: coords.lng,
      }, { merge: true });
      ok++;
    } else {
      console.log(`  ✗ FAILED`);
      stillFailed.push(item);
      fail++;
    }
  }

  // 실패 항목만 다시 JSON에 저장
  fs.writeFileSync(jsonPath, JSON.stringify(stillFailed, null, 2), "utf-8");

  console.log(`\n=== ${ok} 성공, ${fail} 실패 ===`);
  if (stillFailed.length > 0) {
    console.log(`failed-addresses.json에 ${stillFailed.length}개 남아있음. 주소 수정 후 재실행.`);
  } else {
    console.log("모두 완료!");
  }
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
