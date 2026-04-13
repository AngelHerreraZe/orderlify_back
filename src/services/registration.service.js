'use strict';
const crypto = require('crypto');
const db = require('../database/models/index');
const { sendWelcomeEmail } = require('../utils/email.service');

const ALPHANUM = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

/**
 * Generates a random 10-character alphanumeric password.
 */
function generatePassword() {
  const bytes = crypto.randomBytes(10);
  let pass = '';
  for (let i = 0; i < 10; i++) {
    pass += ALPHANUM[bytes[i] % ALPHANUM.length];
  }
  return pass;
}

/**
 * Registers a new company with its admin user in a single transaction.
 *
 * Steps:
 *  1. Validate subdomain uniqueness
 *  2. Create the Company record
 *  3. Create the admin User (random 10-char password)
 *  4. Resolve the Admin role (create if it doesn't exist yet in the tenant DB)
 *  5. Assign UsersRoles { userId, roleId, isPrimary: true }
 *  6. Send welcome email with credentials
 *
 * @param {Object} data
 * @param {string}  data.name
 * @param {string}  [data.legalName]
 * @param {string}  [data.phone]
 * @param {string}  data.email       Contact / admin email
 * @param {string}  [data.address]
 * @param {string}  data.subdomain
 * @param {string}  data.plan        'uniestacion' | 'unisucursal' | 'multisucursal'
 */
async function registerCompany(data) {
  const { name, legalName, phone, email, address, subdomain, plan } = data;

  // 1. Check subdomain uniqueness
  const existing = await db.Company.findOne({ where: { subdomain: subdomain.toLowerCase() } });
  if (existing) {
    const err = new Error('El subdominio ya está en uso. Elige otro.');
    err.status = 409;
    throw err;
  }

  // Generate credentials before the transaction
  const rawPassword = generatePassword();
  const adminUsername = `admin.${subdomain.toLowerCase()}`;

  // Check username uniqueness (very unlikely to collide, but let's be safe)
  const existingUser = await db.User.findOne({ where: { username: adminUsername } });
  if (existingUser) {
    const err = new Error('Ya existe un administrador con ese subdominio.');
    err.status = 409;
    throw err;
  }

  const t = await db.sequelize.transaction();

  try {
    // 2. Create company
    const company = await db.Company.create(
      {
        name,
        legalName: legalName || null,
        phone: phone || null,
        email,
        address: address || null,
        subdomain: subdomain.toLowerCase(),
        plan: plan || 'unisucursal',
        active: true,
        status: 'active',
      },
      { transaction: t },
    );

    // 3. Create admin user — password is hashed via the User beforeCreate hook
    const adminUser = await db.User.create(
      {
        username: adminUsername,
        password: rawPassword,
        name: 'Administrador',
        lastname: name,
        companyId: company.id,
        passwordChanged: false,
        active: true,
      },
      { transaction: t },
    );

    // 4. Resolve Admin role (find or create within the transaction)
    const [adminRole] = await db.Roles.findOrCreate({
      where: { name: 'Admin' },
      defaults: { name: 'Admin' },
      transaction: t,
    });

    // 5. Assign Admin role as primary
    await db.UsersRoles.create(
      {
        userId: adminUser.id,
        roleId: adminRole.id,
        isPrimary: true,
      },
      { transaction: t },
    );

    await t.commit();

    // 6. Send email (outside transaction — not a DB operation)
    try {
      await sendWelcomeEmail({
        to: email,
        companyName: name,
        subdomain: subdomain.toLowerCase(),
        username: adminUsername,
        password: rawPassword,
      });
    } catch (mailErr) {
      // Log but don't fail the registration if email sending fails
      console.error('[registration] Email send failed:', mailErr.message);
    }

    return {
      companyId: company.id,
      subdomain: company.subdomain,
      username: adminUsername,
    };
  } catch (err) {
    await t.rollback();
    throw err;
  }
}

module.exports = { registerCompany };
