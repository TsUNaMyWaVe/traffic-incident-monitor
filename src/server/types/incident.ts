export type Incident = {
  id: number;
  description: string;
  location: string;
  severity: number;
  created_at: string;
  resolved: boolean;
  dismissed: boolean;
};
