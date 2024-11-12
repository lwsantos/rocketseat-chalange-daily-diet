import { FastifyInstance } from "fastify";
import { knex } from "../database";
import { z } from "zod";
import { randomUUID } from "crypto";

export async function usersRoutes(app: FastifyInstance){
    app.post("/", async (request, reply) => {

        const createUserSchema = z.object({
            name: z.string()
        });

        const body = createUserSchema.parse(request.body);

        const [user] = await knex('users').insert({
            id: randomUUID(),
            name: body.name
        }).returning('*');

        return reply.code(201).send({user});
    });
    
    app.get("/", async (request, reply) => {

        const users = await knex('users').select();

        return {users};
    });

    app.get("/:id", async (request, reply) => {

        const paramsSchema = z.object({
            id: z.string().uuid()
        });

        const params = paramsSchema.parse(request.params);
        const user = await knex('users').where({id: params.id}).first();

        if(!user){
            return reply.code(404).send({message: 'User not found'});
        }

        return {user};
    });
}