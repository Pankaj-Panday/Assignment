import { DataTable, type DataTablePageEvent } from "primereact/datatable";
import { Column } from "primereact/column";
import { useEffect, useState } from "react";
import { filterArtworkData } from "./utils/utils";

export const ArtWorksTable = () => {
  const [artWorkData, setArtWorkData] = useState<ArtWork[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const fetchArtworkData = async () => {
      setLoading(true);
      setErrorMsg(null);

      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      const params = new URLSearchParams({
        page: page?.toString() ?? "1",
      });
      const apiUrl = baseUrl + "?" + params;

      try {
        const res = await fetch(apiUrl, { signal: controller.signal });
        if (res.ok) {
          const { data, pagination } = await res.json();
          setArtWorkData(filterArtworkData(data));
          setTotalRecords(pagination.total);
        }
      } catch (error) {
        if (error instanceof Error) {
          if (error.name !== "AbortError") {
            setErrorMsg(error.message || "Something went wrong");
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchArtworkData();

    return () => {
      // abort the previous api call
      controller.abort();
    };
  }, [page]);

  const onPage = (event: DataTablePageEvent) => {
    const pageToFetch = (event.page ?? 0) + 1;
    setPage(pageToFetch);
  };

  if (errorMsg)
    return (
      <div className="error">
        <h2>Error</h2>
        <p>{errorMsg}</p>
      </div>
    );

  if (artWorkData.length === 0 && !loading) return null;

  return (
    <DataTable
      value={artWorkData}
      first={(page - 1) * 12}
      dataKey="id"
      paginator
      totalRecords={totalRecords}
      onPage={onPage}
      loading={loading}
      tableStyle={{ minWidth: "50rem" }}
      rows={12}
      pageLinkSize={5}
      lazy
    >
      <Column selectionMode="multiple"></Column>
      <Column field="title" header="Title"></Column>
      <Column field="place_of_origin" header="Place of origin"></Column>
      <Column field="artist_display" header="Artist Display"></Column>
      <Column field="inscriptions" header="Inscriptions"></Column>
      <Column field="date_start" header="Start Date"></Column>
      <Column field="date_end" header="End Date"></Column>
    </DataTable>
  );
};
