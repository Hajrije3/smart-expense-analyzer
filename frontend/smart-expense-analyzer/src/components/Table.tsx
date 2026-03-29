import type { ReactNode } from "react";

type Column<T> = {
    header: string;
    accessor: (row: T) => ReactNode;
    width?: string;
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
    const gridTemplate = columns.map((col) => col.width || "1fr").join(" ");

    return (
        <div className="space-y-4">

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <div style={{ minWidth: "640px" }}>

                        <div
                            className="grid px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-750"
                            style={{ gridTemplateColumns: gridTemplate }}
                        >
                            {columns.map((col, index) => (
                                <span key={index}>{col.header}</span>
                            ))}
                        </div>

                        <div>
                            {data.length === 0 ? (
                                <p className="text-center text-gray-400 dark:text-gray-500 text-sm py-10">
                                    No data available
                                </p>
                            ) : (
                                data.map((row, rowIndex) => (
                                    <div
                                        key={rowIndex}
                                        className="grid px-4 py-3 border-b dark:border-gray-700 items-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                        style={{ gridTemplateColumns: gridTemplate }}
                                    >
                                        {columns.map((col, colIndex) => (
                                            <span key={colIndex} className="truncate text-sm text-gray-800 dark:text-gray-200">
                                                {col.accessor(row)}
                                            </span>
                                        ))}
                                    </div>
                                ))
                            )}
                        </div>

                    </div>
                </div>
            </div>

            {pages > 1 && (
                <div className="flex justify-center items-center gap-4">
                    <button
                        onClick={() => onPageChange(page - 1)}
                        disabled={page === 1}
                        className="px-4 py-2 text-sm border dark:border-gray-600 dark:text-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        Prev
                    </button>

                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        {page} / {pages}
                    </span>

                    <button
                        onClick={() => onPageChange(page + 1)}
                        disabled={page === pages}
                        className="px-4 py-2 text-sm border dark:border-gray-600 dark:text-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        Next
                    </button>
                </div>
            )}

        </div>
    );
};

export default Table;
