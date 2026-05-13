-- CreateTable
CREATE TABLE "predictions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "lab_test_id" TEXT NOT NULL,
    "prediction_result" INTEGER,
    "prediction_percentage" DOUBLE PRECISION,
    "risk_level" TEXT,
    "decision" TEXT,
    "shap_image" BYTEA,
    "shap_values_json" JSONB,
    "llm_report_json" JSONB,
    "pdf_binary" BYTEA,
    "report_generated_at" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "predictions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "predictions_lab_test_id_key" ON "predictions"("lab_test_id");

-- AddForeignKey
ALTER TABLE "predictions" ADD CONSTRAINT "predictions_lab_test_id_fkey" FOREIGN KEY ("lab_test_id") REFERENCES "lab_tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "predictions" ADD CONSTRAINT "predictions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable (legacy columns from 20260412075614_init — removed from Prisma LabTest model)
ALTER TABLE "lab_tests" DROP COLUMN IF EXISTS "prediction_result";
ALTER TABLE "lab_tests" DROP COLUMN IF EXISTS "prediction_percentage";
