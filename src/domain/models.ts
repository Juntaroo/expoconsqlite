export type ObservationSeverity = "LOW" | "MEDIUM" | "HIGH";

export interface Observation {
  id: string;
  title: string;
  severity: ObservationSeverity;
  description?: string | null;
  createdAt: string;  
  updatedAt: string;  
  deviceId: string;
  version: number;
  deleted: number;    
}

export type OutboxOpType = "INSERT" | "UPDATE" | "DELETE";

export interface OutboxEntry {
  opId: string;
  entityId: string;
  opType: OutboxOpType;
  payload: Observation; 
  createdAt: string;
  tryCount: number;
  lastError?: string | null;
}
