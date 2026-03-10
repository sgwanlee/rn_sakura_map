/**
 * Verify cherry blossom spot coordinates using Naver Geocoding API.
 *
 * Usage:
 *   node scripts/verify-coords.js
 */

require("dotenv").config();
const { initializeApp, applicationDefault } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

const PROJECT_ID = "sakura-map-15a21";
const COLLECTION = "cherry_spots";

const NCP_CLIENT_ID = process.env.EXPO_PUBLIC_NAVER_MAP_CLIENT_ID;
const NCP_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET;

initializeApp({
  credential: applicationDefault(),
  projectId: PROJECT_ID,
});
const db = getFirestore();

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function geocode(query) {
  const url = `https://naveropenapi.apigw.ntruss.com/map-geocode/v2/geocode?query=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: {
      "X-NCP-APIGW-API-KEY-ID": NCP_CLIENT_ID,
      "X-NCP-APIGW-API-KEY": NCP_CLIENT_SECRET,
    },
  });
  const data = await res.json();
  if (data.addresses && data.addresses.length > 0) {
    const addr = data.addresses[0];
    return {
      lat: parseFloat(addr.y),
      lng: parseFloat(addr.x),
      roadAddress: addr.roadAddress || addr.jibunAddress,
    };
  }
  return null;
}

function distKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function main() {
  console.log("Fetching spots from Firestore...\n");
  const snapshot = await db.collection(COLLECTION).get();
  const spots = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  spots.sort((a, b) => a.region.localeCompare(b.region) || a.title.localeCompare(b.title));

  const failed = [];
  const mismatch = [];
  const ok = [];

  for (const spot of spots) {
    // Try multiple queries: title + subRegion, then just title
    const queries = [
      `${spot.title} ${spot.subRegion}`,
      spot.title,
    ];

    let result = null;
    for (const q of queries) {
      result = await geocode(q);
      if (result) break;
      await sleep(200);
    }

    if (!result) {
      failed.push(spot);
      console.log(`  ❌ ${spot.title} (${spot.region} ${spot.subRegion}) — geocode 실패`);
      await sleep(200);
      continue;
    }

    const dist = distKm(spot.latitude, spot.longitude, result.lat, result.lng);

    if (dist > 2) {
      mismatch.push({ ...spot, newLat: result.lat, newLng: result.lng, dist, address: result.roadAddress });
      console.log(
        `  🔄 ${spot.title} — ${dist.toFixed(1)}km 차이 | 현재: (${spot.latitude}, ${spot.longitude}) → geocode: (${result.lat}, ${result.lng})`
      );
    } else {
      ok.push(spot);
      console.log(`  ✅ ${spot.title} — OK (${dist.toFixed(1)}km)`);
    }

    await sleep(200);
  }

  // Summary
  console.log("\n========== 결과 ==========");
  console.log(`✅ 정상: ${ok.length}개`);
  console.log(`🔄 좌표 불일치 (>2km): ${mismatch.length}개`);
  console.log(`❌ Geocode 실패: ${failed.length}개`);

  if (mismatch.length > 0) {
    console.log("\n--- 좌표 불일치 목록 ---");
    for (const s of mismatch) {
      console.log(`  ${s.title} (${s.region} ${s.subRegion}): ${s.dist.toFixed(1)}km 차이`);
      console.log(`    현재: (${s.latitude}, ${s.longitude})`);
      console.log(`    수정: (${s.newLat}, ${s.newLng})`);
    }

    // Auto-fix prompt
    console.log("\n--- 자동 수정 ---");
    console.log("불일치 항목을 Firestore에 업데이트합니다...");
    for (const s of mismatch) {
      await db.collection(COLLECTION).doc(s.id).update({
        latitude: s.newLat,
        longitude: s.newLng,
      });
      console.log(`  ✅ ${s.title} updated`);
    }
    console.log("업데이트 완료!");
  }

  if (failed.length > 0) {
    console.log("\n--- Geocode 실패 목록 (수동 확인 필요) ---");
    for (const s of failed) {
      console.log(`  - ${s.title} (${s.region} ${s.subRegion}) | 현재: (${s.latitude}, ${s.longitude})`);
    }
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
