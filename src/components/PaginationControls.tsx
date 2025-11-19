import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  showingRange: string;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export default function PaginationControls({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  showingRange,
  onPageChange,
  onPageSizeChange,
}: PaginationControlsProps) {
  const [pageInput, setPageInput] = useState(String(currentPage));

  useEffect(() => {
    setPageInput(String(currentPage));
  }, [currentPage]);

  const handlePageJump = (value: string) => {
    const page = parseInt(value, 10);
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    } else {
      setPageInput(String(currentPage));
    }
  };

  return (
    <div className="flex gap-3 p-4 mx-auto max-w-4xl bg-white rounded-lg border shadow-sm flex-col border-slate-100">
      <div className="flex gap-4 justify-between items-center">
        <div className="flex gap-2 items-center">
          <label htmlFor="page-size" className="hidden text-sm text-slate-600 sm:inline">
            Show:
          </label>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => onPageSizeChange(parseInt(value, 10))}
          >
            <SelectTrigger className="h-9 w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <span className="hidden text-sm text-slate-600 sm:inline">per page</span>
        </div>

        <div className="flex gap-2 items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <span className="hidden sm:inline">←</span>
            <span className="sm:hidden">‹</span>
          </Button>
          <div className="flex gap-1.5 items-center">
            <Input
              type="number"
              min="1"
              max={totalPages}
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              onBlur={(e) => handlePageJump(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handlePageJump((e.target as HTMLInputElement).value);
                }
              }}
              className="h-9 w-12 sm:w-16 px-1.5 sm:px-2 text-center"
            />
            <span className="text-sm text-slate-600">/</span>
            <span className="text-sm text-slate-600">{Math.max(totalPages, 1)}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            <span className="hidden sm:inline">→</span>
            <span className="sm:hidden">›</span>
          </Button>
        </div>

        <div className="hidden text-sm text-slate-600 sm:block">
          {showingRange} of {totalItems}
        </div>
      </div>

      {/* Mobile-only total count */}
      <div className="text-xs text-center text-slate-500 sm:hidden">
        {showingRange} of {totalItems} questions
      </div>
    </div>
  );
}
