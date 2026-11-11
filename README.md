# Francisco Attendance Backend

Serverless API for FranciscoAttendancePortal (MongoDB Atlas).

## Environment Variables (Vercel)
- `MONGODB_URI` - MongoDB Atlas connection string
- `DB_NAME` - `FranciscoAttendancePortal`
- `COLLECTION_NAME` - `Attendance_List`
- `CORS_ORIGIN` - frontend origin (optional, defaults to `*`)

## Endpoints
- `GET /api/attendance` - list records
- `POST /api/attendance` - create record `{ date, subjectName, section, studentName }`
- `PUT /api/attendance/:id` - update record
- `DELETE /api/attendance/:id` - delete record
