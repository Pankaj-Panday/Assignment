import { DataTable, type DataTablePageEvent } from "primereact/datatable";
import { Column } from "primereact/column";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { filterArtworkData, modifyPageRowsSelectionMap } from "./utils/utils";
import { OverlayPanel } from "primereact/overlaypanel";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";

export const ArtWorksTable = () => {
  const [artWorkData, setArtWorkData] = useState<ArtWork[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState<number | null>(null);
  const [selectedRows, setSelectedRows] = useState<ArtWork[]>([]);

  const selectedIDs = useRef<Set<number>>(new Set([]));
  const opRef = useRef<OverlayPanel>(null);
  const pageRowsMapping = useRef<Map<number, number>>(new Map());
  const selectCountForCurrentPage = useRef<number>(undefined);

  const rowsPerPage = 12;

  const onPage = async (event: DataTablePageEvent) => {
    const pageToFetch = (event.page ?? 0) + 1;
    setPage(pageToFetch);
  };

  const getIDsToAdd = useCallback((artWorkData: ArtWork[], count: number) => {
    return artWorkData.map((data) => data.id).slice(0, count);
  }, []);

  const selectRowsByIDs = useCallback((fetchedRows: ArtWork[]) => {
    const updatedSelection = fetchedRows.filter((data) => {
      // return the artwork data which is in selectedIDs only
      return selectedIDs.current.has(data.id);
    });
    setSelectedRows(updatedSelection);
  }, []);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputValue) return;

    // add IDS to be selected to selectedIDs
    const idsToAdd = getIDsToAdd(artWorkData, inputValue);
    idsToAdd.forEach((id) => selectedIDs.current.add(id));

    // select rows with given IDs
    selectRowsByIDs(artWorkData);

    if (inputValue > rowsPerPage) {
      // modify the map
      modifyPageRowsSelectionMap(inputValue - 12, page + 1, rowsPerPage, pageRowsMapping.current);
    }

    setInputValue(null);
    opRef.current?.hide();
  };

  // fetch page data
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

  // Get select count from map when page changes
  useEffect(() => {
    selectCountForCurrentPage.current = pageRowsMapping.current.get(page);
    pageRowsMapping.current.delete(page);
  }, [page]);
  
  // add IDs to selectedIds based on select count for current page
  useEffect(() => {
    if (selectCountForCurrentPage.current) {
      const idsToAdd = getIDsToAdd(artWorkData, selectCountForCurrentPage.current);
      idsToAdd.forEach((id) => selectedIDs.current.add(id));
    }
    selectRowsByIDs(artWorkData);
  }, [page, artWorkData, getIDsToAdd, selectRowsByIDs]);

  if (errorMsg) {
    return (
      <div className="error">
        <h2>Error</h2>
        <p>{errorMsg}</p>
      </div>
    );
  }
  if (artWorkData.length === 0 && !loading) return null;

  return (
    <>
      <DataTable
        // metaKeySelection={false}
        selectionMode="multiple"
        value={artWorkData}
        first={(page - 1) * rowsPerPage}
        dataKey="id"
        paginator
        totalRecords={totalRecords}
        onPage={onPage}
        loading={loading}
        tableStyle={{ minWidth: "50rem" }}
        rows={rowsPerPage}
        pageLinkSize={5}
        lazy
        selection={selectedRows}
        onRowSelect={(e) => {
          // push this row ID to selectedIDs
          selectedIDs.current.add(e.data.id);
          selectRowsByIDs(artWorkData);
        }}
        onRowUnselect={(e) => {
          // remove this rowID from selectedIDs
          selectedIDs.current.delete(e.data.id);
          selectRowsByIDs(artWorkData);
        }}
      >
        <Column selectionMode="multiple"></Column>
        <Column header={() => <i className="pi pi-chevron-down" onClick={(e) => opRef.current?.toggle(e)} />}></Column>
        <Column field="title" header="Title"></Column>
        <Column field="place_of_origin" header="Place of origin"></Column>
        <Column field="artist_display" header="Artist Display"></Column>
        <Column field="inscriptions" header="Inscriptions"></Column>
        <Column field="date_start" header="Start Date"></Column>
        <Column field="date_end" header="End Date"></Column>
      </DataTable>
      <OverlayPanel ref={opRef}>
        <form className="inputBox" onSubmit={handleSubmit}>
          <InputNumber
            value={inputValue}
            onChange={(e) => setInputValue(e.value)}
            placeholder="Enter number of rows to select"
          />
          <Button outlined type="submit">
            Submit
          </Button>
        </form>
      </OverlayPanel>
    </>
  );
};
