from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from db.database import get_db
from db.models import LabTest, Prediction
from services.ml_service import ml_service
import io

router = APIRouter(prefix="/shap", tags=["Explainability"])

@router.get("/{id}")
def show_shap(id: str, db: Session = Depends(get_db)):
    patient = db.query(LabTest).filter(LabTest.id == id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="LabTest not found")

    prediction_record = db.query(Prediction).filter(Prediction.lab_test_id == id).first()
    if not prediction_record:
        raise HTTPException(status_code=400, detail="Prediction not evaluated yet. Call POST /predict/{id} first.")

    # Generate SHAP image if it doesn't exist
    if not prediction_record.shap_image:
        data = [
            patient.age, patient.sex, patient.chest_pain_type,
            patient.resting_bp_s, patient.cholesterol, patient.fasting_blood_sugar,
            patient.resting_ecg, patient.max_heart_rate, patient.exercise_angina,
            patient.oldpeak, patient.st_slope,
        ]
        _, shap_data = ml_service.assess_full_prediction(data)
        image_bytes = ml_service.generate_shap_image(shap_data)
        
        prediction_record.shap_image = image_bytes
        db.commit()

    return StreamingResponse(io.BytesIO(prediction_record.shap_image), media_type="image/png")
