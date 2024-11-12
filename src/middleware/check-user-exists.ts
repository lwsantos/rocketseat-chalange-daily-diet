import { FastifyReply, FastifyRequest } from "fastify";
import { knex } from "../database";
import { z } from "zod";

export default async function checkUserExists(request: FastifyRequest, reply: FastifyReply){
    console.log('Checking if user exists');
    const paramsSchema = z.object({
        userId: z.string().uuid()
    });

    const params = paramsSchema.parse(request.params);

    const user = await knex('users').where({id: params.userId}).first();

    if(!user){
        return reply.code(404).send({message: 'User not found'});
    }

    request.user = user;
}