Put these 5 CSV files in Postman request:
POST {{base_url}}/api/labtests/upload-csvs

Body -> form-data:
- key: files (type: File) -> select each CSV (5 times)

Rules:
- Exactly 5 CSV files
- 1 CSV per user (unique national_id)
- lab_code must be only AL Borg Labs or Al Mokhtabar labs and MUST match lab_id's lab_code in DB

