const path = require('path');
const os   = require('os');

const applicationRoot = path.resolve(__dirname, '..', '..');

// En producción usamos el home del usuario del proceso (/home/u123456)
// para que la carpeta uploads quede fuera del directorio de la app y
// sobreviva los redeploys. En desarrollo va dentro del proyecto.
const defaultUploadRoot = process.env.NODE_ENV === 'production'
  ? path.join(os.homedir(), 'uploads')
  : path.join(applicationRoot, 'uploads');

const uploadRoot = path.resolve(process.env.UPLOAD_ROOT || defaultUploadRoot);

module.exports = { uploadRoot };
