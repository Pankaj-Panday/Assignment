export function filterArtworkData(data): ArtWork[] {
  return data.map((item) => {
    return {
      id: item.id,
      title: item.title,
      place_of_origin: item.place_of_origin,
      artist_display: item.artist_display,
      inscriptions: item.inscriptions ?? null,
      date_start: item.date_start,
      date_end: item.date_end,
    };
  });
}
