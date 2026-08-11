import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const forbiddenExts = ['.exe', '.bat', '.sh', '.php', '.js', '.py', '.html', '.cmd', '.vbs', '.msi', '.ps1', '.jar', '.com'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (forbiddenExts.includes(ext)) {
    return cb(new Error('Security Error: Executable and script uploads are strictly forbidden.'), false);
  }

  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip',
    'application/x-zip-compressed',
    'text/csv',
    'text/plain',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only Images, PDF, Excel, and ZIP files are allowed.'), false);
  }
};

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB limit

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
});
