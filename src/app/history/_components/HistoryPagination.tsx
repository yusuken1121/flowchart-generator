"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type Props = {
  nextCursor: string | null;
  hasMore: boolean;
};

export function HistoryPagination({ nextCursor, hasMore }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentCursor = searchParams.get("cursor");

  const createQueryString = useCallback(
    (name: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === null) {
        params.delete(name);
      } else {
        params.set(name, value);
      }
      return params.toString();
    },
    [searchParams]
  );

  const handlePrevious = (e: React.MouseEvent) => {
    e.preventDefault();
    router.back();
  };

  if (!currentCursor && !hasMore) {
    return null;
  }

  return (
    <Pagination className="mt-8">
      <PaginationContent>
        <PaginationItem>
          {currentCursor ? (
            <PaginationPrevious
              href="#"
              onClick={handlePrevious}
              className="cursor-pointer"
            />
          ) : (
            <PaginationPrevious
              href="#"
              className="pointer-events-none opacity-50"
            />
          )}
        </PaginationItem>

        <PaginationItem>
          {hasMore && nextCursor ? (
            <PaginationNext
              href={`${pathname}?${createQueryString("cursor", nextCursor)}`}
            />
          ) : (
            <PaginationNext
              href="#"
              className="pointer-events-none opacity-50"
            />
          )}
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
