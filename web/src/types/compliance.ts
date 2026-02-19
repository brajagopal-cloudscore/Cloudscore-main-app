export interface ComplianceFormDataType {
  documentName: string;
  documentUrl?: string; 
  documentFile?: FileList; 
  status: string;
  owner: string;
  notes: string;
  reviews: string;
  reviewDate: string;
  dueDate: string;
}
