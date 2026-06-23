import { db } from "../src/libs/db";

const listingTotal = db.getDirectoryListingCabinetCount();
const listingCities = db.getDirectoryListingCities();
const verifiedTotal = db.getPublishedDirectoryCabinetCount();
const verifiedCities = db.getDirectoryCities();

if (typeof listingTotal !== "number") {
  throw new Error("Expected directory listing cabinet count to be numeric");
}

if (!Array.isArray(listingCities)) {
  throw new Error("Expected directory listing cities to be an array");
}

if (typeof verifiedTotal !== "number" || !Array.isArray(verifiedCities)) {
  throw new Error("Expected verified directory reads to remain available");
}

console.log(
  `Directory listing reads OK: ${listingTotal} listing cabinets, ${listingCities.length} listing cities, ${verifiedTotal} verified cabinets`,
);
