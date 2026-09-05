export type AdminRole = 'STAFF' | 'MANAGER' | 'OWNER';

export interface ManagedAdmin {
    id: string;
    role: AdminRole;
    username: string;
    firstname: string;
    lastname: string;
    createdAt: string;
    updatedAt: string;
    status: 'ACTIVE';
}

export interface NavigationItem {
    label: string;
    icon: string;
    path: string;
    minRole: 'STAFF' | 'MANAGER' | 'OWNER';
}