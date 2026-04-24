export interface Dota2Region {
  code: string;
  label: string;
}

export const DOTA2_REGIONS: Dota2Region[] = [
  { code: "USW",    label: "US West" },
  { code: "USE",    label: "US East" },
  { code: "EUW",    label: "Europe West" },
  { code: "EUE",    label: "Europe East" },
  { code: "SEA",    label: "Southeast Asia" },
  { code: "RU",     label: "Russia" },
  { code: "AU",     label: "Australia" },
  { code: "DUBAI",  label: "Dubai" },
  { code: "AF",     label: "South Africa" },
  { code: "BR",     label: "Brazil" },
  { code: "CL",     label: "Chile" },
  { code: "PE",     label: "Peru" },
  { code: "AR",     label: "Argentina" },
  { code: "IN",     label: "India" },
  { code: "JP",     label: "Japan" },
  { code: "CN",     label: "China" },
];
