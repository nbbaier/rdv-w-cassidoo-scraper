import { useState, useEffect, useMemo } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PaginationControls from "./PaginationControls";
import YearFilter from "./YearFilter";

interface Question {
  slug: string;
  number: number;
  date: string;
  excerpt: string;
  year: number;
}

interface SearchIndexItem {
  slug: string;
  number: number;
  date: string;
  excerpt: string;
}

interface QuestionsListProps {
  questions: Question[];
  years: number[];
}

export default function QuestionsList({ questions, years }: QuestionsListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchIndex, setSearchIndex] = useState<SearchIndexItem[]>([]);

  // Load search index
  useEffect(() => {
    async function loadSearchIndex() {
      try {
        const res = await fetch("/search.json");
        const data = await res.json();
        setSearchIndex(data);
      } catch (err) {
        console.error("Failed to load search index", err);
      }
    }
    loadSearchIndex();
  }, []);

  // Filter questions
  const filteredQuestions = useMemo(() => {
    let filtered = questions;

    // Filter by year
    if (selectedYear) {
      filtered = filtered.filter((q) => q.year === parseInt(selectedYear));
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();

      if (searchIndex.length > 0) {
        const matchingSlugs = new Set<string>();
        searchIndex.forEach((item) => {
          if (
            item.excerpt.toLowerCase().includes(term) ||
            item.date.includes(term) ||
            String(item.number).includes(term) ||
            item.slug.includes(term)
          ) {
            matchingSlugs.add(item.slug);
          }
        });
        filtered = filtered.filter((q) => matchingSlugs.has(q.slug));
      } else {
        filtered = filtered.filter(
          (q) =>
            q.date.includes(term) ||
            String(q.number).includes(term) ||
            q.excerpt.toLowerCase().includes(term)
        );
      }
    }

    return filtered;
  }, [questions, selectedYear, searchTerm, searchIndex]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredQuestions.length / pageSize);
  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, filteredQuestions.length);
  const paginatedQuestions = filteredQuestions.slice(startIdx, endIdx);

  const showingRange =
    filteredQuestions.length === 0 ? "0-0" : `${startIdx + 1}-${endIdx}`;

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedYear, pageSize]);

  // Ensure current page is valid
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
  };

  return (
    <>
      <div className="mb-8 space-y-4">
        {/* Search and Year Filter */}
        <div className="flex gap-2 mx-auto max-w-4xl sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 px-4 pl-10"
            />
          </div>

          <YearFilter
            years={years}
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
          />
        </div>

        {/* Pagination Controls */}
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={filteredQuestions.length}
          showingRange={showingRange}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {paginatedQuestions.length > 0 ? (
          paginatedQuestions.map((question) => (
            <a key={question.slug} href={`/questions/${question.slug}`}>
              <Card className="transition-all hover:border-indigo-300 hover:shadow-md group cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <Badge className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-transparent">
                      #{question.number}
                    </Badge>
                    <time className="text-sm text-slate-400">{question.date}</time>
                  </div>
                  <div className="text-slate-700 line-clamp-2 group-hover:text-slate-900">
                    {question.excerpt}...
                  </div>
                </CardContent>
              </Card>
            </a>
          ))
        ) : (
          <div className="py-12 text-center text-slate-500">
            No questions found matching your search.
          </div>
        )}
      </div>
    </>
  );
}
