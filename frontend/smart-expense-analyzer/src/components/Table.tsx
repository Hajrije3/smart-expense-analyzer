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
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">

                {/* HEADER */}
                <div
                    className="grid p-4 font-medium text-gray-500 dark:text-gray-400 border-b dark:border-gray-700"
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
                            className="grid p-4 border-b dark:border-gray-700 items-center hover:bg-gray-50 dark:hover:bg-gray-700"
                            style={{ gridTemplateColumns: gridTemplate }}
                        >
                            {columns.map((col, colIndex) => (
                                <span key={colIndex} className="truncate text-gray-800 dark:text-gray-200">
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
                    className="px-4 py-2 border dark:border-gray-600 dark:text-gray-300 rounded-lg disabled:opacity-50"
                >
                    Prev
                </button>

                <span className="text-sm text-gray-600 dark:text-gray-400">
                    Page {page} of {pages}
                </span>

                <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={page === pages}
                    className="px-4 py-2 border dark:border-gray-600 dark:text-gray-300 rounded-lg disabled:opacity-50"
                >
                    Next
                </button>

            </div>
        </div>
    );
};

export default Table;