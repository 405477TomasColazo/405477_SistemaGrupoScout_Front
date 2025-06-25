import {Relationship, Tutor} from './family-group.model';

export interface User {
  id: number;
  lastName: string;
  email: string;
  createdAt?: string;
  lastLogin?: string;
  profilePicture?: string;
  avatar?: string;
  roles: string[]; // This should always be defined, even if empty
}

export interface Invitation {
  id?: number;
  lastName: string;
  email: string;
  userType?: string; // "FAMILY" or "EDUCATOR"
  status: string;
  sentDate?: string;
  sectionName?: string; // Only for educators
  tutor?: Tutor;
}

export interface Section {
  id: number;
  description: string;
  minAge?: number;
  maxAge?: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  lastName: string;
  tutor: Tutor;
}

export interface InvitationRequest{
  email: string;
  lastName: string;
  userType: string; // "FAMILY" or "EDUCATOR"
  sectionId?: number; // Only for educators
}

export interface SectionMember{
  id: number;
  userId: number;
  name: string;
  lastName: string;
  dni:string;
  section:string
  birthdate:Date;
  notes: string;
  relationships:Relationship[];
  accountBalance:number;
  isEducator:boolean;
  address:string;
}

export interface MiembroConDetalles extends SectionMember {
  tutoresInfo?: (Tutor & { relationship: string })[];
}

// User Management Interfaces (simplified)
export interface UpdateUserRequest {
  email: string;
  lastName: string;
  avatar?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AvatarOption {
  id: string;
  name: string;
  url: string;
}

// API Response interfaces
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
