import { Wallpaper, WallhavenResponse } from '../types/wallpaper';

export async function fetchWallpapersFromApi(
  page: number = 1,
  query: string = ''
): Promise<WallhavenResponse> {
  const url = new URL('/api/wallpapers/search', window.location.origin);
  url.searchParams.set('page', page.toString());
  if (query.trim()) {
    url.searchParams.set('q', query.trim());
  }

  const response = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
    try {
      const errJson = await response.json();
      if (errJson.error) errorMessage = errJson.error;
    } catch {
      // ignore
    }
    throw new Error(errorMessage);
  }

  const data: WallhavenResponse = await response.json();
  return data;
}

export async function downloadWallpaperFile(wallpaper: Wallpaper): Promise<void> {
  const filename = `depth_wallpaper_${wallpaper.id}.jpg`;
  
  // Use our backend proxy to trigger immediate download and bypass any cross-origin restrictions
  const downloadUrl = `/api/wallpapers/download?url=${encodeURIComponent(wallpaper.path)}&filename=${encodeURIComponent(filename)}`;
  
  try {
    const res = await fetch(downloadUrl);
    if (!res.ok) throw new Error('Download failed through proxy');
    
    const blob = await res.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.warn('Fallback direct download for wallpaper:', error);
    // Fallback: open path in new tab or direct anchor
    const a = document.createElement('a');
    a.href = wallpaper.path;
    a.target = '_blank';
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}
