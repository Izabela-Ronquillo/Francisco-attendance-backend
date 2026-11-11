import { MongoClient, ObjectId } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || "FranciscoAttendancePortal";
const collectionName = process.env.COLLECTION_NAME || "Attendance_List";

let cached = global._mongo;
if (!cached) cached = global._mongo = { client: null, promise: null };

export async function getCollection() {
  if (!uri) throw new Error("Missing MONGODB_URI");
  if (!cached.promise) {
    cached.client = new MongoClient(uri);
    cached.promise = cached.client.connect();
  }
  const client = await cached.promise;
  return client.db(dbName).collection(collectionName);
}

export function toRecord(doc) {
  return {
    id: doc._id.toString(),
    date: doc.date || doc.Date || "",
    subjectName: doc.subjectName || doc.subject || doc.Subject || doc.subject_name || doc["Subject Name"] || "",
    section: doc.section || doc.Section || "",
    studentName: doc.studentName || doc.student || doc.Student || doc.student_name || doc.name || doc.Name || doc["Student Name"] || "",
  };
}

export function isValidId(id) {
  return ObjectId.isValid(id) && String(new ObjectId(id)) === id;
}

export function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", process.env.CORS_ORIGIN || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}
