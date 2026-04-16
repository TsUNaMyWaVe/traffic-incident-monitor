exports.up = async function (knex) {
  await knex.schema.createTable('incidents', function (table) {
    table.increments('id').primary();
    table.text('description').nullable();
    table.string('location').notNullable();
    table.integer('severity').notNullable().defaultTo(1);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.boolean('resolved').defaultTo(false);
    table.boolean('dismissed').defaultTo(false);
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('incidents');
};
