ALTER TABLE "application_documentation" ADD CONSTRAINT "uq_app_doc_section_field" UNIQUE("application_id","section_type","field_key");
CREATE UNIQUE INDEX uq_app_doc_risk ON application_documentation
("application_id","section_type","field_key","risk_id")
WHERE risk_id IS NOT NULL;
