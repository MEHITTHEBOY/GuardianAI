
export enum SafetyStatus {
  SAFE = 'SAFE',
  WATCHING = 'WATCHING',
  DANGER = 'DANGER'
}

export enum ReportType {
  INCIDENT = 'INCIDENT',
  SAFE_ZONE = 'SAFE_ZONE'
}

export interface Location {
  lat: number;
  lng: number;
  accuracy?: number;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relation: string;
}

export interface CommunityReport {
  id: string;
  type: ReportType;
  lat: number;
  lng: number;
  title: string;
  description: string;
  timestamp: Date;
  urgency?: 'Low' | 'Medium' | 'High';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
