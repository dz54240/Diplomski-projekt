import type { EncodedImage } from '../src/types/grading';

export function parseJSONResponse<T>(text: string): T {
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
  }
  return JSON.parse(cleaned);
}

export function prepareImagesForAPI(images: EncodedImage[]): Array<{
  type: 'image_url';
  image_url: { url: string; detail: 'high' };
}> {
  return images.map(img => ({
    type: 'image_url' as const,
    image_url: {
      url: img.base64,
      detail: 'high' as const
    }
  }));
}

