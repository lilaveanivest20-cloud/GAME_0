import { EducationalProfile } from './archipelago.model';

export interface StudentGroup {
  id: string;
  name: string;
  profile: EducationalProfile;
  course: string;
  studentCount: number;
  inviteCode: string;
}

export interface StudentSubmission {
  id: string;
  studentId: string;
  studentName: string;
  lessonId: string;
  lessonTitle: string;
  groupId: string;
  submittedAt: string;
  status: 'pending' | 'graded' | 'flagged';
  score12?: number; // Ukrainian 12-point scale (School)
  score100?: number; // 100-point scale (University)
  ectsGrade?: 'A' | 'B' | 'C' | 'D' | 'E' | 'FX' | 'F';
  hintsUsed: number;
  pasteEventsCount: number;
  tabSwitchCount: number;
  integrityFlags: string[];
  codeSnapshot: string;
}

export interface Assignment {
  id: string;
  title: string;
  groupId: string;
  lessonId: string;
  deadline: string;
  maxScore: number;
  description: string;
  status: 'active' | 'closed';
}
