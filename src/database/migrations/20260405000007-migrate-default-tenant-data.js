'use strict';
/**
 * Data migration — NO DATA LOSS.
 *
 * 1. Creates default Company from company_info (or placeholder).
 * 2. Creates default Branch "Sucursal Principal".
 * 3. Creates default Station "Caja 1".
 * 4. Back-fills company_id / branch_id / station_id on all existing rows.
 * 5. Populates users_branches for every user.
 * 6. Populates branch_products for every product.
 *
 * @type {import('sequelize-cli').Migration}
 */
module.exports = {
  async up(queryInterface) {
    const now = new Date();

    // ─── 1. Seed default company from company_info ────────────────────────────
    const [infoRows] = await queryInterface.sequelize.query(
      'SELECT * FROM company_info ORDER BY id LIMIT 1'
    );
    const info = infoRows[0] || {};

    const [companyResult] = await queryInterface.sequelize.query(`
      INSERT INTO companies (name, legal_name, phone, email, address, slogan, active, plan, "createdAt", "updatedAt")
      VALUES (:name, :legalName, :phone, :email, :address, :slogan, true, 'unisucursal', :now, :now)
      RETURNING id
    `, {
      replacements: {
        name:      info.nombre      || 'Mi Restaurante',
        legalName: info.razon_social || null,
        phone:     info.telefono     || null,
        email:     info.email        || null,
        address:   info.direccion    || null,
        slogan:    info.slogan       || null,
        now,
      },
    });
    const companyId = companyResult[0].id;

    // ─── 2. Seed default branch ───────────────────────────────────────────────
    const [branchResult] = await queryInterface.sequelize.query(`
      INSERT INTO branches (company_id, name, address, phone, active, "createdAt", "updatedAt")
      VALUES (:companyId, 'Sucursal Principal', :address, :phone, true, :now, :now)
      RETURNING id
    `, {
      replacements: {
        companyId,
        address: info.direccion || null,
        phone:   info.telefono  || null,
        now,
      },
    });
    const branchId = branchResult[0].id;

    // ─── 3. Seed default station ──────────────────────────────────────────────
    const [stationResult] = await queryInterface.sequelize.query(`
      INSERT INTO stations (branch_id, name, active, "createdAt", "updatedAt")
      VALUES (:branchId, 'Caja 1', true, :now, :now)
      RETURNING id
    `, { replacements: { branchId, now } });
    const stationId = stationResult[0].id;

    // ─── 4. Back-fill existing rows ───────────────────────────────────────────
    await queryInterface.sequelize.query(
      `UPDATE orders    SET company_id = :companyId, branch_id = :branchId, station_id = :stationId WHERE company_id IS NULL`,
      { replacements: { companyId, branchId, stationId } }
    );
    await queryInterface.sequelize.query(
      `UPDATE "user"    SET company_id = :companyId WHERE company_id IS NULL`,
      { replacements: { companyId } }
    );
    await queryInterface.sequelize.query(
      `UPDATE products  SET company_id = :companyId WHERE company_id IS NULL`,
      { replacements: { companyId } }
    );
    await queryInterface.sequelize.query(
      `UPDATE tables    SET branch_id  = :branchId  WHERE branch_id  IS NULL`,
      { replacements: { branchId } }
    );
    await queryInterface.sequelize.query(
      `UPDATE payments  SET company_id = :companyId, branch_id = :branchId WHERE company_id IS NULL`,
      { replacements: { companyId, branchId } }
    );
    await queryInterface.sequelize.query(
      `UPDATE categories SET company_id = :companyId WHERE company_id IS NULL`,
      { replacements: { companyId } }
    );

    // ─── 5. Populate users_branches ──────────────────────────────────────────
    const [users] = await queryInterface.sequelize.query('SELECT id FROM "user"');
    for (const user of users) {
      await queryInterface.sequelize.query(`
        INSERT INTO users_branches (user_id, branch_id, "createdAt", "updatedAt")
        VALUES (:userId, :branchId, :now, :now)
        ON CONFLICT DO NOTHING
      `, { replacements: { userId: user.id, branchId, now } });
    }

    // ─── 6. Populate branch_products ─────────────────────────────────────────
    const [products] = await queryInterface.sequelize.query('SELECT id FROM products');
    for (const product of products) {
      await queryInterface.sequelize.query(`
        INSERT INTO branch_products (branch_id, product_id, available, "createdAt", "updatedAt")
        VALUES (:branchId, :productId, true, :now, :now)
        ON CONFLICT DO NOTHING
      `, { replacements: { branchId, productId: product.id, now } });
    }
  },

  async down(queryInterface) {
    // Reverse data only — structural columns removed by migration 006 down
    await queryInterface.sequelize.query(`DELETE FROM branch_products`);
    await queryInterface.sequelize.query(`DELETE FROM users_branches`);
    await queryInterface.sequelize.query(`DELETE FROM stations`);
    await queryInterface.sequelize.query(`DELETE FROM branches`);
    await queryInterface.sequelize.query(`DELETE FROM companies`);
  },
};
