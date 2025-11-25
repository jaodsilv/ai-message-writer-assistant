/**
 * Job Hunting Specific Types
 */

export interface Company {
  id: string;
  name: string;
  website?: string;
  industry?: string;
  size?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  culture?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobDescription {
  id: string;
  companyId: string;
  title: string;
  description: string;
  requirements: string[];
  niceToHave?: string[];
  salaryRange?: {
    min: number;
    max: number;
    currency: string;
  };
  location: string;
  remotePolicy: 'remote' | 'hybrid' | 'onsite';
  applicationUrl?: string;
  applicationDeadline?: string;
  keywords: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Resume {
  id: string;
  name: string;
  filePath: string;
  version: string;
  targetRole?: string;
  skills: string[];
  experience: Array<{
    company: string;
    title: string;
    startDate: string;
    endDate?: string;
    highlights: string[];
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface Application {
  id: string;
  companyId: string;
  jobDescriptionId: string;
  resumeId: string;
  coverLetterId?: string;
  status: ApplicationStatus;
  appliedAt: string;
  lastActivityAt: string;
  nextFollowUpDate?: string;
  notes?: string;
  contacts: Contact[];
  interviews: Interview[];
}

export type ApplicationStatus =
  | 'draft'
  | 'applied'
  | 'screening'
  | 'interviewing'
  | 'offer'
  | 'negotiating'
  | 'accepted'
  | 'rejected'
  | 'withdrawn';

export interface Contact {
  id: string;
  name: string;
  email?: string;
  linkedinUrl?: string;
  role: string;
  company: string;
  notes?: string;
  lastContactedAt?: string;
}

export interface Interview {
  id: string;
  applicationId: string;
  type: InterviewType;
  scheduledAt: string;
  duration: number; // minutes
  interviewers?: string[];
  location?: string;
  meetingLink?: string;
  notes?: string;
  feedback?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
}

export type InterviewType =
  | 'phone-screen'
  | 'recruiter'
  | 'hiring-manager'
  | 'technical'
  | 'system-design'
  | 'behavioral'
  | 'panel'
  | 'onsite'
  | 'final';

export interface CoverLetter {
  id: string;
  companyId: string;
  jobDescriptionId: string;
  content: string;
  version: number;
  status: 'draft' | 'review' | 'final';
  createdAt: string;
  updatedAt: string;
}
