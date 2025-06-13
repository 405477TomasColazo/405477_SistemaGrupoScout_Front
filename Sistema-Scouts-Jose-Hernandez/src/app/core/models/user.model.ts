import {Relationship, Tutor} from './family-group.model';

export interface User {
  id: number;
  lastName: string;
  email: string;
  createdAt?: string;
  lastLogin?: string;
  profilePicture?: string;
  roles: string[]; // This should always be defined, even if empty
}

export interface Invitation {
  id?: number;
  lastName: string;
  email: string;
  status: string;
  sentDate?: string;
  tutor?: Tutor;
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
