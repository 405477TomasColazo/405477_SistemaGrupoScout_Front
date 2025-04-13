import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable, of} from 'rxjs';
import { FamilyGroup, MemberProtagonist, Tutor, Relationship } from '../models/family-group.model';


@Injectable({
  providedIn: 'root'
})
export class FamilyGroupService {
  private apiUrl = '';

  constructor(private http: HttpClient) {}

  // Obtener grupo familiar completo
  getFamilyGroup(): Observable<FamilyGroup> {
    const familyGroup:FamilyGroup = {id: 0, mainContact: {
        contactPhone: '13131531',
        email: 'tomi@email.com',
        id: 1,
        userId: 1,
        name: 'Tomi',
        lastName: 'Colazo',
        birthdate: new Date(),
        dni: '42258104',
        relationships: []
      }, members: [{
        memberType: 'Beneficiario',
        section: 'Manada',
        accountBalance: 15623,
        id: 2,
        userId: 1,
        name: 'Mateo',
        lastName: 'Zarza',
        birthdate: new Date(),
        dni: '13135135',
        relationships: []
      }], tutors: [], user: {
        id: '1',
        name: 'Colazo',
        email: 'tomi@email.com',
        roles: []
      }}
    return of(familyGroup);
    // return this.http.get<FamilyGroup>(`${this.apiUrl}/current`);
  }

  // Gestión de tutores
  addTutor(tutor: Tutor): Observable<Tutor> {
    return this.http.post<Tutor>(`${this.apiUrl}/tutors`, tutor);
  }

  updateTutor(tutor: Tutor): Observable<Tutor> {
    return this.http.put<Tutor>(`${this.apiUrl}/tutors/${tutor.id}`, tutor);
  }

  deleteTutor(tutorId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/tutors/${tutorId}`);
  }

  // Gestión de beneficiarios
  addMember(member: MemberProtagonist): Observable<MemberProtagonist> {
    return this.http.post<MemberProtagonist>(`${this.apiUrl}/members`, member);
  }

  updateMember(member: MemberProtagonist): Observable<MemberProtagonist> {
    return this.http.put<MemberProtagonist>(`${this.apiUrl}/members/${member.id}`, member);
  }

  deleteMember(memberId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/members/${memberId}`);
  }

  // Gestión de relaciones
  addRelationship(relationship: Relationship): Observable<Relationship> {
    return this.http.post<Relationship>(`${this.apiUrl}/relationships`, relationship);
  }

  deleteRelationship(relationship: Relationship): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/relationships/${relationship.memberId}/${relationship.tutorId}`
    );
  }
}
