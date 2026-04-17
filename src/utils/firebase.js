const admin = require('firebase-admin');
const path  = require('path');
const fs    = require('fs');

if (!admin.apps.length) {
  let credential;

  const saPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
    ? path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
    : path.resolve(__dirname, '../../firebase-service-account.json');

  if (fs.existsSync(saPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(saPath, 'utf8'));
    credential = admin.credential.cert(serviceAccount);
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(
      Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, 'base64').toString('utf8')
    );
    credential = admin.credential.cert(serviceAccount);
  } else {
    throw new Error(
      'Firebase: coloca el service account JSON en firebase-service-account.json ' +
      'o define FIREBASE_SERVICE_ACCOUNT_PATH en el .env'
    );
  }

  admin.initializeApp({
    credential,
    storageBucket: process.env.FIREBASE_STORAGE,
  });
}

const storage = admin.storage();

module.exports = { admin, storage };
