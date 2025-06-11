import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Invitation, InvitationRequest} from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class InvitationService {
  private readonly url = "http://localhost:8080/user";
  private client = inject(HttpClient);

  sendInvitation(invitation: InvitationRequest) {
    return this.client.post(`${this.url}/invite`, invitation);
  }
}
