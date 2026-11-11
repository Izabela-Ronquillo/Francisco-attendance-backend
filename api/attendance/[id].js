import { ObjectId } from "mongodb";
import { getCollection, toRecord, setCors, isValidId, requireAuth } from "../../lib/db.js";

export default async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  const { id } = req.query || {};
  if (!id || !isValidId(id)) {
    return res.status(400).json({ error: "Valid id is required" });
  }

  try {
    if (req.method === "PUT" || req.method === "DELETE") {
      if (!requireAuth(req, res)) return;
    }

    const col = await getCollection();
    const _id = new ObjectId(id);

    if (req.method === "PUT") {
      const { date, subjectName, section, studentName } = req.body || {};
      if (!date || !subjectName || !section || !studentName) {
        return res.status(400).json({ error: "date, subjectName, section, and studentName are required" });
      }
      const update = {
        $set: {
          date: String(date).trim(),
          subjectName: String(subjectName).trim(),
          section: String(section).trim(),
          studentName: String(studentName).trim(),
          updatedAt: new Date(),
        },
      };
      const result = await col.findOneAndUpdate({ _id }, update, { returnDocument: "after" });
      if (!result) return res.status(404).json({ error: "Record not found" });
      return res.status(200).json(toRecord(result));
    }

    if (req.method === "DELETE") {
      const result = await col.deleteOne({ _id });
      if (!result.deletedCount) return res.status(404).json({ error: "Record not found" });
      return res.status(200).json({ ok: true, id });
    }

    res.setHeader("Allow", "PUT,DELETE,OPTIONS");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Server error" });
  }
}
