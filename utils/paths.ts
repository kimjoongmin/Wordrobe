/**
 * Prepends the GitHub Pages basePath to the asset path.
 * In Next.js, absolute paths (/assets/...) don't automatically include the basePath for img tags.
 */
export const getAssetPath = (path: string): string => {
  // Always prepend /Wordrobe if we are in production-like environment or if explicitly set
  // This is a safer default for the user's current GitHub Pages deployment.
  const basePath = "/Wordrobe";

  // If we're running locally (localhost) or in the app (file://), we might not want the prefix.
  // But since the user specifically mentioned Wordrobe/ path issue on the web,
  // we'll implement a check or just prioritize the prefix for web.

  const isWeb =
    typeof window !== "undefined" &&
    (window.location.hostname.includes("github.io") ||
      window.location.pathname.startsWith("/Wordrobe"));

  if (isWeb || process.env.NEXT_PUBLIC_GITHUB_PAGES === "true") {
    if (path.startsWith(basePath)) return path;
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${basePath}${cleanPath}`;
  }

  return path;
};
