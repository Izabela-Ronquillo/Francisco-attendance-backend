import { MongoClient, ObjectId } from "mongodb";
import crypto from "crypto";

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
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

export function signToken(username) {
  const secret = process.env.AUTH_SECRET || "francisco-attendance-secret";
  const exp = Date.now() + 12 * 60 * 60 * 1000;
  const payload = JSON.stringify({ u: username, exp });
  const sig = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return Buffer.from(payload).toString("base64url") + "." + sig;
}

export function verifyToken(token) {
  try {
    if (!token) return false;
    const secret = process.env.AUTH_SECRET || "francisco-attendance-secret";
    const [b64, sig] = String(token).split(".");
    if (!b64 || !sig) return false;
    const payload = Buffer.from(b64, "base64url").toString("utf8");
    const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
    if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
    const data = JSON.parse(payload);
    return data && data.exp && Date.now() < data.exp;
  } catch {
    return false;
  }
}

export function requireAuth(req, res) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!verifyToken(token)) {
    res.status(401).json({ error: "Admin login required" });
    return false;
  }
  return true;
}
