import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useApiStruct } from '../context/ApiStructContext';
import { fetchTableData } from '../services/dataTableService';
import type { SortMode } from '../services/dataTableService';
import type { DataColumn, Column, DataTableProps } from '../types/typeGenericDataTable';

//  ICONS 
const ChevronUp = React.memo((props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none"
        viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path d="m18 15-6-6-6 6" />
    </svg>
));

const ChevronDown = React.memo((props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none"
        viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path d="m6 9 6 6 6-6" />
    </svg>
));

const SearchIcon = React.memo((props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none"
        viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
    </svg>
));

//  HELPERS 
const getNestedValue = (obj: any, path?: string): any =>
    path ? path.split('.').reduce((acc, key) => acc?.[key], obj) : undefined;

const parseApiResponse = (columns: Column[], apiResponse: any): any[] => {
    if (!apiResponse) return [];

    let dataSource: any[] = Array.isArray(apiResponse) ? apiResponse : [];

    if (!dataSource.length && typeof apiResponse === "object") {
        const possibleArrayKeys = Object.keys(apiResponse).filter(k => Array.isArray(apiResponse[k]));
        const key = possibleArrayKeys.includes("data") ? "data" : possibleArrayKeys[0];
        dataSource = apiResponse[key] || apiResponse.products || [apiResponse];
    }

    return dataSource.map(item =>
        Object.fromEntries(
            columns.map(col => [
                col.title,
                col.serial ? null : getNestedValue(item, (col as DataColumn).dataIndex),
            ])
        )
    );
};

const getClassName = (defaults: string, replace?: string, extend?: string) =>
    replace || (extend ? `${defaults} ${extend}` : defaults);

//  PAGINATION 
const PaginationControls = React.memo(({ page, totalPages, onPageChange }: {
    page: number;
    totalPages: number;
    onPageChange: (newPage: number) => void;
}) => (
    <div className="mt-4 flex items-center justify-center gap-3 text-sm">
        <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 font-semibold text-white shadow-elevated transition-colors hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-60">
            Previous
        </button>
        <span className="text-secondary">
            Page {page} of {totalPages}
        </span>
        <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 font-semibold text-white shadow-elevated transition-colors hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-60">
            Next
        </button>
    </div>
));

//  MAIN COMPONENT 
const GenericDataTable = ({
    api,
    pagination,
    serial,
    columns,
    searchDebounce = false,
    extendsClasses,
    replaceClasses,
    initialData,
}: DataTableProps) => {

    const { responseStruct } = useApiStruct();
    const totalKey = responseStruct?.total || 'total';
    const [data, setData] = useState<any[]>(() =>
        initialData ? parseApiResponse(columns, initialData) : []
    );
    const [loading, setLoading] = useState(!initialData);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [totalItems, setTotalItems] = useState(initialData?.[totalKey] || 0);
    const [sortKey, setSortKey] = useState<string | null>(api?.data?.sortBy || null);
    const [sortMode, setSortMode] = useState<SortMode>(api?.data?.sortOrder || null);
    const [searchTerm, setSearchTerm] = useState(api?.data?.search ?? '');
    const [debouncedSearch, setDebouncedSearch] = useState(api?.data?.search ?? '');
    const [rowsPerPage, setRowsPerPage] = useState(api?.data?.limit ?? 10);
    const skipInitialFetchRef = useRef(Boolean(initialData));
    const totalPages = useMemo(() => {
        const effectiveTotal = Math.max((totalItems ?? 0) - (api?.data?.skip ?? 0), 0);
        return Math.max(Math.ceil(effectiveTotal / rowsPerPage), 1);
    }, [totalItems, rowsPerPage, api?.data?.skip]);
    const startIndex = useMemo(() => ((page - 1) * rowsPerPage), [page, rowsPerPage, api?.data?.skip]);

    //  FETCH DATA 
    const fetchData = useCallback(async () => {
        if (!api.url) return;
        setLoading(true);
        setError('');

        try {
            const { data: tableData, total } = await fetchTableData({
                api,
                page,
                rowsPerPage,
                sortKey,
                sortMode,
                debouncedSearch,
                columns,
                responseStruct,
            });

            setData(tableData);
            setTotalItems(total);
        } catch (err: any) {
            setError(err.message || "Failed to fetch data");
        } finally {
            setLoading(false);
        }
    }, [api, columns, page, rowsPerPage, sortKey, sortMode, debouncedSearch, responseStruct, totalKey]);


    //  EFFECTS 
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedSearch(searchTerm), typeof searchDebounce === "number" ? searchDebounce : 500);
        return () => clearTimeout(handler);
    }, [searchTerm, searchDebounce]);

    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, rowsPerPage]);

    useEffect(() => {
        if (!initialData) return;
        setData(parseApiResponse(columns, initialData));
        setTotalItems(initialData[totalKey] || 0);
        setLoading(false);
        skipInitialFetchRef.current = true;
    }, [initialData, columns, totalKey]);

    useEffect(() => {
        if (!api?.url) return;

        if (skipInitialFetchRef.current) {
            skipInitialFetchRef.current = false;
            return;
        }

        fetchData();
    }, [fetchData, api?.url, initialData]);

    //  HANDLERS 
    const handleSortClick = useCallback((key: string) => {
        const newMode: SortMode =
            sortKey === key ? (sortMode === 'asc' ? 'desc' : sortMode === 'desc' ? 'original' : 'asc') : 'asc';
        setSortKey(newMode === 'original' ? null : key);
        setSortMode(newMode === 'original' ? null : newMode);
        setPage(1);
    }, [sortKey, sortMode]);

    //  CLASSES 
    const classes = useMemo(() => ({
        thead: getClassName("sticky top-0 z-10 border-b border-subtle/80 bg-muted text-secondary backdrop-blur", replaceClasses?.theadClasses, extendsClasses?.theadClasses),
        th: getClassName("px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-secondary", replaceClasses?.thClasses, extendsClasses?.thClasses),
        tbody: getClassName("bg-layer text-primary", replaceClasses?.tbodyClasses, extendsClasses?.tbodyClasses),
        td: getClassName("px-4 py-3 text-sm text-primary align-middle", replaceClasses?.tdClasses, extendsClasses?.tdClasses),
        rowOdd: getClassName("bg-layer border-b border-subtle/80 last:border-b-0 transition-colors hover:bg-muted/80", replaceClasses?.rowOddClasses, extendsClasses?.rowOddClasses),
        rowEven: getClassName("bg-surface border-b border-subtle/80 last:border-b-0 transition-colors hover:bg-muted/80", replaceClasses?.rowEvenClasses, extendsClasses?.rowEvenClasses),
        searchInput: getClassName("w-full rounded-xl border border-subtle bg-layer pl-11 pr-4 py-2 text-sm text-primary placeholder:text-secondary/70 shadow-soft/20 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent", replaceClasses?.searchInputClasses, extendsClasses?.searchInputClasses),
        searchContainer: getClassName("w-full flex justify-center mb-6", replaceClasses?.searchContainerClasses, extendsClasses?.searchContainerClasses),
    }), [replaceClasses, extendsClasses]);

    //  RENDER 
    if (error) return (
        <div className="rounded-3xl border border-red-400/40 bg-red-500/10 p-6 text-center text-sm text-red-100">
            {error}
        </div>
    );

    return (
        <div className="rounded-2xl border border-strong bg-glass p-5 shadow-soft transition-colors">
            {(searchDebounce || rowsPerPage < totalItems) && (
                <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    {searchDebounce && (
                        <div className={`${classes.searchContainer} md:w-64`}>
                            <div className="relative w-full">
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className={classes.searchInput}
                                />
                                <SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-secondary/70" />
                            </div>
                        </div>
                    )}

                    <select
                        value={rowsPerPage}
                        onChange={e => setRowsPerPage(Number(e.target.value))}
                        className="w-full rounded-xl border border-subtle bg-layer px-3 py-2 text-sm text-primary shadow-soft/20 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent md:w-32"
                    >
                        {[api?.data?.limit, api?.data?.limit !== 10? 10: null, 25, 50, 100]
                            .filter((rpp): rpp is number => rpp !== null && rpp !== undefined)
                            .map(rpp => (
                            <option key={rpp} value={rpp}>{rpp}</option>
                        ))}
                    </select>

                    {(rowsPerPage < totalItems || pagination)&& (
                        <PaginationControls
                            page={page}
                            totalPages={totalPages}
                            onPageChange={newPage => setPage(Math.min(Math.max(1, newPage), totalPages))}
                        />
                    )}
                </div>
            )}

            <div className="min-h-[400px] overflow-hidden rounded-xl border border-strong bg-layer">
                <table className="min-w-full table-fixed">
                    <thead className={classes.thead}>
                        <tr>
                            {/* Serial column outside columns map */}
                            {serial && (
                                <th className={classes.th} style={{ width: "60px" }}>
                                    #
                                </th>
                            )}

                            {/* Dynamic columns */}
                            {columns.map((col, idx) => {
                                const isSorted = sortKey === col.dataIndex;
                                const sortIcon = isSorted
                                    ? sortMode === "asc"
                                        ? <ChevronUp className="h-4 w-4 text-primary" />
                                        : <ChevronDown className="h-4 w-4 text-primary" />
                                    : <ChevronUp className="h-4 w-4 text-secondary/50" />;

                                return (
                                    <th key={idx} className={classes.th}>
                                        {col.sort && col.dataIndex ? (
                                            <button
                                                onClick={() => handleSortClick(col.dataIndex!)}
                                                className="flex w-full items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-muted"
                                            >
                                                <span>{col.title}</span>
                                                <span className={`ml-2 ${isSorted ? "text-primary" : "text-secondary/70"}`}>
                                                    {sortIcon}
                                                </span>
                                            </button>
                                        ) : (
                                            <span>{col.title}</span>
                                        )}
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>

                    <tbody className={classes.tbody}>
                        {loading ? (
                            Array.from({ length: rowsPerPage }).map((_, i) => (
                                <tr key={`loading-${i}`} className={classes.rowEven}>
                                    {/* Serial column placeholder */}
                                    {serial && (
                                        <td className={`${classes.td} animate-pulse`}>
                                            <div className="mx-auto h-4 w-1/2 rounded bg-muted" />
                                        </td>
                                    )}
                                    {columns.map((_, j) => (
                                        <td key={j} className={`${classes.td} animate-pulse`}>
                                            <div className="mx-auto h-4 w-3/4 rounded bg-muted" />
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : data.length > 0 ? (
                            data.map((row, i) => {
                                const rowClass = (startIndex + i) % 2 === 0 ? classes.rowEven : classes.rowOdd;
                                const serialNumber = startIndex + i + 1;

                                return (
                                    <tr key={startIndex + i} className={rowClass}>
                                        {/* Serial column */}
                                        {serial && (
                                            <td className={classes.td}>{serialNumber}</td>
                                        )}

                                        {/* Dynamic columns */}
                                        {columns.map((col, j) => {
                                            const value = row[col.title] ?? "-";
                                            return (
                                                <td key={j} className={classes.td}>
                                                    {col.render ? col.render(value, row, startIndex + j) : value}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td
                                    colSpan={columns.length + (serial ? 1 : 0)}
                                    className="py-6 text-center text-secondary"
                                >
                                    No data found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

        </div>
    );
};

export default React.memo(GenericDataTable);
