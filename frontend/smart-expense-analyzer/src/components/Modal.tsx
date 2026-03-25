import type { ReactNode } from "react";

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
};

const Modal = ({ isOpen, onClose, children }: ModalProps) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            role="dialog"
            aria-modal="true"
        >
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 sm:p-6 w-full max-w-md shadow-lg relative max-h-[90vh] overflow-y-auto">

                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    aria-label="Close modal"
                >
                    ✕
                </button>

                {children}
            </div>
        </div>
    );
};

export default Modal;
