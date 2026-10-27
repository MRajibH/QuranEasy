import { CalculationMethod, Coordinates, Madhab, PrayerTimes, Qibla, SunnahTimes } from "adhan";

// Prayer times are calculated on the device (adhan.js); the location never leaves it.

export interface District {
  id: string;
  bn: string;
  en: string;
  lat: number;
  lng: number;
  div: string;
}

const D = (id: string, bn: string, en: string, lat: number, lng: number, div: string): District => ({ id, bn, en, lat, lng, div });

/** All 64 districts of Bangladesh (district headquarters). */
export const DISTRICTS: District[] = [
  D("dhaka", "ঢাকা", "Dhaka", 23.8103, 90.4125, "dhaka"),
  D("gazipur", "গাজীপুর", "Gazipur", 23.9999, 90.4203, "dhaka"),
  D("narayanganj", "নারায়ণগঞ্জ", "Narayanganj", 23.6238, 90.5, "dhaka"),
  D("narsingdi", "নরসিংদী", "Narsingdi", 23.9322, 90.7151, "dhaka"),
  D("manikganj", "মানিকগঞ্জ", "Manikganj", 23.8617, 90.0003, "dhaka"),
  D("munshiganj", "মুন্সীগঞ্জ", "Munshiganj", 23.5422, 90.5305, "dhaka"),
  D("tangail", "টাঙ্গাইল", "Tangail", 24.2513, 89.9167, "dhaka"),
  D("kishoreganj", "কিশোরগঞ্জ", "Kishoreganj", 24.4449, 90.7766, "dhaka"),
  D("faridpur", "ফরিদপুর", "Faridpur", 23.607, 89.8429, "dhaka"),
  D("gopalganj", "গোপালগঞ্জ", "Gopalganj", 23.005, 89.8266, "dhaka"),
  D("madaripur", "মাদারীপুর", "Madaripur", 23.1641, 90.1897, "dhaka"),
  D("rajbari", "রাজবাড়ী", "Rajbari", 23.7574, 89.6445, "dhaka"),
  D("shariatpur", "শরীয়তপুর", "Shariatpur", 23.2423, 90.4348, "dhaka"),
  D("chattogram", "চট্টগ্রাম", "Chattogram", 22.3569, 91.7832, "chattogram"),
  D("coxsbazar", "কক্সবাজার", "Cox's Bazar", 21.4272, 92.0058, "chattogram"),
  D("cumilla", "কুমিল্লা", "Cumilla", 23.4607, 91.1809, "chattogram"),
  D("feni", "ফেনী", "Feni", 23.0159, 91.3976, "chattogram"),
  D("noakhali", "নোয়াখালী", "Noakhali", 22.8696, 91.0995, "chattogram"),
  D("lakshmipur", "লক্ষ্মীপুর", "Lakshmipur", 22.9447, 90.8282, "chattogram"),
  D("chandpur", "চাঁদপুর", "Chandpur", 23.2333, 90.6713, "chattogram"),
  D("brahmanbaria", "ব্রাহ্মণবাড়িয়া", "Brahmanbaria", 23.9571, 91.1119, "chattogram"),
  D("rangamati", "রাঙ্গামাটি", "Rangamati", 22.6574, 92.1733, "chattogram"),
  D("khagrachhari", "খাগড়াছড়ি", "Khagrachhari", 23.1193, 91.9847, "chattogram"),
  D("bandarban", "বান্দরবান", "Bandarban", 22.1953, 92.2184, "chattogram"),
  D("rajshahi", "রাজশাহী", "Rajshahi", 24.3745, 88.6042, "rajshahi"),
  D("bogura", "বগুড়া", "Bogura", 24.8465, 89.3773, "rajshahi"),
  D("pabna", "পাবনা", "Pabna", 24.0064, 89.2372, "rajshahi"),
  D("sirajganj", "সিরাজগঞ্জ", "Sirajganj", 24.4534, 89.7007, "rajshahi"),
  D("natore", "নাটোর", "Natore", 24.4206, 89.0003, "rajshahi"),
  D("naogaon", "নওগাঁ", "Naogaon", 24.7936, 88.9318, "rajshahi"),
  D("chapainawabganj", "চাঁপাইনবাবগঞ্জ", "Chapainawabganj", 24.5965, 88.2776, "rajshahi"),
  D("joypurhat", "জয়পুরহাট", "Joypurhat", 25.0968, 89.0227, "rajshahi"),
  D("khulna", "খুলনা", "Khulna", 22.8456, 89.5403, "khulna"),
  D("jashore", "যশোর", "Jashore", 23.1664, 89.2081, "khulna"),
  D("satkhira", "সাতক্ষীরা", "Satkhira", 22.7185, 89.0705, "khulna"),
  D("bagerhat", "বাগেরহাট", "Bagerhat", 22.6516, 89.7859, "khulna"),
  D("kushtia", "কুষ্টিয়া", "Kushtia", 23.9013, 89.1204, "khulna"),
  D("jhenaidah", "ঝিনাইদহ", "Jhenaidah", 23.545, 89.1726, "khulna"),
  D("magura", "মাগুরা", "Magura", 23.4873, 89.4199, "khulna"),
  D("narail", "নড়াইল", "Narail", 23.1725, 89.5126, "khulna"),
  D("chuadanga", "চুয়াডাঙ্গা", "Chuadanga", 23.6402, 88.8418, "khulna"),
  D("meherpur", "মেহেরপুর", "Meherpur", 23.7622, 88.6318, "khulna"),
  D("barishal", "বরিশাল", "Barishal", 22.701, 90.3535, "barishal"),
  D("patuakhali", "পটুয়াখালী", "Patuakhali", 22.3596, 90.3299, "barishal"),
  D("bhola", "ভোলা", "Bhola", 22.6859, 90.6482, "barishal"),
  D("pirojpur", "পিরোজপুর", "Pirojpur", 22.5791, 89.9759, "barishal"),
  D("barguna", "বরগুনা", "Barguna", 22.0953, 90.1121, "barishal"),
  D("jhalokathi", "ঝালকাঠি", "Jhalokathi", 22.6406, 90.1987, "barishal"),
  D("sylhet", "সিলেট", "Sylhet", 24.8949, 91.8687, "sylhet"),
  D("moulvibazar", "মৌলভীবাজার", "Moulvibazar", 24.4829, 91.7774, "sylhet"),
  D("habiganj", "হবিগঞ্জ", "Habiganj", 24.3745, 91.4155, "sylhet"),
  D("sunamganj", "সুনামগঞ্জ", "Sunamganj", 25.0715, 91.3992, "sylhet"),
  D("rangpur", "রংপুর", "Rangpur", 25.7439, 89.2752, "rangpur"),
  D("dinajpur", "দিনাজপুর", "Dinajpur", 25.6217, 88.6354, "rangpur"),
  D("kurigram", "কুড়িগ্রাম", "Kurigram", 25.8072, 89.6295, "rangpur"),
  D("gaibandha", "গাইবান্ধা", "Gaibandha", 25.3288, 89.528, "rangpur"),
  D("nilphamari", "নীলফামারী", "Nilphamari", 25.931, 88.856, "rangpur"),
  D("lalmonirhat", "লালমনিরহাট", "Lalmonirhat", 25.9923, 89.2847, "rangpur"),
  D("thakurgaon", "ঠাকুরগাঁও", "Thakurgaon", 26.0336, 88.4616, "rangpur"),
  D("panchagarh", "পঞ্চগড়", "Panchagarh", 26.3411, 88.5542, "rangpur"),
  D("mymensingh", "ময়মনসিংহ", "Mymensingh", 24.7471, 90.4203, "mymensingh"),
  D("jamalpur", "জামালপুর", "Jamalpur", 24.9375, 89.9372, "mymensingh"),
  D("netrokona", "নেত্রকোণা", "Netrokona", 24.8709, 90.7279, "mymensingh"),
  D("sherpur", "শেরপুর", "Sherpur", 25.0205, 90.0153, "mymensingh"),
];

export const DIVISIONS: Record<string, { bn: string; en: string }> = {
  dhaka: { bn: "ঢাকা বিভাগ", en: "Dhaka Division" },
  chattogram: { bn: "চট্টগ্রাম বিভাগ", en: "Chattogram Division" },
  rajshahi: { bn: "রাজশাহী বিভাগ", en: "Rajshahi Division" },
  khulna: { bn: "খুলনা বিভাগ", en: "Khulna Division" },
  barishal: { bn: "বরিশাল বিভাগ", en: "Barishal Division" },
  sylhet: { bn: "সিলেট বিভাগ", en: "Sylhet Division" },
  rangpur: { bn: "রংপুর বিভাগ", en: "Rangpur Division" },
  mymensingh: { bn: "ময়মনসিংহ বিভাগ", en: "Mymensingh Division" },
};

export type Method = "Karachi" | "MuslimWorldLeague" | "UmmAlQura" | "Egyptian" | "NorthAmerica";
export const METHODS: Method[] = ["Karachi", "MuslimWorldLeague", "UmmAlQura", "Egyptian", "NorthAmerica"];

/** Where times are calculated for: a Bangladesh district, or the device's own position. */
export type SalahPlace = { kind: "district"; id: string } | { kind: "gps"; lat: number; lng: number };

export interface SalahPrefs {
  /** null until the user shares their location or picks a district */
  place: SalahPlace | null;
  method: Method;
  madhab: "hanafi" | "shafi";
  hijriAdjust: number;
}

export const DEFAULT_PLACE: SalahPlace = { kind: "district", id: "dhaka" };

export const DEFAULT_SALAH: SalahPrefs = {
  place: null,
  method: "Karachi", // University of Islamic Sciences, Karachi — the usual choice in Bangladesh
  madhab: "hanafi",
  hijriAdjust: -1, // Bangladesh usually begins the month a day after the Umm al-Qura calendar
};

/** Nearest district to a point, when the point is inside (or just around) Bangladesh. */
export function nearestDistrict(lat: number, lng: number): District | null {
  if (lat < 20 || lat > 27 || lng < 87.5 || lng > 93) return null;
  let best = DISTRICTS[0];
  let bestD = Infinity;
  for (const d of DISTRICTS) {
    const dist = (d.lat - lat) ** 2 + ((d.lng - lng) * Math.cos((lat * Math.PI) / 180)) ** 2;
    if (dist < bestD) {
      bestD = dist;
      best = d;
    }
  }
  return best;
}

export function placeInfo(place: SalahPlace | null) {
  place ??= DEFAULT_PLACE;
  if (place.kind === "district") {
    const d = DISTRICTS.find((x) => x.id === place.id) ?? DISTRICTS[0];
    return { lat: d.lat, lng: d.lng, tz: "Asia/Dhaka", district: d };
  }
  return { lat: place.lat, lng: place.lng, tz: undefined, district: nearestDistrict(place.lat, place.lng) };
}

export const PRAYERS = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"] as const;
export type PrayerKey = (typeof PRAYERS)[number];

export interface DayTimes {
  fajr: Date;
  sunrise: Date;
  dhuhr: Date;
  asr: Date;
  maghrib: Date;
  isha: Date;
  lastThird: Date;
  middleOfNight: Date;
}

/** Prayer times for a calendar day (y/m/d) at a place. */
export function dayTimes(day: { y: number; m: number; d: number }, prefs: SalahPrefs): DayTimes {
  const { lat, lng } = placeInfo(prefs.place);
  const params = CalculationMethod[prefs.method]();
  params.madhab = prefs.madhab === "hanafi" ? Madhab.Hanafi : Madhab.Shafi;
  // adhan reads year/month/day from the Date in device-local time.
  const pt = new PrayerTimes(new Coordinates(lat, lng), new Date(day.y, day.m - 1, day.d), params);
  const sunnah = new SunnahTimes(pt);
  return {
    fajr: pt.fajr,
    sunrise: pt.sunrise,
    dhuhr: pt.dhuhr,
    asr: pt.asr,
    maghrib: pt.maghrib,
    isha: pt.isha,
    lastThird: sunnah.lastThirdOfTheNight,
    middleOfNight: sunnah.middleOfTheNight,
  };
}

/** The prayer whose time has started (null before Fajr) and the next one. */
export function currentAndNext(now: Date, today: DayTimes, tomorrow: DayTimes) {
  const order: PrayerKey[] = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"];
  // Before today's Fajr, last night's Isha is still the current waqt.
  let current: PrayerKey = "isha";
  for (const k of order) if (now >= today[k]) current = k;
  const nextKey = order.find((k) => now < today[k]);
  const next = nextKey ? { key: nextKey, at: today[nextKey] } : { key: "fajr" as PrayerKey, at: tomorrow.fajr };
  return { current, next };
}

export const qiblaBearing = (lat: number, lng: number) => Qibla(new Coordinates(lat, lng));
