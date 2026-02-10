/**
 * Prepends the GitHub Pages basePath to the asset path if the NEXT_PUBLIC_GITHUB_PAGES environment variable is set.
 */
export const getAssetPath = (path: string): string => {
  if (process.env.NEXT_PUBLIC_GITHUB_PAGES === "true") {
    // Prevent double slashing if path already starts with /Wordrobe
    if (path.startsWith("/Wordrobe")) return path;
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `/Wordrobe${cleanPath}`;
  }
  return path;
};
