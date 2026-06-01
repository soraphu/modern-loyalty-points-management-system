export type AdminRole = 'STAFF' | 'MANAGER' | 'OWNER';

export interface NavigationItem {
    label: string;
    icon: string;
    path: string;
    minRole: 'STAFF' | 'MANAGER' | 'OWNER';
}