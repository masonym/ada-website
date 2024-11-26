export const getCdnPath = (path: string): string => {
    if (!path) return '';
    
    // Remove leading slash if present to avoid double slashes
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    
    // Handle cases where the path might already include the CDN domain
    if (cleanPath.startsWith(process.env.NEXT_PUBLIC_CDN_DOMAIN || '')) {
      return cleanPath;
    }
  
    return `${process.env.NEXT_PUBLIC_CDN_DOMAIN}/${cleanPath}`;
  };