export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'INFO' | 'WARNING' | 'URGENT' | 'EVENT';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    name: string;
    role: string;
  };
  recipients?: Array<{
    id: string;
    recipientType: 'ALL' | 'ROLE' | 'SPECIFIC';
    recipientId?: string;
  }>;
  // Optional short excerpt of the announcement content for list previews
  excerpt?: string;
}

export interface AnnouncementMeta {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  has_prev_page: boolean;
  has_next_page: boolean;
}