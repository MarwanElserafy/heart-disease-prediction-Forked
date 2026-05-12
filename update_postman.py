import json

coll_path = r"c:\Users\omara\OneDrive\Documents\GitHub\heart-disease-prediction\Heart_Disease_Prediction_Unified.postman_collection.json"

with open(coll_path, "r", encoding="utf-8") as f:
    coll = json.load(f)

for item in coll.get("item", []):
    if item["name"] == "🧠 AI & ML":
        for req in item.get("item", []):
            if req["name"] == "1. Get Prediction Status":
                req["name"] = "1. Start Prediction"
                req["request"]["method"] = "POST"

with open(coll_path, "w", encoding="utf-8") as f:
    json.dump(coll, f, indent=2)

print("Updated Postman collection successfully.")
