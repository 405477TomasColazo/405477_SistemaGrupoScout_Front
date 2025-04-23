import {Tutor} from './family-group.model';

export interface User {
  id: number;
  lastName: string;
  email: string;
  createdAt?: string;
  lastLogin?: string;
  profilePicture?: string;
  roles: string[];
}

export interface Invitation {
  id?: number;
  lastName: string;
  email: string;
  status: string;
  sentDate?: string;
  tutor?: Tutor;
}
