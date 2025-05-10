import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {map, Observable} from 'rxjs';
import {SectionMember} from '../models/user.model';
import {FamilyGroup} from '../models/family-group.model';

@Injectable({
  providedIn: 'root'
})
export class EducatorsService {

  private apiUrl = 'http://localhost:8080';
  client:HttpClient = inject(HttpClient);

  getNomina():Observable<SectionMember[]> {
    return this.client.get<SectionMember[]>(`${this.apiUrl}/educators/nomina`);
  }

  getFamilyGroup(userId:number):Observable<FamilyGroup> {
    return this.client.get<FamilyGroup>(`${this.apiUrl}/familyGroup/${userId}`);
  }

  getMemberWithTutors(member: SectionMember): Observable<any> {
    return this.getFamilyGroup(member.userId).pipe(
      map(familyGroup => ({
        ...member,
        familyGroup,
        tutores: member.relationships.map(rel => {
          const tutor = familyGroup.tutors.find(t => t.id === rel.tutorId) ||
            (familyGroup.mainContact.id === rel.tutorId ? familyGroup.mainContact : null);
          return tutor ? {
            ...tutor,
            relationship: rel.relationship
          } : null;
        }).filter(t => t !== null)
      }))
    );
  }
}
