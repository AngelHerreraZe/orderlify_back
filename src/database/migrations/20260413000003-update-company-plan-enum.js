'use strict';
/**
 * Update companies.plan ENUM
 *
 * Old values: 'uniestacion' | 'unisucursal' | 'multisucursal'
 * New values: 'free' | 'basic' | 'pro' | 'business'
 *
 * Migration strategy (PostgreSQL):
 *   1. Change column to TEXT so we can drop the ENUM type
 *   2. Drop the old enum type
 *   3. Map existing rows to new values
 *   4. Create new ENUM type
 *   5. Re-cast column to new ENUM
 *   6. Set new default
 *
 * Value mapping:
 *   uniestacion  → free
 *   unisucursal  → basic
 *   multisucursal → business
 */
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Detach column from ENUM — change to plain TEXT
    await queryInterface.sequelize.query(`
      ALTER TABLE companies
        ALTER COLUMN plan DROP DEFAULT,
        ALTER COLUMN plan TYPE TEXT USING plan::TEXT;
    `);

    // 2. Drop the old ENUM type (now unused)
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_companies_plan";
    `);

    // 3. Migrate existing values to new plan names
    await queryInterface.sequelize.query(`
      UPDATE companies SET plan = 'free'     WHERE plan = 'uniestacion';
      UPDATE companies SET plan = 'basic'    WHERE plan = 'unisucursal';
      UPDATE companies SET plan = 'business' WHERE plan = 'multisucursal';
    `);

    // 4. Create the new ENUM type
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_companies_plan"
        AS ENUM ('free', 'basic', 'pro', 'business');
    `);

    // 5. Re-cast column to new ENUM
    await queryInterface.sequelize.query(`
      ALTER TABLE companies
        ALTER COLUMN plan TYPE "enum_companies_plan"
          USING plan::"enum_companies_plan";
    `);

    // 6. Restore default with the new value
    await queryInterface.sequelize.query(`
      ALTER TABLE companies
        ALTER COLUMN plan SET DEFAULT 'free';
    `);
  },

  async down(queryInterface) {
    // 1. Detach column from new ENUM
    await queryInterface.sequelize.query(`
      ALTER TABLE companies
        ALTER COLUMN plan DROP DEFAULT,
        ALTER COLUMN plan TYPE TEXT USING plan::TEXT;
    `);

    // 2. Drop new ENUM type
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_companies_plan";
    `);

    // 3. Reverse-map values back to legacy names
    await queryInterface.sequelize.query(`
      UPDATE companies SET plan = 'uniestacion'   WHERE plan = 'free';
      UPDATE companies SET plan = 'unisucursal'   WHERE plan = 'basic';
      UPDATE companies SET plan = 'unisucursal'   WHERE plan = 'pro';
      UPDATE companies SET plan = 'multisucursal' WHERE plan = 'business';
    `);

    // 4. Recreate the old ENUM type
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_companies_plan"
        AS ENUM ('uniestacion', 'unisucursal', 'multisucursal');
    `);

    // 5. Re-cast column back to old ENUM
    await queryInterface.sequelize.query(`
      ALTER TABLE companies
        ALTER COLUMN plan TYPE "enum_companies_plan"
          USING plan::"enum_companies_plan";
    `);

    // 6. Restore old default
    await queryInterface.sequelize.query(`
      ALTER TABLE companies
        ALTER COLUMN plan SET DEFAULT 'unisucursal';
    `);
  },
};
