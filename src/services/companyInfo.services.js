'use strict';
const db = require('../database/models/index');

// Columnas públicas de Company que expone este servicio
const COMPANY_ATTRS = [
  'id', 'name', 'legalName', 'phone', 'email',
  'address', 'logoUrl', 'latitud', 'longitud', 'plan', 'status',
];

class companyInfoServices {
  /**
   * Validate whether a subdomain corresponds to an existing, active company.
   * Returns { valid, reason, name }
   */
  static async validateSubdomain(subdomain) {
    const company = await db.Company.findOne({
      where: { subdomain: subdomain.toLowerCase() },
      attributes: ['id', 'name', 'status'],
    });

    if (!company)                        return { valid: false, reason: 'not_found' };
    if (company.status === 'suspended')  return { valid: false, reason: 'suspended', name: company.name };
    if (company.status === 'canceled')   return { valid: false, reason: 'canceled',  name: company.name };

    return { valid: true, reason: 'ok', name: company.name };
  }

  /**
   * Get company info for a given companyId.
   * Returns null if not found or no companyId provided.
   */
  static async getCompanyInfo(companyId) {
    if (!companyId) return null;
    const company = await db.Company.findByPk(companyId, { attributes: COMPANY_ATTRS });
    return company ?? null;
  }

  /**
   * Partial-update company info fields. Only touches the provided keys.
   */
  static async updateCompanyInfo(companyId, data) {
    if (!companyId) throw new Error('companyId requerido');
    await db.Company.update(data, { where: { id: companyId } });
    return db.Company.findByPk(companyId, { attributes: COMPANY_ATTRS });
  }
}

module.exports = companyInfoServices;
