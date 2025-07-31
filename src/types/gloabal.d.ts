export {};

declare global {
  interface ArtWork {
    id: number;
    title: string;
    place_of_origin: string;
    artist_display: string;
    inscriptions: string;
    date_start: number;
    date_end: number;
  }

  export type RawArtWork = {
    id: number;
    title: string;
    place_of_origin: string;
    artist_display: string;
    inscriptions?: string | null;
    date_start: number;
    date_end: number;
  };

}