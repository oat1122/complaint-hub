import sharp from "sharp";
import path from "path";

// Allowed file types and their signatures
const FILE_SIGNATURES = {
  "image/jpeg": [
    [0xFF, 0xD8, 0xFF],
  ],
  "image/png": [
    [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]
  ],
  "application/pdf": [
    [0x25, 0x50, 0x44, 0x46]
  ],
  // Word document signatures
  "application/msword": [
    [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1]
  ],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    [0x50, 0x4B, 0x03, 0x04]
  ]
};

export async function validateFileSecurely(file: File): Promise<boolean> {
  const buffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(buffer);
  
  // 1. Validate file extension
  const ext = path.extname(file.name).toLowerCase();
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx'];
  if (!allowedExtensions.includes(ext)) {
    throw new Error(`File extension ${ext} not allowed`);
  }
  
  // 2. Validate declared MIME type
  const declaredMimeType = file.type;
  const allowedTypes = Object.keys(FILE_SIGNATURES);
  if (!allowedTypes.includes(declaredMimeType)) {
    throw new Error('File type not allowed');
  }
  
  // 3. Check file signature (magic numbers)
  const validSignature = checkFileSignature(uint8Array, declaredMimeType);
  if (!validSignature) {
    throw new Error('File signature verification failed');
  }
  
  // 4. Check for malicious patterns in text-based files
  if (declaredMimeType === "application/pdf" || 
      declaredMimeType.includes("document")) {
    const fileContent = new TextDecoder().decode(uint8Array.slice(0, 1024));
    const suspiciousPatterns = [
      /<%[\s\S]*%>/,  // PHP/ASP tags
      /<script/i,     // Script tags
      /javascript:/i  // JavaScript protocol
    ];
    
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(fileContent)) {
        throw new Error('Potentially malicious content detected');
      }
    }
  }
  
  // 5. For images, verify they can be processed by Sharp
  if (declaredMimeType.startsWith('image/')) {
    try {
      const metadata = await sharp(buffer).metadata();
      if (!metadata.width || !metadata.height) {
        throw new Error('Invalid image dimensions');
      }
    } catch (error) {
      throw new Error('Image validation failed');
    }
  }
  
  return true;
}

function checkFileSignature(fileData: Uint8Array, mimeType: string): boolean {
  const signatures = FILE_SIGNATURES[mimeType as keyof typeof FILE_SIGNATURES];
  if (!signatures) return false;
  
  // Check against all possible signatures for this mime type
  return signatures.some(signature => {
    // Check if the file starts with this signature
    for (let i = 0; i < signature.length; i++) {
      if (fileData[i] !== signature[i]) {
        return false;
      }
    }
    return true;
  });
}
