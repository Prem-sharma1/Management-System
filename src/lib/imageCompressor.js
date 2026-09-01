/**
 * Client-Side Image Compressor Utility
 * Automatically shrinks heavy camera images (5MB - 15MB) to crisp WebP/JPEG files (< 600KB)
 * in milliseconds before network transfer.
 */
export async function compressImageIfNeeded(file, maxDimension = 2048, quality = 0.85) {
  // If not an image or running on server, return original file
  if (typeof window === 'undefined' || !file || !file.type || !file.type.startsWith('image/')) {
    return file;
  }

  // Skip SVG or GIF animations to prevent losing animation frames
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        let { width, height } = img;

        // Calculate scaling if exceeding max dimensions
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file); // Fallback to original if canvas fails
          return;
        }

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to optimized JPEG/WebP
        const outputFormat = file.type === 'image/png' ? 'image/jpeg' : file.type;
        
        canvas.toBlob(
          (blob) => {
            if (!blob || blob.size >= file.size) {
              // If compressed is somehow larger than original, keep original
              resolve(file);
              return;
            }

            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
              type: outputFormat,
              lastModified: Date.now()
            });

            console.log(
              `[ImageCompressor] Compressed ${file.name}: ${(file.size / 1024 / 1024).toFixed(2)}MB -> ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`
            );

            resolve(compressedFile);
          },
          outputFormat,
          quality
        );
      };

      img.onerror = () => resolve(file);
      img.src = e.target.result;
    };

    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}
