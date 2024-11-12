import { Knex } from 'knex';

declare module 'knex/types/tables' {
    export interface Tables {
        users: {
            id: string;
            name: string;
            created_at: string;
        },
        meals: {
            id: string;
            name: string;
            description: string;
            date: string;
            time: string;
            is_expected: boolean;
            user_id: string;
            created_at: string;
            updated_at: string;
        }
    }
}