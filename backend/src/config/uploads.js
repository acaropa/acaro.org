const path = require('path');

const applicationRoot = path.resolve(__dirname, '..', '..');
const appBasename   = path.basename(applicationRoot).toLowerCase();
const parentBasename = path.basename(path.dirname(applicationRoot)).toLowerCase();

// Handles both deploy structures:
//   root=backend  → .../nodejs/          (appBasename === 'nodejs')
//   root=./       → .../nodejs/backend/  (parentBasename === 'nodejs')
const hostingerBase = appBasename === 'nodejs'
  ? applicationRoot
  : parentBasename === 'nodejs'
    ? path.dirname(applicationRoot)
    : null;

const defaultUploadRoot = hostingerBase
  ? path.resolve(hostingerBase, '..', 'uploads')
  : path.join(applicationRoot, 'uploads');

const uploadRoot = path.resolve(process.env.UPLOAD_ROOT || defaultUploadRoot);

module.exports = { uploadRoot };
