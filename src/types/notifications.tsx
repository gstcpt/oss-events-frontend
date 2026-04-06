import { AppSetting } from './app-settings';
import { User } from './users';

export type Notification = {
    id: number;
    actor_id: number;
    receiver_id: number;
    notification: string;
    status: number;
    created_at: string;
};