const imageCache = new Map<string, HTMLImageElement>();

export const getCachedImage = (path: string): HTMLImageElement => {
  const cached = imageCache.get(path);
  if (cached) {
    return cached;
  }

  const image = new Image();
  image.src = path;
  imageCache.set(path, image);
  return image;
};
