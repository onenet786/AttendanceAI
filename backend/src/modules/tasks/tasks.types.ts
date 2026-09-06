export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface ProjectDto {
  id?: string;
  name: string;
  code: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: 'PLANNED' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED';
}

export interface TaskDto {
  id?: string;
  projectId?: string;
  title: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  assignedEmployeeId?: string;
  estimatedHours?: number;
  actualHours?: number;
  dueDate?: string;
}

export interface TaskTimeLogDto {
  id?: string;
  taskId: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  hours: number;
  notes?: string;
}

export interface AttendanceTaskReconciliation {
  employeeId: string;
  employeeName: string;
  date: string;
  attendanceClockedHours: number;
  taskLoggedHours: number;
  differenceHours: number;
  complianceStatus: 'MATCHED' | 'UNDER_LOGGED' | 'OVER_LOGGED' | 'ABSENT_BUT_LOGGED';
}
