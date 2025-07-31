export function filterArtworkData(data: RawArtWork[]): ArtWork[] {
  return data.map((item) => {
    return {
      id: item.id,
      title: item.title,
      place_of_origin: item.place_of_origin,
      artist_display: item.artist_display,
      inscriptions: item.inscriptions ?? "_",
      date_start: item.date_start,
      date_end: item.date_end,
    };
  });
}

export async function fetchArtWorkData(page: number): Promise<{ totalRecords: number; data: ArtWork[] } | undefined> {
  try {
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const res = await fetch(`${baseUrl}?page=${page}`);
    const { data, pagination } = await res.json();
    return { totalRecords: pagination.total, data: filterArtworkData(data) };
  } catch (error) {
    if (error instanceof Error && error.name !== "AbortError") {
      throw error;
    }
  }
}
