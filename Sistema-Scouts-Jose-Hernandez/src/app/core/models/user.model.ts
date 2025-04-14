export interface User {
  id: string;
  lastName: string;
  email: string;
  createdAt?: string;
  lastLogin?: string;
  profilePicture?: string;
  roles: string[];
}
