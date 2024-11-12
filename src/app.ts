import fastify from "fastify";
import { usersRoutes } from "./routes/users";
import { mealsRoutes } from "./routes/meals";

const app = fastify();

// Adicionando um hook global para exibir o método, a URL e o corpo de cada requisição.
app.addHook('preHandler', async (request, reply) => {
    console.log(`[${request.method}] ${request.url}: ${request.body ? JSON.stringify(request.body) : 'No body'}`);
});

app.register(usersRoutes, {
    prefix: "/users"
});

app.register(mealsRoutes, {
    prefix: "/meals"
});

export default app;