/**
 * Geocode cherry blossom spots using Kakao Local API
 * and update Firestore documents with accurate coordinates.
 *
 * Usage:
 *   KAKAO_REST_KEY=your_key node scripts/geocode-spots.js
 *
 * If no KAKAO_REST_KEY, falls back to Nominatim (OpenStreetMap).
 */

const { initializeApp, applicationDefault } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

const PROJECT_ID = "sakura-map-15a21";
const COLLECTION = "cherry_spots";

initializeApp({
  credential: applicationDefault(),
  projectId: PROJECT_ID,
});
const db = getFirestore();

const KAKAO_KEY = process.env.KAKAO_REST_KEY;

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function geocodeNominatim(query) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=kr`;
  const res = await fetch(url, {
    headers: { "User-Agent": "sakura-map-geocoder/1.0" },
  });
  const data = await res.json();
  if (data.length > 0) {
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  }
  return null;
}

async function geocodeKakao(query) {
  const url = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}&size=1`;
  const res = await fetch(url, {
    headers: { Authorization: `KakaoAK ${KAKAO_KEY}` },
  });
  const data = await res.json();
  if (data.documents && data.documents.length > 0) {
    const doc = data.documents[0];
    return { lat: parseFloat(doc.y), lng: parseFloat(doc.x) };
  }
  return null;
}

async function geocode(title, region, subRegion) {
  // Try with full context first, then just title
  const queries = [
    `${title} ${subRegion}`,
    `${title} ${region}`,
    title,
  ];

  for (const query of queries) {
    const result = KAKAO_KEY
      ? await geocodeKakao(query)
      : await geocodeNominatim(query);

    if (result && result.lat !== 0) {
      return result;
    }
    await sleep(KAKAO_KEY ? 100 : 1100); // Nominatim rate limit: 1 req/sec
  }
  return null;
}

async function main() {
  console.log(`Using ${KAKAO_KEY ? "Kakao" : "Nominatim"} geocoding\n`);

  const snapshot = await db.collection(COLLECTION).get();
  const spots = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  let updated = 0;
  let failed = 0;

  for (const spot of spots) {
    const result = await geocode(spot.title, spot.region, spot.subRegion);

    if (!result) {
      console.log(`  ❌ ${spot.title} — geocode failed`);
      failed++;
      continue;
    }

    const oldLat = spot.latitude;
    const oldLng = spot.longitude;
    const dist = Math.sqrt(
      Math.pow(result.lat - oldLat, 2) + Math.pow(result.lng - oldLng, 2)
    );

    if (dist < 0.005) {
      console.log(`  ✅ ${spot.title} — OK (diff: ${dist.toFixed(4)}°)`);
      continue;
    }

    console.log(
      `  🔄 ${spot.title} — updating: (${oldLat}, ${oldLng}) → (${result.lat}, ${result.lng}) diff=${dist.toFixed(4)}°`
    );

    await db.collection(COLLECTION).doc(spot.id).update({
      latitude: result.lat,
      longitude: result.lng,
    });
    updated++;
    await sleep(100);
  }

  console.log(`\nDone! Updated: ${updated}, Failed: ${failed}, Total: ${spots.length}`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Geocode failed:", err);
  process.exit(1);
});
