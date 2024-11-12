import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('meals', (table) => {
        table.uuid('id').primary();
        table.string('name').notNullable();
        table.string('description').notNullable();
        table.timestamp('date').notNullable();
        table.string('time').notNullable();
        table.boolean('is_expected').notNullable();
        table.uuid('user_id').references('id').inTable('users').notNullable().onDelete('CASCADE').onUpdate('CASCADE');
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('meals');
}

