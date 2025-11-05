export type ApiStruct = {
    dataSrc?: string;
    limit?: string;
    skip?: string;
    total?: string;
    sortBy?: string;
    sortOrder?: string;
    searchRoute?: string;
    searchParam?: string;
};

export type ApiStructContextType = {
    responseStruct: ApiStruct;
    setApiStruct: React.Dispatch<React.SetStateAction<ApiStruct>>;
};
