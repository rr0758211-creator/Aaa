import { CapacitorHttp } from '@capacitor/core';
import { Wallpaper, WallhavenResponse } from '../types/wallpaper';

const BASE_QUERY = '+"anime boys" -"anime girls"';

export async function fetchWallpapersFromApi(
  page: number = 1,
  query: string = ''
): Promise<WallhavenResponse> {
  const keyword = query.trim();
  const fullQuery = keyword ? `${BASE_QUERY} ${keyword}` : BASE_QUERY;

  const params: Record<string, string> = {
    categories: '010',
    purity: '100',
    ratios: 'portrait',
    q: fullQuery,
    page: page.toString(),
  };
  if (!keyword) {
    params.sorting = 'favorites';
  }

  const response = await CapacitorHttp.get({
    url: 'https://wallhaven.cc/api/v1/search',
    params,
    headers: { Accept: 'application/json' },
  });

  if (response.status < 200 || response.status >= 300) {
    throw new Error(`Wallhaven error: HTTP ${response.status}`);
  }

  let data: any = response.data;
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch {
      throw new Error('Wallhaven se galat jawab aaya, dobara try karo.');
    }
  }

  return data as WallhavenResponse;
}

export async function downloadWallpaperFile(wallpaper: Wallpaper): Promise<void> {
  // Android pe seedha image ko browser mein kholo, wahan se download/save ho jayegi
  window.open(wallpaper.path, '_blank');
}
