import type { ReactNode } from "react";

type Column<T> = {
    header: string;
    accessor: (row: T) => ReactNode;
    width?: string; // 👈 allows custom column sizing
};

type TableProps<T> = {
    columns: Column<T>[];
    data: T[];
    page: number;
    pages: number;
    onPageChange: (page: number) => void;
};

const Table = <T,>({
                       columns,
                       data,
                       page,
                       pages,
                       onPageChange,
                   }: TableProps<T>) => {
    // 🔥 dynamic grid template
    const gridTemplate = columns
        .map((col) => col.width || "1fr")
        .join(" ");

    return (
        <div className="space-y-4">

            {/* TABLE */}
            <div className="bg-white rounded-xl shadow overflow-hidden">

                {/* HEADER */}
                <div
                    className="grid p-4 font-medium text-gray-500 border-b"
                    style={{ gridTemplateColumns: gridTemplate }}
                >
                    {columns.map((col, index) => (
                        <span key={index}>{col.header}</span>
                    ))}
                </div>

                {/* ROWS */}
                <div>
                    {data.map((row, rowIndex) => (
                        <div
                            key={rowIndex}
                            className="grid p-4 border-b items-center hover:bg-gray-50"
                            style={{ gridTemplateColumns: gridTemplate }}
                        >
                            {columns.map((col, colIndex) => (
                                <span key={colIndex} className="truncate">
                                    {col.accessor(row)}
                                </span>
                            ))}
                        </div>
                    ))}
                </div>

            </div>

            {/* PAGINATION */}
            <div className="flex justify-center items-center gap-4">

                <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 1}
                    className="px-4 py-2 border rounded-lg disabled:opacity-50"
                >
                    Prev
                </button>

                <span className="text-sm text-gray-600">
                    Page {page} of {pages}
                </span>

                <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={page === pages}
                    className="px-4 py-2 border rounded-lg disabled:opacity-50"
                >
                    Next
                </button>

            </div>
        </div>
    );
};

export default Table;