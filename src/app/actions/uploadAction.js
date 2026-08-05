export async function uploadFileAction(formData) {
  try {
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
