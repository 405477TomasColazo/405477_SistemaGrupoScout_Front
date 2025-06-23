import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {filter, Observable, of, switchMap} from 'rxjs';
import { FamilyGroup, MemberProtagonist, Tutor, Relationship } from '../models/family-group.model';
import {AuthService} from '../auth/auth.service';
import {User} from '../models/user.model';


@Injectable({
  providedIn: 'root'
})
export class FamilyGroupService {
  private apiUrl = 'http://localhost:8080/familyGroup';

  constructor(private http: HttpClient,private authService: AuthService) {}

  // Obtener grupo familiar completo
  getFamilyGroup(): Observable<FamilyGroup> {
    return this.authService.currentUser$.pipe(
      // Filtramos nulls por si el usuario no está logueado
      filter((user): user is User => !!user),
      // Hacemos el request una vez que tenemos el user
      switchMap(user =>
        this.http.get<FamilyGroup>(`${this.apiUrl}/${user.id}`)
      )
    );
  }

  // Gestión de tutores
  addTutor(tutor: Tutor): Observable<Tutor> {
    console.log(tutor);
    return this.http.post<Tutor>(`${this.apiUrl}/tutor`, tutor);
  }

  updateTutor(tutor: Tutor): Observable<Tutor> {
    return this.http.put<Tutor>(`${this.apiUrl}/tutor/${tutor.id}`, tutor);
  }

  deleteTutor(tutorId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/tutor/${tutorId}`);
  }

  // Gestión de beneficiarios
  addMember(member: MemberProtagonist): Observable<MemberProtagonist> {
    return this.http.post<MemberProtagonist>(`${this.apiUrl}/member`, member);
  }

  updateMember(member: MemberProtagonist): Observable<MemberProtagonist> {
    return this.http.put<MemberProtagonist>(`${this.apiUrl}/member/${member.id}`, member);
  }

  deleteMember(memberId: number): Observable<void> {
    console.log(this.authService.getCurrentUser())
    return this.http.delete<void>(`${this.apiUrl}/member/${memberId}`);
  }

  // Gestión de relaciones
  addRelationship(relationship: Relationship): Observable<Relationship> {
    return this.http.post<Relationship>(`${this.apiUrl}/relationship`, relationship);
  }

  deleteRelationship(relationshipId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/relationShip/${relationshipId}`);
  }

  getFamilyGroupById(userId: number):Observable<FamilyGroup> {
    return this.http.get<FamilyGroup>(`${this.apiUrl}/${userId}`);
  }
}
