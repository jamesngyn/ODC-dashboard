import { TaskType } from "./enums/common";

export interface Task {
  id: string;
  title: string;
  status: TaskType;
  dueDate: string; // ISO Date string
}

export interface DashboardStats {
  distribution: {
    status: TaskType;
    count: number;
    percentage: number;
  }[];
  totalTasks: number;
  insights: {
    onTrack: {
      count: number;
      percentage: number;
    };
    monitor: {
      count: number;
      threshold: number;
    };
    uatReady: {
      count: number;
    };
  };
}
