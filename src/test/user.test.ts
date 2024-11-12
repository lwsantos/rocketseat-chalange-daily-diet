import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../app';
import { execSync } from 'node:child_process';

describe('Users Routes', async () => {

    beforeAll(async () => {
        await app.ready();
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(async () => {
        execSync('npm run knex migrate:rollback --all');
        execSync('npm run knex migrate:latest');
    });

    it('should be able to create a new user', async () => {
        const response = await request(app.server)
                                    .post('/users')
                                    .send({name: 'Lincoln Watanabe'});
        expect(response.status).toBe(201);
    });

    it('should be able to get specific user', async () => {
        const createUserReponse = await request(app.server)
                                    .post('/users')
                                    .send({name: 'Lincoln Watanabe'});
        
        const {user} = createUserReponse.body;

        const response = await request(app.server)
                                    .get(`/users/${user.id}`);

        expect(response.status).toBe(200);
    });
});