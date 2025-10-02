
export type View = "home" | "blog" | "mentors" | "incubators" | "submitIP" | "pricing" | "msmes" | "solveChallenges" | "dashboard" | "login" | "signup" | "education" | "contact" | "complete-profile" | "joinasanMSME" |"browseTech" | "marketplace";
export type DashboardTab = "overview" | "msmes" |"ip/technologies"| "incubators" | "engagements" | "mentors"  | "submission" | "settings" | "users" | "blog" | "sessions" | "subscribers";
export type MentorDashboardTab = "overview" | "mentees" | "schedule" | "profile" | "settings";
export type IncubatorDashboardTab = "overview" | "submissions" | "profile" | "settings";
export type MsmeDashboardTab = "overview" | "submissions" | "profile" | "settings";
export type UserRole = "admin" | "mentor" | "incubator" | "msme" | "founder";
export type founderRole = "Solve MSME's challenge" | "List a technology for licensing" | "Submit an innovative idea"
export type UserStatus = "active" | "banned" | "pending";

export type Comment = {
  author: 'Founder' | 'Incubator' | 'Triage Team' | 'MSME';
  text: string;
  timestamp: string;
};

export type Submission = {
  id: number;
  founder: string; 
  idea: string; 
  status: 'New' | 'Under Review' | 'Valid' | 'Duplicate' | 'Rejected';
  description: string;
  submittedDate: string;
  comments: Comment[];
};

export type AppUser = {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  auth_provider: 'local' | 'google' | 'linkedin';
  status: UserStatus;
  email_verified: boolean;
  created_at: string;
};

export type NewsletterSubscriber = {
  id: number;
  email: string;
  subscribed_at: string;
};

export type BlogPost = {
  id: number;
  title: string;
  image: string;
  hint: string;
  excerpt: string;
  content: string;
  created_at: string;
};

export type EducationSession = {
    language: string;
    date: string;
    time: string;
};

export type EducationFeature = {
    name: string;
    icon: string;
};

export type EducationProgram = {
    id: number;
    title: string;
    sessions: EducationSession[];
    description: string;
    features: EducationFeature[];
    created_at: string;
};

    
