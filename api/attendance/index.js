import { getCollection, toRecord, setCors } from "../../lib/db.js";

export default async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const col = await getCollection();

    if (req.method === "GET") {
      const docs = await col.find({}).sort({ date: -1, _id: -1 }).toArray();
      return res.status(200).json(docs.map(toRecord));
    }

    if (req.method === "POST") {
      const { date, subjectName, section, studentName } = req.body || {};
      if (!date || !subjectName || !section || !studentName) {
        return res.status(400).json({ error: "date, subjectName, section, and studentName are required" });
      }
      const doc = {
        date: String(date).trim(),
        subjectName: String(subjectName).trim(),
        section: String(section).trim(),
        studentName: String(studentName).trim(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const result = await col.insertOne(doc);
      return res.status(201).json(toRecord({ ...doc, _id: result.insertedId }));
    }

    res.setHeader("Allow", "GET,POST,OPTIONS");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Server error" });
  }
}
