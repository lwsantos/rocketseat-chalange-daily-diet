import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../app';
import { execSync } from 'node:child_process';

describe('Meals Routes', async () => {

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

    it('should be able to create a new meal', async () => {
        const createUserResponse = await request(app.server)
                                    .post('/users')
                                    .send({name: 'Lincoln Watanabe'});

        const {user} = createUserResponse.body;

        const response = await request(app.server)
                                    .post('/meals')
                                    .send({
                                        name: 'Breakfast',
                                        description: 'A delicious breakfast',
                                        date: '2024-11-01',
                                        time: '08:00',
                                        is_expected: true,
                                        user_id: user.id
                                    });

        expect(response.status).toBe(201);
        
    });

    it('should be able to update a meal', async () => {
        const createUserResponse = await request(app.server)
                                    .post('/users')
                                    .send({name: 'Lincoln Watanabe'})
                                    .expect(201);

        const {user} = createUserResponse.body;

        const createMealResponse = await request(app.server)
                                    .post('/meals')
                                    .send({
                                        name: 'Breakfast',
                                        description: 'A delicious breakfast',
                                        date: '2024-11-01',
                                        time: '08:00',
                                        is_expected: true,
                                        user_id: user.id
                                    })
                                    .expect(201);

        const {meal} = createMealResponse.body;

        const updateMealResponse = await request(app.server)
                                    .put(`/meals/${meal.id}/${user.id}`)
                                    .send({
                                        name: 'Breakfast',
                                        description: 'A bad breakfast',
                                        date: '2024-11-01',
                                        time: '08:00',
                                        is_expected: false,
                                        user_id: user.id
                                    })
                                    .expect(200);

        expect(updateMealResponse.body.meal).toEqual(
            expect.objectContaining({
                id: meal.id,
                description: 'A bad breakfast',
                is_expected: 0 // valor false salvo como 0
            })
        );
        
    });

    it('should be able to delete a meal', async () => {
        const createUserResponse = await request(app.server)
                                    .post('/users')
                                    .send({name: 'Lincoln Watanabe'})
                                    .expect(201);

        const {user} = createUserResponse.body;

        const createMealResponse = await request(app.server)
                                    .post('/meals')
                                    .send({
                                        name: 'Breakfast',
                                        description: 'A delicious breakfast',
                                        date: '2024-11-01',
                                        time: '08:00',
                                        is_expected: true,
                                        user_id: user.id
                                    })
                                    .expect(201);

        const {meal} = createMealResponse.body;

        const deleteMealResponse = await request(app.server)
                                    .delete(`/meals/${meal.id}/${user.id}`)
                                    .expect(200);

        const getMealResponse = await request(app.server)
                                    .get(`/meals/${meal.id}/${user.id}`)

        expect(getMealResponse.status).toBe(404);
    });

    it('should be able to get specific meal', async () => {
        const createUserReponse = await request(app.server)
                                    .post('/users')
                                    .send({name: 'Lincoln Watanabe'})
                                    .expect(201);
        
        const {user} = createUserReponse.body;

        const createMealResponse = await request(app.server)
                                    .post('/meals')
                                    .send({
                                        name: 'Breakfast',
                                        description: 'A delicious breakfast',
                                        date: '2024-11-01',
                                        time: '08:00',
                                        is_expected: true,
                                        user_id: user.id
                                    })
                                    .expect(201);

        const {meal} = createMealResponse.body;

        const response = await request(app.server)
                                    .get(`/meals/${meal.id}/${user.id}`);

        expect(response.status).toBe(200);
    });

    it('should be able to get all meals', async () => {
        const createUserReponse = await request(app.server)
                                    .post('/users')
                                    .send({name: 'Lincoln Watanabe'})
                                    .expect(201);
        
        const {user} = createUserReponse.body;

        await request(app.server)
                        .post('/meals')
                        .send({
                            name: 'Breakfast',
                            description: 'A delicious breakfast',
                            date: '2024-11-01',
                            time: '08:00',
                            is_expected: true,
                            user_id: user.id
                        })
                        .expect(201);

        await request(app.server)
                        .post('/meals')
                        .send({
                            name: 'Lunch',
                            description: 'A delicious lunch',
                            date: '2024-11-01',
                            time: '12:00',
                            is_expected: true,
                            user_id: user.id
                        })
                        .expect(201);

        const response = await request(app.server)
                                    .get(`/meals/${user.id}`)
                                    .expect(200);

        expect(response.body.meals.length).toBe(2);
    });

    it('should be able to get summary', async () => {
        const createUserReponse = await request(app.server)
                                    .post('/users')
                                    .send({name: 'Lincoln Watanabe'})
                                    .expect(201);
        
        const {user} = createUserReponse.body;

        await request(app.server)
                        .post('/meals')
                        .send({
                            name: 'Breakfast',
                            description: 'A delicious breakfast',
                            date: '2024-11-01',
                            time: '08:00',
                            is_expected: true,
                            user_id: user.id
                        })
                        .expect(201);

        await request(app.server)
                        .post('/meals')
                        .send({
                            name: 'Lunch',
                            description: 'A delicious lunch',
                            date: '2024-11-01',
                            time: '12:00',
                            is_expected: true,
                            user_id: user.id
                        })
                        .expect(201);
        
        await request(app.server)
                        .post('/meals')
                        .send({
                            name: 'Dinner',
                            description: 'A delicious dinner',
                            date: '2024-11-01',
                            time: '18:00',
                            is_expected: false,
                            user_id: user.id
                        });
                    
        await request(app.server)
                        .post('/meals')
                        .send({
                            name: 'Pizza',
                            description: 'A delicious pizza',
                            date: '2024-11-02',
                            time: '18:00',
                            is_expected: true,
                            user_id: user.id
                        });

        const response = await request(app.server)
                                    .get(`/meals/summary/${user.id}`)
                                    .expect(200);

        expect(response.body.totalMeal).toBe(4);
        expect(response.body.totalExpected).toBe(3);
        expect(response.body.totalUnexpected).toBe(1);
        expect(response.body.totalBestSequence).toBe(2);
    });
});