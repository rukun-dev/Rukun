export interface Document {
  id: string;
  title: string;
  number: string;
  type: string;
  content: string;
  status: string;
  created_at: string;
  updated_at: string;
  approved_at: string | null;
  rejected_at: string | null;
  rejected_reason: string | null;
  requester?: {
    id: string;
    name: string;
  };
  warga?: {
    id: string;
    name: string;
  };
  approval?: {
    id: string;
    status: string;
    approved_at: string | null;
    rejected_at: string | null;
    rejected_reason: string | null;
    approver: {
      id: string;
      name: string;
    };
  };
}