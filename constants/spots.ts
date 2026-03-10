export type Region = "서울" | "경기" | "인천" | "강원" | "충청" | "전라" | "경상" | "제주";

export interface CherrySpot {
  id: string;
  region: Region;
  subRegion: string;
  title: string;
  mapUrl: string;
  latitude: number;
  longitude: number;
}

export const REGIONS: Region[] = ["서울", "경기", "인천", "강원", "충청", "전라", "경상", "제주"];

export const BLOOM_FORECAST: Record<Region, string> = {
  제주: "3월 22일 ~ 3월 30일",
  경상: "3월 25일 ~ 4월 5일",
  전라: "3월 27일 ~ 4월 5일",
  충청: "3월 30일 ~ 4월 8일",
  서울: "4월 2일 ~ 4월 10일",
  경기: "4월 2일 ~ 4월 10일",
  인천: "4월 3일 ~ 4월 10일",
  강원: "4월 5일 ~ 4월 13일",
};
