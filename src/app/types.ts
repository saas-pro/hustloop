
export type View = "home" | "blog" | "mentors" | "incubators" | "pricing" | "msmes" | "dashboard" | "login" | "signup" | "education" | "contact";
export type DashboardTab = "overview" | "msmes" | "incubators" | "mentors" | "submission" | "settings";
export type MentorDashboardTab = "overview" | "mentees" | "schedule" | "settings";
export type IncubatorDashboardTab = "overview" | "submissions" | "profile" | "settings";
export type MsmeDashboardTab = "overview" | "submissions" | "profile" | "settings";
export type UserRole = "admin" | "mentor" | "incubator" | "msme";

export type Comment = {
  author: 'Founder' | 'Incubator' | 'Triage Team' | 'MSME';
  text: string;
  timestamp: string;
};

export type Submission = {
  id: number;
  founder: string; // Represents the startup or founder name
  idea: string; // Represents the idea or solution title
  status: 'New' | 'Under Review' | 'Valid' | 'Duplicate' | 'Rejected';
  description: string;
  submittedDate: string;
  comments: Comment[];
};
