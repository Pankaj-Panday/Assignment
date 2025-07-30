export {};

declare global {
  interface ArtWork {
    id: number;
    title: string;
    place_of_origin: string;
    artist_display: string;
    inscriptions: string | null;
    date_start: number;
    date_end: number;
  }
}