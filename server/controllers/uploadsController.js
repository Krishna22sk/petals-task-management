export const uploadFile = (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Bad Request', message: 'No file uploaded' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    res.status(201).json({
      message: 'File uploaded successfully',
      fileName: req.file.originalname,
      fileUrl,
      size: req.file.size,
      mimeType: req.file.mimetype,
    });
  } catch (error) {
    next(error);
  }
};
