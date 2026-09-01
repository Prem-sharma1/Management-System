import { compressImageIfNeeded } from '@/lib/imageCompressor';

/**
 * Enhanced file upload action with:
 * 1. Automatic client-side image compression
 * 2. Real-time progress callback support
 */
export async function uploadFileAction(formData, onProgress = null) {
  try {
    // 1. Check if the FormData contains an image file that can be compressed
    const file = formData.get('file');
    if (file && typeof window !== 'undefined') {
      const optimizedFile = await compressImageIfNeeded(file);
      if (optimizedFile !== file) {
        formData.set('file', optimizedFile);
      }
    }

    // 2. If progress tracking is requested, use XMLHttpRequest
    if (typeof window !== 'undefined' && typeof onProgress === 'function') {
      return new Promise((resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/upload', true);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            onProgress(percentComplete);
          }
        };

        xhr.onload = () => {
          try {
            const data = JSON.parse(xhr.responseText);
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve({ success: true, fileUrl: data.fileUrl });
            } else {
              resolve({ error: data.error || 'Failed to upload file' });
            }
          } catch (e) {
            resolve({ error: 'Invalid response from server' });
          }
        };

        xhr.onerror = () => {
          resolve({ error: 'Network error occurred during upload' });
        };

        xhr.send(formData);
      });
    }

    // 3. Fallback standard fetch upload
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      return { error: data.error || 'Failed to upload file' };
    }
    
    return { success: true, fileUrl: data.fileUrl };
  } catch (error) {
    console.error('Client Upload Error:', error);
    return { error: `Connection failed: ${error.message}` };
  }
}
