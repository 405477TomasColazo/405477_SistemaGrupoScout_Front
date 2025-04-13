import {User} from './user.model';


export interface Relationship{
  memberId: number;
  tutorId: number;
  relationship: string;
}
export interface FamilyGroup {
  id: number;
  user: User;
  mainContact: Tutor;
  members: MemberProtagonist[];
  tutors: Tutor[];
}
export interface Member {
  id: number;
  userId: number;
  name: string;
  lastName: string;
  birthdate: Date;
  dni: string;
  notes?: string;
  relationships: Relationship[];
}

export interface MemberProtagonist extends Member {
  memberType: string;
  section: string;
  accountBalance: number;

}
export interface Tutor extends Member {
  contactPhone: string;
  email: string;
}
