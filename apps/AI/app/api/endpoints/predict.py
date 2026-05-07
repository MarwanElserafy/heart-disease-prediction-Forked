from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from db.database import get_db
from db.models import LabTest, Prediction
from services.ml_service import ml_service
import pandas as pd
import uuid

router = APIRouter(tags=["Prediction"])

@router.post("/predict/{id}")
def create_prediction(id: str, db: Session = Depends(get_db)):
    patient = db.query(LabTest).filter(LabTest.id == id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="LabTest not found. Please create the LabTest first.")

    prediction_record = db.query(Prediction).filter(Prediction.lab_test_id == id).first()
    if prediction_record and prediction_record.prediction_result is not None:
        raise HTTPException(status_code=409, detail="A prediction already exists for this LabTest.")

    data = [
        patient.age, patient.sex, patient.chest_pain_type,
        patient.resting_bp_s, patient.cholesterol, patient.fasting_blood_sugar,
        patient.resting_ecg, patient.max_heart_rate, patient.exercise_angina,
        patient.oldpeak, patient.st_slope
    ]

    # Predict synchronously (no SHAP image or LLM overhead here)
    try:
        assessment, _ = ml_service.assess_full_prediction(data)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Model inference failed: {str(e)}")
    
    prediction_record = db.query(Prediction).filter(Prediction.lab_test_id == id).first()
    if not prediction_record:
        prediction_record = Prediction(id=str(uuid.uuid4()), lab_test_id=id)
        db.add(prediction_record)

    prediction_record.prediction_result  = 1 if assessment.decision.value == "high" else 0
    prediction_record.prediction_percentage = assessment.probability_pct
    prediction_record.risk_level  = assessment.risk_level.value
    prediction_record.decision    = assessment.decision.value

    db.commit()

    return {
        "id":             prediction_record.id,
        "lab_test_id":    prediction_record.lab_test_id,
        "prediction":     prediction_record.prediction_result,
        "probability":    prediction_record.prediction_percentage,
        "risk_level":     prediction_record.risk_level,
        "decision":       prediction_record.decision,
        "risk_color":     assessment.risk_color,
        "decision_label": assessment.decision_label,
    }

@router.get("/predict/{id}")
def get_prediction(id: str, db: Session = Depends(get_db)):
    prediction_record = db.query(Prediction).filter(Prediction.lab_test_id == id).first()
    if not prediction_record:
        raise HTTPException(status_code=404, detail="Prediction not found. Call POST /predict/{id} first.")

    return {
        "id":          prediction_record.id,
        "lab_test_id": prediction_record.lab_test_id,
        "prediction":  prediction_record.prediction_result,
        "probability": prediction_record.prediction_percentage,
        "risk_level":  prediction_record.risk_level,
        "decision":    prediction_record.decision,
    }

@router.post("/predict-csv")
async def predict_csv(file: UploadFile = File(...)):
    df = pd.read_csv(file.file)
    df.columns = df.columns.str.strip()

    missing = [col for col in ml_service.required_cols if col not in df.columns]
    if missing:
        raise HTTPException(status_code=422, detail=f"Missing columns in CSV: {missing}")

    feature_df  = df[ml_service.required_cols].copy()
    predictions = ml_service.predict_dataframe(feature_df)
    df["prediction"] = predictions
    return df.to_dict(orient="records")
