import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {RegisterRequest} from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly url: string = 'http://localhost:8080';

  registerUser(user: RegisterRequest) {
    return this.http.post<string>(`${this.url}/auth/register`, user)
  }

}
