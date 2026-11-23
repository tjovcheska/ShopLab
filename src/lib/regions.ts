// Countries for the native <select>, and the regions shown in the custom
// state/region dropdown for each country.

export type Region = { code: string; name: string };
export type Country = { code: string; name: string; regions: Region[] };

export const COUNTRIES: Country[] = [
  {
    code: "US",
    name: "United States",
    regions: [
      { code: "CA", name: "California" },
      { code: "FL", name: "Florida" },
      { code: "IL", name: "Illinois" },
      { code: "NY", name: "New York" },
      { code: "TX", name: "Texas" },
      { code: "WA", name: "Washington" },
    ],
  },
  {
    code: "CA",
    name: "Canada",
    regions: [
      { code: "AB", name: "Alberta" },
      { code: "BC", name: "British Columbia" },
      { code: "ON", name: "Ontario" },
      { code: "QC", name: "Quebec" },
    ],
  },
  {
    code: "GB",
    name: "United Kingdom",
    regions: [
      { code: "ENG", name: "England" },
      { code: "NIR", name: "Northern Ireland" },
      { code: "SCT", name: "Scotland" },
      { code: "WLS", name: "Wales" },
    ],
  },
  {
    code: "DE",
    name: "Germany",
    regions: [
      { code: "BY", name: "Bavaria" },
      { code: "BE", name: "Berlin" },
      { code: "HH", name: "Hamburg" },
      { code: "HE", name: "Hesse" },
    ],
  },
];

export function getCountry(code: string) {
  return COUNTRIES.find((country) => country.code === code);
}

export function getRegionName(countryCode: string, regionCode: string) {
  return getCountry(countryCode)?.regions.find((r) => r.code === regionCode)
    ?.name;
}
