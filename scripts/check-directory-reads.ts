import { db } from "../src/libs/db";

const total = db.getPublishedDirectoryCabinetCount();
const cities = db.getDirectoryCities();

if (typeof total !== "number") {
  throw new Error("Expected directory cabinet count to be numeric");
}

if (!Array.isArray(cities)) {
  throw new Error("Expected directory cities to be an array");
}

console.log(`Directory reads OK: ${total} published cabinets, ${cities.length} cities`);
