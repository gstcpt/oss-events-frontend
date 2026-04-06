import { Permission } from './permissions';

export interface Role {
    role_permission: any;
    id: number;
    title: string;
    permissionIds?: number[];
    permissions?: Permission[];
}

export interface RolePermission {
    id: number;
    role_id: number;
    permission_id: number;
}