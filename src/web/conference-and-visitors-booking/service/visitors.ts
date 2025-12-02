import { apiClient } from "./axios-config";

export interface Visitor {
  id: number;
  name: string;
  email: string | null;
  company: string | null;
  phone: string | null;
  purpose_type: string;
  created_at: string;
  total_visits: number;
}

export interface Visit {
  id: number;
  check_in_time: string | null;
  check_out_time: string | null;
  host_id: number;
  host_name: string;
  purpose: string;
  purpose_type: string;
  scheduled_date: string;
  status: string;
}

export interface VisitorWithVisits extends Visitor {
  visits: Visit[];
}

export interface VisitorsResponse {
  total: number;
  visitors: VisitorWithVisits[];
}

export interface RegisterVisitorPayload {
  name: string;
  email?: string;
  phone?: string | null;
  company?: string;
  purpose_type: string;
}

export interface RegisterVisitorResponse {
  msg: string;
  visitor: Visitor;
}

export interface PurposeTypesResponse {
  purpose_types: string[];
}

export interface ScheduleVisitPayload {
  visitor_id: number;
  purpose: string;
  purpose_type: string;
  scheduled_date: string;
  end_time?: string;
}

export const apiGetPurposeTypes = async (): Promise<string[]> => {
  const response = await apiClient.get<PurposeTypesResponse>("visitor/purpose-types");
  return response.data.purpose_types || [];
};

export const apiGetAllVisitors = async (): Promise<VisitorWithVisits[]> => {
  const response = await apiClient.get<VisitorsResponse>("visitor/visitors");
  return response.data.visitors || [];
};

export const apiRegisterVisitor = async (
  payload: RegisterVisitorPayload
) => {
  const response = await apiClient.post<RegisterVisitorResponse>("visitor/register", payload);
  return response;
};

export const apiScheduleVisit = async (payload: ScheduleVisitPayload) => {
  return apiClient.post("visitor/schedule-visit", payload);
};

export interface PendingVisit {
  id: number;
  visitor_id: number;
  visitor_name: string;
  visitor_email: string;
  visitor_company: string;
  host_id: number;
  host_name: string;
  purpose: string;
  purpose_type: string;
  scheduled_date: string;
  status: string;
  created_at: string;
}

export interface PendingVisitsResponse {
  total?: number;
  pending_visits: PendingVisit[];
}

export const apiGetPendingVisits = async (): Promise<PendingVisit[]> => {
  const response = await apiClient.get<PendingVisitsResponse>("admin/pending-visits");
  return response.data.pending_visits || [];
};

export const apiApproveVisit = async (visitId: number) => {
  return apiClient.put(`admin/visits/${visitId}/approve`);
};

export const apiRejectVisit = async (visitId: number) => {
  return apiClient.put(`admin/visits/${visitId}/reject`);
};

export interface CheckInPayload {
  visitor_id: number;
  purpose: string;
  check_in_time: string;
  purpose_type: string;
  check_out_time?: string;
}

export interface CheckInResponse {
  id: number;
  visitor_id: number;
  check_in_time: string;
  check_out_time: string | null;
  purpose: string;
  purpose_type: string;
  [key: string]: unknown;
}

export const apiCheckIn = async (payload: CheckInPayload): Promise<CheckInResponse> => {
  const response = await apiClient.post<CheckInResponse>("visitlog/check-in", payload);
  return response.data;
};

export const apiCheckOut = async (logId: number): Promise<{ message: string }> => {
  const response = await apiClient.put<{ message: string }>(`visitlog/${logId}/checkout`, {});
  return response.data;
};

