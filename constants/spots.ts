export type Region = "서울" | "경기" | "인천" | "강원" | "충청" | "전라" | "경상" | "제주";

export interface CherrySpot {
  id: string;
  region: Region;
  subRegion: string;
  title: string;
  mapUrl: string;
  link: string;
  address: string;
  latitude: number;
  longitude: number;
  festivalName: string;
  festivalPeriod: string;
  festivalStatus: string;
  festivalLocation: string;
  festivalTime: string;
  festivalFee: string;
  festivalNote: string;
}

export const REGIONS: Region[] = ["서울", "경기", "인천", "강원", "충청", "전라", "경상", "제주"];

export interface BloomInfo {
  /** 대표 기준 지역 */
  reference: string;
  /** 개화 예상 시기 */
  bloom: string;
  /** 만개 예상 시기 */
  fullBloom: string;
  /** 비고 */
  note: string;
}

export const BLOOM_FORECAST: Record<Region, BloomInfo> = {
  서울: {
    reference: "서울",
    bloom: "4월 3일",
    fullBloom: "4월 10일 전후",
    note: "서울 기준",
  },
  경기: {
    reference: "수원 / 경기 북부",
    bloom: "4월 5일 전후",
    fullBloom: "4월 12일 전후",
    note: "수원 4/5, 북부는 4/8 이후",
  },
  인천: {
    reference: "인천",
    bloom: "4월 7일",
    fullBloom: "4월 14일 전후",
    note: "인천 표준목 기준",
  },
  강원: {
    reference: "강릉 / 춘천",
    bloom: "4월 1일 ~ 8일",
    fullBloom: "4월 8일 ~ 15일",
    note: "강릉 4/1, 춘천 4/8",
  },
  충청: {
    reference: "대전 / 청주 / 서산",
    bloom: "3월 31일 ~ 4월 4일",
    fullBloom: "4월 7일 ~ 11일",
    note: "대전·청주 3/31, 서산 4/4",
  },
  전라: {
    reference: "광주 / 목포 / 전주",
    bloom: "3월 27일 ~ 29일",
    fullBloom: "4월 3일 ~ 5일",
    note: "광주 3/27, 목포·전주 3/28, 여수 3/29",
  },
  경상: {
    reference: "부산 / 대구 / 창원",
    bloom: "3월 25일 ~ 4월 2일",
    fullBloom: "4월 1일 ~ 9일",
    note: "부산 3/25, 대구 3/26, 창원 3/27, 안동 4/2",
  },
  제주: {
    reference: "서귀포 / 제주",
    bloom: "3월 25일",
    fullBloom: "4월 1일 이후",
    note: "서귀포가 전국 첫 개화 예상",
  },
};
