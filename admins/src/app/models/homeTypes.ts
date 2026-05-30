export type UserRole = 'STAFF' | 'MANAGER' | 'OWNER';

export interface UserProfile {
    id: string;
    username: string;
    firstname: string;
    lastname: string;
    role: UserRole;
    avatarUrl?: string;
}

export interface NavigationItem {
    label: string;
    icon: string;
    path: string;
    minRole: 'STAFF' | 'MANAGER' | 'OWNER';
}