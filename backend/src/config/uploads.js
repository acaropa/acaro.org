const path = require('path');

const applicationRoot = path.resolve(__dirname, '..', '..');
const isHostingerNodeDirectory = path.basename(applicationRoot).toLowerCase() === 'nodejs';
const defaultUploadRoot = isHostingerNodeDirectory
  ? path.resolve(applicationRoot, '..', 'uploads')
  : path.join(applicationRoot, 'uploads');

const uploadRoot = path.resolve(process.env.UPLOAD_ROOT || defaultUploadRoot);

module.exports = { uploadRoot };
