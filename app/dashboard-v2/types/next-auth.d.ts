import 'next-auth';
import { Client } from '@/app/dashboard-v2/types';

declare module 'next-auth' {
    interface User {
        client?: Client;
        client_id?: number;
    }
    interface Session {
        user?: User;
    }
} 