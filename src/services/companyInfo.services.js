const db = require('../database/models/index');

class companyInfoServices {
  /**
   * Validate whether a subdomain corresponds to an existing, active company.
   * Returns { valid, reason, name } — reason is one of:
   *   'ok' | 'not_found' | 'suspended' | 'canceled'
   */
  static async validateSubdomain(subdomain) {
    const company = await db.Company.findOne({
      where: { subdomain: subdomain.toLowerCase() },
      attributes: ['id', 'name', 'status'],
    });

    if (!company) return { valid: false, reason: 'not_found' };
    if (company.status === 'suspended') return { valid: false, reason: 'suspended', name: company.name };
    if (company.status === 'canceled')  return { valid: false, reason: 'canceled',  name: company.name };

    return { valid: true, reason: 'ok', name: company.name };
  }


  static async getCompanyInfo() {
    try {
      const info = await db.CompanyInfo.findOne();
      return info;
    } catch (error) {
      throw error;
    }
  }

  static async updateCompanyInfo(data) {
    try {
      const info = await db.CompanyInfo.findOne();
      if (info) {
        await info.update(data);
        return info;
      }
      const newInfo = await db.CompanyInfo.create(data);
      return newInfo;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = companyInfoServices;
