import { FastifyInstance } from "fastify";
import { knex } from "../database";
import { z } from "zod";
import { randomUUID } from "crypto";
import checkUserExists from "../middleware/check-user-exists";

export async function mealsRoutes(app: FastifyInstance){
    app.post("/", async (request, reply) => {

        const createMealSchema = z.object({
            name: z.string(),
            description: z.string(),
            date: z.string(),
            time: z.string(),
            is_expected: z.boolean(),
            user_id: z.string().uuid()
        });

        const body = createMealSchema.parse(request.body);

        const date = new Date(body.date);
        const formattedDate = date.toISOString().split('T')[0];

        const [meal] = await knex('meals').insert({
            id: randomUUID(),
            name: body.name,
            description: body.description,
            date: formattedDate,
            time: body.time,
            is_expected: body.is_expected,
            user_id: body.user_id
        }).returning('*');

        return reply.code(201).send({meal});
    });

    app.put("/:id/:userId", {
        preHandler: [checkUserExists]
    }, async (request, reply) => {

        const user = request.user;

        if(!user){
            return reply.code(404).send({message: 'User not found'});
        }

        const paramsSchema = z.object({
            id: z.string().uuid()
        });

        const updateMealSchema = z.object({
            name: z.string(),
            description: z.string(),
            date: z.string(),
            time: z.string(),
            is_expected: z.boolean(),
            user_id: z.string().uuid()
        });

        const body = updateMealSchema.parse(request.body);
        const params = paramsSchema.parse(request.params);

        const meal = await knex('meals').where({id: params.id, user_id: user.id}).first();

        if(!meal){
            return reply.code(404).send({message: 'Meal not found'});
        }

        const date = new Date(body.date);
        const formattedDate = date.toISOString().split('T')[0];

        const [mealUpdated] = await knex('meals').update({
            name: body.name,
            description: body.description,
            date: formattedDate,
            time: body.time,
            is_expected: body.is_expected,
            user_id: body.user_id,
            updated_at: knex.fn.now()
        }).where({id: params.id})
        .returning('*');

        return reply.code(200).send({meal: mealUpdated});
    });

    app.delete("/:id/:userId", {
        preHandler: [checkUserExists]
    }, async (request, reply) => {

        const user = request.user;

        if(!user){
            return reply.code(404).send({message: 'User not found'});
        }

        const paramsSchema = z.object({
            id: z.string().uuid()
        });

        const params = paramsSchema.parse(request.params);

        const meal = await knex('meals').where({id: params.id, user_id: user.id}).first();

        if(!meal){
            return reply.code(404).send({message: 'Meal not found'});
        }

        await knex('meals').delete().where({id: params.id});

        return reply.code(200).send({message: 'Meal deleted'});
    });
    
    app.get("/:userId", {
        preHandler: [checkUserExists]
    }, async (request, reply) => {

        const user = request.user;

        if(!user){
            return reply.code(404).send({message: 'User not found'});
        }

        const meals = await knex('meals').where({user_id: user.id}).orderBy('date', 'DESC').select();

        return {meals};
    });

    app.get("/:id/:userId", {
        preHandler: [checkUserExists]
    }, async (request, reply) => {
        
        const user = request.user;

        if(!user){
            return reply.code(404).send({message: 'User not found'});
        }

        const paramsSchema = z.object({
            id: z.string().uuid()
        });

        const params = paramsSchema.parse(request.params);
        const meal = await knex('meals').where({id: params.id, user_id: user.id}).first();

        if(!meal){
            return reply.code(404).send({message: 'Meal not found'});
        }

        return {meal};
    });

    app.get("/summary/:userId", {
        preHandler: [checkUserExists]
    }, async (request, reply) => {
        const user = request.user;

        if(!user){
            return reply.code(404).send({message: 'User not found'});
        }

        const respMeals = await knex('meals')
                                    .where({user_id: user.id})
                                    .orderBy([
                                        {column: 'date', order: 'DESC'},
                                        {column: 'time', order: 'DESC'}
                                    ])
                                    .select();
        const respExpected = await knex('meals').where({user_id: user.id, is_expected: true}).count('id', {as: 'totalExpected'}).first();
        const respNotExpected = await knex('meals').where({user_id: user.id, is_expected: false}).count('id', {as: 'totalUnexpected'}).first();

        const bestSequence = respMeals.reduce((acc, meal) => {
            if(meal.is_expected){
                acc.current++;
                acc.total = Math.max(acc.total, acc.current);
            } else {
                acc.current = 0;
            }

            return acc;
        }, {total: 0, current: 0});

        return {
            totalMeal: respMeals?.length ?? 0,
            totalExpected: respExpected?.totalExpected ?? 0, 
            totalUnexpected: respNotExpected?.totalUnexpected ?? 0,
            totalBestSequence: bestSequence.total
        };
    });
}