export type AspectRatio = 'original' | '1:1' | '3:1' | '4:1' | '16:9' | '4:3' | '9:16' | 'custom';

export interface ResizeOptions {
  aspectRatio: AspectRatio;
  customAspectRatio?: { width: number; height: number };
  width?: number;
  height?: number;
  percentage?: number;
  maintainAspectRatio: boolean;
  quality: number;
}

export function getAspectRatioValue(ratio: AspectRatio, custom?: { width: number; height: number }): number | null {
  switch (ratio) {
    case '1:1':
      return 1;
    case '3:1':
      return 3;
    case '4:1':
      return 4;
    case '16:9':
      return 16 / 9;
    case '4:3':
      return 4 / 3;
    case '9:16':
      return 9 / 16;
    case 'custom':
      return custom ? custom.width / custom.height : null;
    case 'original':
      return null;
  }
}

export function resizeImage(
  image: HTMLImageElement,
  options: ResizeOptions
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      const originalWidth = image.width;
      const originalHeight = image.height;
      const originalAspectRatio = originalWidth / originalHeight;

      let targetWidth: number;
      let targetHeight: number;

      // Calculate target dimensions
      if (options.percentage) {
        targetWidth = Math.round(originalWidth * (options.percentage / 100));
        targetHeight = Math.round(originalHeight * (options.percentage / 100));
      } else if (options.width && options.height) {
        targetWidth = options.width;
        targetHeight = options.height;
      } else if (options.width) {
        targetWidth = options.width;
        targetHeight = options.maintainAspectRatio
          ? Math.round(targetWidth / originalAspectRatio)
          : originalHeight;
      } else if (options.height) {
        targetHeight = options.height;
        targetWidth = options.maintainAspectRatio
          ? Math.round(targetHeight * originalAspectRatio)
          : originalWidth;
      } else {
        targetWidth = originalWidth;
        targetHeight = originalHeight;
      }

      // Apply aspect ratio if specified
      const targetAspectRatio = getAspectRatioValue(options.aspectRatio, options.customAspectRatio);
      if (targetAspectRatio !== null && options.aspectRatio !== 'original') {
        const currentAspectRatio = targetWidth / targetHeight;
        
        if (currentAspectRatio > targetAspectRatio) {
          // Image is wider than target - crop width
          targetWidth = Math.round(targetHeight * targetAspectRatio);
        } else {
          // Image is taller than target - crop height
          targetHeight = Math.round(targetWidth / targetAspectRatio);
        }
      }

      // Set canvas size
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      // Smart cropping: center the image
      const sourceAspectRatio = originalWidth / originalHeight;
      const targetAspectRatioFinal = targetWidth / targetHeight;

      let sourceX = 0;
      let sourceY = 0;
      let sourceWidth = originalWidth;
      let sourceHeight = originalHeight;

      if (sourceAspectRatio > targetAspectRatioFinal) {
        // Source is wider - crop sides
        sourceWidth = Math.round(originalHeight * targetAspectRatioFinal);
        sourceX = Math.round((originalWidth - sourceWidth) / 2);
      } else if (sourceAspectRatio < targetAspectRatioFinal) {
        // Source is taller - crop top/bottom
        sourceHeight = Math.round(originalWidth / targetAspectRatioFinal);
        sourceY = Math.round((originalHeight - sourceHeight) / 2);
      }

      // Draw image with smart cropping
      ctx.drawImage(
        image,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        targetWidth,
        targetHeight
      );

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        'image/png',
        options.quality
      );
    } catch (error) {
      reject(error);
    }
  });
}

