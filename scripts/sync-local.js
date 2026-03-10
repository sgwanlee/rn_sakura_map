/**
 * Firestore 업데이트 시 geocode-results.json도 동기화하는 유틸리티.
 *
 * Usage:
 *   const { syncLocal } = require("./sync-local");
 *   syncLocal(id, { latitude: 35.1, longitude: 127.4, title: "새 이름" });
 */

const fs = require("fs");
const path = require("path");

const RESULTS_PATH = path.join(__dirname, "geocode-results.json");

/**
 * geocode-results.json에서 id에 해당하는 항목을 찾아 fields를 머지합니다.
 * 항목이 없으면 새로 추가합니다.
 */
function syncLocal(id, fields) {
  let results = [];
  try {
    results = JSON.parse(fs.readFileSync(RESULTS_PATH, "utf-8"));
  } catch {
    console.warn("[syncLocal] geocode-results.json 읽기 실패, 새로 생성합니다.");
  }

  const idx = results.findIndex((r) => r.id === id);
  if (idx >= 0) {
    results[idx] = { ...results[idx], ...fields };
    console.log(`  [sync] ${id} 업데이트`);
  } else {
    results.push({ id, ...fields });
    console.log(`  [sync] ${id} 새로 추가`);
  }

  fs.writeFileSync(RESULTS_PATH, JSON.stringify(results, null, 2), "utf-8");
}

/**
 * 여러 항목을 한 번에 동기화합니다.
 */
function syncLocalBatch(items) {
  let results = [];
  try {
    results = JSON.parse(fs.readFileSync(RESULTS_PATH, "utf-8"));
  } catch {
    console.warn("[syncLocal] geocode-results.json 읽기 실패, 새로 생성합니다.");
  }

  for (const { id, ...fields } of items) {
    const idx = results.findIndex((r) => r.id === id);
    if (idx >= 0) {
      results[idx] = { ...results[idx], ...fields };
    } else {
      results.push({ id, ...fields });
    }
  }

  fs.writeFileSync(RESULTS_PATH, JSON.stringify(results, null, 2), "utf-8");
  console.log(`[sync] ${items.length}개 항목 로컬 동기화 완료`);
}

module.exports = { syncLocal, syncLocalBatch };
