from sqlalchemy import Column, Integer, Float, String, LargeBinary, JSON, ForeignKey
from sqlalchemy.orm import relationship
from db.database import Base

class LabTest(Base):
    __tablename__ = "lab_tests"

    id = Column(String, primary_key=True, index=True)
    lab_id = Column(String, nullable=False)
    national_id = Column(String, nullable=False)
    age = Column(Float, nullable=False)
    sex = Column(Integer, nullable=False)
    chest_pain_type = Column(Integer, nullable=False)
    resting_bp_s = Column(Float, nullable=False)
    cholesterol = Column(Float, nullable=False)
    fasting_blood_sugar = Column(Integer, nullable=False)
    resting_ecg = Column(Integer, nullable=False)
    max_heart_rate = Column(Float, nullable=False)
    exercise_angina = Column(Integer, nullable=False)
    oldpeak = Column(Float, nullable=False)
    st_slope = Column(Integer, nullable=False)

    prediction = relationship("Prediction", back_populates="lab_test", uselist=False)


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(String, primary_key=True, index=True)
    lab_test_id = Column(String, ForeignKey("lab_tests.id"), unique=True)
    
    prediction_result = Column(Integer, nullable=True)
    prediction_percentage = Column(Float, nullable=True)
    risk_level = Column(String, nullable=True)
    decision = Column(String, nullable=True)
    
    shap_image = Column(LargeBinary, nullable=True)
    llm_report_json = Column(JSON, nullable=True)

    lab_test = relationship("LabTest", back_populates="prediction")
