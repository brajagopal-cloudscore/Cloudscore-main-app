ALTER TABLE application_documentation
DROP CONSTRAINT IF EXISTS uq_app_doc_section_field;

DROP INDEX IF EXISTS uq_app_doc_null_risk;
DROP INDEX IF EXISTS uq_app_doc_risk;

CREATE UNIQUE INDEX IF NOT EXISTS uq_app_doc_null_risk ON application_documentation
(application_id, section_type, field_key)
WHERE risk_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_app_doc_risk ON application_documentation
(application_id, section_type, field_key, risk_id)
WHERE risk_id IS NOT NULL;
