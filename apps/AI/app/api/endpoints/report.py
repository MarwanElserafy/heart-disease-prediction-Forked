from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session
from db.database import get_db
from db.models import LabTest, Prediction
from services.ml_service import ml_service
from services import chart_service
import sys
from pathlib import Path

# Add LLM dir to path
AI_DIR = Path(__file__).resolve().parent.parent.parent.parent
if str(AI_DIR) not in sys.path:
    sys.path.append(str(AI_DIR))

try:
    from app.services.llm_service import HeartDiseaseConsultant
    consultant = HeartDiseaseConsultant()
except Exception as e:
    print("Warning: Could not initialize HeartDiseaseConsultant:", e)
    consultant = None

router = APIRouter(tags=["Report"])

@router.get("/predict/{id}/report")
def get_prediction_report(id: str, db: Session = Depends(get_db)):
    patient = db.query(LabTest).filter(LabTest.id == id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="LabTest not found")

    prediction_record = db.query(Prediction).filter(Prediction.lab_test_id == id).first()
    if not prediction_record or prediction_record.prediction_result is None:
        raise HTTPException(
            status_code=400,
            detail="Prediction has not been evaluated yet. Call POST /predict/{id} first."
        )

    if not consultant:
        raise HTTPException(status_code=500, detail="LLM Consultant is not initialized.")

    # 1. Run Assessment (Fast, to get SHAP data)
    data = [
        patient.age, patient.sex, patient.chest_pain_type,
        patient.resting_bp_s, patient.cholesterol, patient.fasting_blood_sugar,
        patient.resting_ecg, patient.max_heart_rate, patient.exercise_angina,
        patient.oldpeak, patient.st_slope,
    ]
    assessment, shap_data = ml_service.assess_full_prediction(data)

    # 2. Generate and Save SHAP Image if not exists
    if not prediction_record.shap_image:
        image_bytes = ml_service.generate_shap_image(shap_data)
        prediction_record.shap_image = image_bytes

    # 3. Chart Generation (Base64 for PDF)
    shap_tuple    = tuple(sorted(shap_data.items()))
    feat_chart    = chart_service.generate_feature_importance_chart(shap_tuple)
    shap_chart    = chart_service.generate_shap_waterfall_chart(shap_tuple)

    # 4. LLM Report Generation (if not cached)
    if (prediction_record.llm_report_json
            and "explanation" in prediction_record.llm_report_json
            and "error" not in prediction_record.llm_report_json):
        llm_result = prediction_record.llm_report_json
    else:
        top_features = sorted(shap_data.items(), key=lambda x: abs(x[1]), reverse=True)[:3]
        try:
            llm_result = consultant.generate_report(
                probability   = assessment.probability_pct,
                decision      = assessment.decision.value,
                ui_risk_level = assessment.risk_level.value,
                top_features  = top_features,
            )
            prediction_record.llm_report_json = llm_result
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"Failed to communicate with AI provider: {str(e)}")

    # Save LLM and SHAP changes to DB
    db.commit()

    # 5. Build Context for PDF Service
    from app.services.pdf_service import generate_medical_report_pdf

    patient_data = {
        "name": "Anonymous",
        "gender": "Male" if patient.sex == 1 else "Female",
        "dob": "N/A",
        "national_id": patient.national_id or "N/A",
        "address": "N/A",
        "age": patient.age,
        "cp": patient.chest_pain_type,
        "trestbps": patient.resting_bp_s,
        "chol": patient.cholesterol,
        "fbs": patient.fasting_blood_sugar,
        "restecg": patient.resting_ecg,
        "thalach": patient.max_heart_rate,
        "exang": "Yes" if patient.exercise_angina == 1 else "No",
        "oldpeak": patient.oldpeak,
        "slope": patient.st_slope,
    }

    risk_score = round(prediction_record.prediction_percentage, 1) if prediction_record.prediction_percentage else 0.0

    llm_report = {
        "summary": llm_result.get("explanation", ""),
        "recommendations": llm_result.get("recommendations", [])
    }

    images_base64 = {
        "university_logo": "",
        "risk_gauge": feat_chart,
        "shap_plot": shap_chart
    }

    # 6. Render HTML -> PDF
    pdf_bytes_io = generate_medical_report_pdf(
        patient_data=patient_data,
        risk_score=risk_score,
        llm_report=llm_report,
        images_base64=images_base64
    )

    return Response(
        content=pdf_bytes_io.getvalue(),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=artemis_report_patient_{id}.pdf"
        },
    )
