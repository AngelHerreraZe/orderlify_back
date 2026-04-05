const db = require('../database/models/index');

class companyInfoServices {
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
