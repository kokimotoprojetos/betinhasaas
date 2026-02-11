export interface Metric {
  label: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  subtext?: string;
  icon: string;
  highlight?: boolean;
  progress?: number;
}

export interface Conversation {
  id: string;
  name: string;
  avatar: string;
  initials?: string;
  initialsColor?: string;
  time: string;
  message: string;
  status: 'AI Handling' | 'Booked' | 'Human Intervention Needed' | 'AI Resolved';
  isOnline?: boolean;
}

export interface Appointment {
  id: string;
  name: string;
  service: string;
  time: string;
  dayLabel: string;
  isToday: boolean;
  status?: 'confirmed' | 'pending';
}