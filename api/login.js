import { setCors, signToken } from "../lib/db.js";

export default async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST,OPTIONS");
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const { username, password } = req.body || {};
    const adminUser = process.env.ADMIN_USERNAME || "admin";
    const adminPass = process.env.ADMIN_PASSWORD || "admin123";
    if (String(username) !== adminUser || String(password) !== adminPass) {
      return res.status(401).json({ error: "Invalid username or password" });
    }
    const token = signToken(adminUser);
    return res.status(200).json({ ok: true, token });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Server error" });
  }
}
