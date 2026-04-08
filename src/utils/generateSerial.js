'use strict';
const crypto = require('crypto');

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

/**
 * Generates one block of 8 random alphanumeric characters.
 */
function randomBlock() {
  const bytes = crypto.randomBytes(8);
  let block = '';
  for (let i = 0; i < 8; i++) {
    block += CHARS[bytes[i] % CHARS.length];
  }
  return block;
}

/**
 * Generates a serial of 32 alphanumeric characters in 4 blocks of 8, separated by dashes.
 * Format: XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX
 */
function generateSerial() {
  return [randomBlock(), randomBlock(), randomBlock(), randomBlock()].join('-');
}

/**
 * Generates a unique serial by checking against the database.
 * @param {import('sequelize').Model} CompanyModel
 */
async function generateUniqueSerial(CompanyModel) {
  let serial;
  let exists = true;
  let attempts = 0;

  while (exists && attempts < 10) {
    serial = generateSerial();
    exists = !!(await CompanyModel.findOne({ where: { serial } }));
    attempts++;
  }

  if (exists) {
    throw new Error('Could not generate a unique serial after 10 attempts');
  }

  return serial;
}

module.exports = { generateSerial, generateUniqueSerial };
