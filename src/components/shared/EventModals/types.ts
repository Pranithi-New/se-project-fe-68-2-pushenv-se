export type AdminEvent = {
  id: string;
  name: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  banner?: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  _count: { registrations: number; companies: number };
};

export type EventForm = {
  name: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
};
