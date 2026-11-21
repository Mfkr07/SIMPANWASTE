"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  className?: string;
  itemLabel?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  className = "",
  itemLabel = "data",
}: PaginationProps) {
  // Hitung rentang data yang sedang ditampilkan
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Buat array halaman dengan smart ellipsis (...)
  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [];
    const showLeftEllipsis = currentPage > 4;
    const showRightEllipsis = currentPage < totalPages - 3;

    if (!showLeftEllipsis && showRightEllipsis) {
      // Dekat awal: 1, 2, 3, 4, 5, '...', totalPages
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push("...");
      pages.push(totalPages);
    } else if (showLeftEllipsis && !showRightEllipsis) {
      // Dekat akhir: 1, '...', totalPages - 4, ..., totalPages
      pages.push(1);
      pages.push("...");
      for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
    } else {
      // Di tengah: 1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages
      pages.push(1);
      pages.push("...");
      pages.push(currentPage - 1);
      pages.push(currentPage);
      pages.push(currentPage + 1);
      pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  }, [currentPage, totalPages]);

  if (totalItems <= 0) {
    return null;
  }

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 pb-1 border-t border-slate-100 text-xs text-slate-600 ${className}`}
    >
      {/* Informasi Jumlah Data & Opsi Jumlah per Halaman */}
      <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
        <span className="font-medium text-slate-600">
          Menampilkan{" "}
          <strong className="font-extrabold text-slate-900">
            {startItem}–{endItem}
          </strong>{" "}
          dari <strong className="font-extrabold text-slate-900">{totalItems}</strong> {itemLabel}
        </span>

        {onPageSizeChange && pageSizeOptions.length > 1 && (
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
            <span>Per halaman:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 font-semibold text-slate-800 shadow-2xs hover:border-slate-300 focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600 cursor-pointer"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Kontrol Navigasi Tombol Halaman */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1 w-full sm:w-auto justify-center sm:justify-end">
          {/* Tombol ke Halaman Pertama */}
          <button
            type="button"
            title="Halaman Pertama"
            aria-label="Halaman Pertama"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(1)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 active:scale-95 cursor-pointer"
          >
            <ChevronsLeft size={15} />
          </button>

          {/* Tombol Sebelumnya */}
          <button
            type="button"
            title="Halaman Sebelumnya"
            aria-label="Halaman Sebelumnya"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 active:scale-95 cursor-pointer"
          >
            <ChevronLeft size={15} />
          </button>

          {/* Nomor-nomor Halaman */}
          <div className="flex items-center gap-1 mx-0.5">
            {pageNumbers.map((p, idx) => {
              if (p === "...") {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="inline-flex h-8 w-7 items-center justify-center text-slate-400 select-none font-bold"
                  >
                    …
                  </span>
                );
              }

              const pageNum = Number(p);
              const isActive = pageNum === currentPage;

              return (
                <button
                  type="button"
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`inline-flex h-8 min-w-[32px] px-2 items-center justify-center rounded-lg text-xs font-bold transition active:scale-95 cursor-pointer ${
                    isActive
                      ? "bg-green-700 text-white shadow-xs"
                      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          {/* Tombol Selanjutnya */}
          <button
            type="button"
            title="Halaman Selanjutnya"
            aria-label="Halaman Selanjutnya"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 active:scale-95 cursor-pointer"
          >
            <ChevronRight size={15} />
          </button>

          {/* Tombol ke Halaman Terakhir */}
          <button
            type="button"
            title="Halaman Terakhir"
            aria-label="Halaman Terakhir"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(totalPages)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 active:scale-95 cursor-pointer"
          >
            <ChevronsRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Custom hook serbaguna untuk memudahkan penambahan pagination pada list/tabel apa pun
 */
export function usePagination<T>(items: T[], defaultPageSize = 10) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  // Otomatis sesuaikan halaman aktif jika jumlah data berkurang drastis (misal akibat filter)
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, currentPage, pageSize]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handlePageSizeChange = useCallback((newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  }, []);

  const resetPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  return {
    currentPage,
    setCurrentPage: handlePageChange,
    pageSize,
    setPageSize: handlePageSizeChange,
    totalPages,
    totalItems: items.length,
    paginatedItems,
    resetPage,
  };
}
