export interface User {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  roles: string[];
  familyGroupId?: string;
}
