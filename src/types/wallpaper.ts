export interface WallpaperThumbs {
  large: string;
  original: string;
  small: string;
}

export interface Wallpaper {
  id: string;
  url: string;
  short_url: string;
  views: number;
  favorites: number;
  source: string;
  purity: 'sfw' | 'sketchy' | 'nsfw';
  category: string;
  dimension_x: number;
  dimension_y: number;
  resolution: string;
  ratio: string;
  file_size: number;
  file_type: string;
  created_at: string;
  colors: string[];
  path: string; // Full-size image path
  thumbs: WallpaperThumbs; // large, original, small
  savedAt?: number;
}

export interface WallhavenMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  query: string | null;
  seed: string | null;
}

export interface WallhavenResponse {
  data: Wallpaper[];
  meta: WallhavenMeta;
}
