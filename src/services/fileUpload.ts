import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebaseConfig';

export type FileType = 'image' | 'audio';

interface UploadOptions {
  userId: string;
  fileType: FileType;
  context: 'profile' | 'tour' | 'stop' | 'page' | 'menu' | 'header' | 'city';
  contextId?: string; // tourId or stopId or pageId or menuId or cityId when applicable
  maxSizeMB?: number;
  allowedTypes?: Record<FileType, string[]>;
}

const DEFAULT_OPTIONS = {
  maxSizeMB: 10, // Default max file size
  allowedTypes: {
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3']
  } as Record<FileType, string[]>
};

export class FileUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FileUploadError';
  }
}

export const validateFile = (file: File, options: UploadOptions): void => {
  // Check file size
  const maxSize = (options.maxSizeMB || DEFAULT_OPTIONS.maxSizeMB) * 1024 * 1024;
  if (file.size > maxSize) {
    throw new FileUploadError(`File size must be less than ${options.maxSizeMB}MB`);
  }

  // Check file type
  const allowedTypes = (options.allowedTypes || DEFAULT_OPTIONS.allowedTypes)[options.fileType];
  if (!allowedTypes.includes(file.type)) {
    throw new FileUploadError(`File type ${file.type} is not supported. Allowed types: ${allowedTypes.join(', ')}`);
  }
};

export const generateStoragePath = (options: UploadOptions, fileName: string): string => {
  const paths = [options.fileType + 's']; // 'images' or 'audios' folder

  switch (options.context) {
    case 'profile':
      paths.push('profiles', options.userId);
      break;
    case 'tour':
      paths.push('tours', options.contextId || 'misc');
      break;
    case 'stop':
      const [tourId, stopId] = (options.contextId || '').split('/');
      paths.push('tours', tourId, 'stops', stopId);
      break;
    case 'page':
      paths.push('pages', options.contextId || 'misc');
      break;
    case 'menu':
      paths.push('menus', options.contextId || 'misc');
      break;
    case 'header':
      paths.push('headers', options.contextId || 'misc');
      break;
    case 'city':
      paths.push('cities', options.contextId || 'misc');
      break;
  }

  // Add timestamp to ensure unique filenames
  const timestamp = Date.now();
  const safeFileName = fileName.replace(/[^a-zA-Z0-9.]/g, '_');
  paths.push(`${timestamp}_${safeFileName}`);

  return paths.join('/');
};

export const uploadFile = async (
  file: File,
  options: UploadOptions
): Promise<{ url: string; path: string }> => {
  try {
    // Validate file
    validateFile(file, options);

    // Generate storage path
    const storagePath = generateStoragePath(options, file.name);
    const storageRef = ref(storage, storagePath);

    // Upload file
    const snapshot = await uploadBytes(storageRef, file);
    const url = await getDownloadURL(snapshot.ref);

    return {
      url,
      path: storagePath
    };
  } catch (error) {
    if (error instanceof FileUploadError) {
      throw error;
    }
    console.error('File upload error:', error);
    throw new FileUploadError('Failed to upload file. Please try again.');
  }
};

export const deleteFile = async (path: string): Promise<void> => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('File deletion error:', error);
    throw new FileUploadError('Failed to delete file. Please try again.');
  }
};

// Helper function to format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}; 