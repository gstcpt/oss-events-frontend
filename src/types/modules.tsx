import { Permission } from './permissions';

export type Module = {
    id: number;
    title: string;
    code: string;
    permissions: Permission[];
};