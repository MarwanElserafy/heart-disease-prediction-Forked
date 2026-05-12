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
        patient = db.query(LabTest).filter(LabTest.national_id == id).order_by(LabTest.createdAt.desc()).first()
    
    if not patient:
        raise HTTPException(status_code=404, detail="LabTest not found")

    prediction_record = db.query(Prediction).filter(Prediction.lab_test_id == patient.id).first()
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

@router.get("/{id}/data")
def get_shap_data(id: str, db: Session = Depends(get_db)):
    patient = db.query(LabTest).filter(LabTest.id == id).first()
    if not patient:
        patient = db.query(LabTest).filter(LabTest.national_id == id).order_by(LabTest.createdAt.desc()).first()
    
    if not patient:
        raise HTTPException(status_code=404, detail="LabTest not found")

    prediction_record = db.query(Prediction).filter(Prediction.lab_test_id == patient.id).first()
    if not prediction_record:
        raise HTTPException(status_code=400, detail="Prediction not evaluated yet. Call POST /predict/{id} first.")

    # Retrieve or generate SHAP data
    if prediction_record.shap_values_json:
        shap_data = prediction_record.shap_values_json
    else:
        data = [
            patient.age, patient.sex, patient.chest_pain_type,
            patient.resting_bp_s, patient.cholesterol, patient.fasting_blood_sugar,
            patient.resting_ecg, patient.max_heart_rate, patient.exercise_angina,
            patient.oldpeak, patient.st_slope,
        ]
        _, shap_data = ml_service.assess_full_prediction(data)
        prediction_record.shap_values_json = shap_data
        db.commit()

    # Sort features by absolute impact
    sorted_features = sorted(shap_data.items(), key=lambda x: abs(x[1]), reverse=True)

    # Format for frontend components
    top_features = []
    labels = []
    values = []

    for feature_name, impact in sorted_features:
        # Determine raw feature value for the explanation
        attr_name = feature_name.replace(" ", "_")
        raw_val = getattr(patient, attr_name, "N/A")
        
        direction = "increase" if impact > 0 else "decrease"
        
        top_features.append({
            "feature": feature_name,
            "value": raw_val,
            "impact": round(impact, 4),
            "direction": direction
        })
        
        labels.append(feature_name)
        values.append(round(impact, 4))

    # Generate readable explanation for the top feature
    top_f = top_features[0]
    direction_verb = "increased" if top_f["direction"] == "increase" else "decreased"
    readable_explanation = f"The value of {top_f['feature']} ({top_f['value']}) strongly {direction_verb} the predicted heart disease risk."

    return {
        "prediction_probability": prediction_record.prediction_percentage,
        "risk_level": prediction_record.risk_level,
        "top_features": top_features,
        "chart_data": {
            "labels": labels,
            "values": values
        },
        "explanation": readable_explanation
    }
