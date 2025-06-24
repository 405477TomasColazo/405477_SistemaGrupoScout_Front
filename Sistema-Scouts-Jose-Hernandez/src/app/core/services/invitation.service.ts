import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Invitation, InvitationRequest, Section} from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class InvitationService {
  private readonly url = "http://localhost:8080/user";
  private client = inject(HttpClient);

  sendInvitation(invitation: InvitationRequest) {
    return this.client.post(`${this.url}/invite`, invitation);
  }

  getPendingInvitations() {
    return this.client.get<Invitation[]>(`${this.url}/invitations/pending`);
  }

  getCompletedRegistrations() {
    return this.client.get<Invitation[]>(`${this.url}/invitations/completed`);
  }

  resendInvitation(id: number) {
    return this.client.post<Invitation>(`${this.url}/invitations/${id}/resend`, {});
  }

  deleteInvitation(id: number) {
    return this.client.delete(`${this.url}/invitations/${id}`);
  }

  getAllSections() {
    return this.client.get<Section[]>(`${this.url}/sections`);
  }
}
