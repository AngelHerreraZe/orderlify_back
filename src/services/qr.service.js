'use strict';

const QRCode = require('qrcode');
const { storage } = require('../utils/firebase');

/**
 * Genera un buffer PNG del QR con la URL de la mesa.
 */
async function generateQRBuffer(url) {
  return QRCode.toBuffer(url, {
    type: 'png',
    width: 512,
    margin: 2,
    color: { dark: '#1a1a2e', light: '#ffffff' },
  });
}

/**
 * Sube el QR a Firebase Storage y devuelve la URL pública firmada.
 * Estructura: /{restaurantSlug}/{branchSlug}/table-{tableNumber}-qr.png
 */
async function uploadQRToFirebase(buffer, restaurantName, branchName, tableNumber) {
  const slug = (s) => String(s).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const storagePath = `${slug(restaurantName)}/${slug(branchName)}/table-${tableNumber}-qr.png`;

  const bucket = storage.bucket();
  const file   = bucket.file(storagePath);

  await file.save(buffer, {
    metadata: { contentType: 'image/png' },
  });

  // Signed URL válida por 7 días (compatible con uniform bucket-level access)
  const [downloadUrl] = await file.getSignedUrl({
    action: 'read',
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
  });

  return { downloadUrl, storagePath };
}

/**
 * Intenta eliminar un archivo de Firebase Storage.
 * Falla silenciosamente si el archivo no existe.
 */
async function deleteQRFromFirebase(storagePath) {
  if (!storagePath) return;
  try {
    const bucket = storage.bucket();
    await bucket.file(storagePath).delete();
  } catch {
    // Objeto no encontrado — ignorar
  }
}

/**
 * Calcula la fecha de expiración del QR.
 * @param {number|null} durationMinutes - null = sin expiración
 * @returns {Date|null}
 */
function calcQRExpiry(durationMinutes) {
  if (!durationMinutes) return null;
  return new Date(Date.now() + durationMinutes * 60 * 1000);
}

module.exports = {
  generateQRBuffer,
  uploadQRToFirebase,
  deleteQRFromFirebase,
  calcQRExpiry,
};
