import type { ApiConfig } from "../services/ApiService";

export type SerialColumn = {
    title: string;
    serial: boolean;
    dataSrc?: never;
    sort?: never;
    dataIndex?: never;
    render?: (value: any, row: any, rowIndex: number) => React.ReactNode;
};

export type DataColumn = {
    title: string;
    serial?: never;
    dataIndex: string;
    dataSrc?: string;
    sort?: boolean;
    render?: (value: any, row: any, rowIndex: number) => React.ReactNode;
};

export type Column = SerialColumn | DataColumn;

export type ClassProps = {
    theadClasses?: string;
    tbodyClasses?: string;
    thClasses?: string;
    tdClasses?: string;
    rowOddClasses?: string;
    rowEvenClasses?: string;
    searchInputClasses?: string;
    searchContainerClasses?: string;
};


export type DataTableProps = {
    api: ApiConfig;
    serial?: boolean;
    columns: Column[];
    pagination?: number | boolean;
    searchDebounce?: number | boolean;
    extendsClasses?: ClassProps;
    replaceClasses?: ClassProps;
    initialData?: any;
};
