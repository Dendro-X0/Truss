export interface UsePaginationInput {
  readonly currentPage: number;
  readonly totalPages: number;
  readonly paginationItemsToDisplay?: number;
}

export interface UsePaginationResult {
  readonly pages: readonly number[];
  readonly showLeftEllipsis: boolean;
  readonly showRightEllipsis: boolean;
}

function buildRange(start: number, end: number): number[] {
  const items: number[] = [];
  for (let index: number = start; index <= end; index += 1) {
    items.push(index);
  }
  return items;
}

export function usePagination(input: UsePaginationInput): UsePaginationResult {
  const currentPage: number = input.currentPage;
  const totalPages: number = input.totalPages;
  const maxNeighborItems: number = input.paginationItemsToDisplay ?? 2;
  const safeTotalPages: number = Math.max(totalPages, 1);
  const safeCurrentPage: number = Math.min(Math.max(currentPage, 1), safeTotalPages);
  const startPage: number = Math.max(1, safeCurrentPage - maxNeighborItems);
  const endPage: number = Math.min(safeTotalPages, safeCurrentPage + maxNeighborItems);
  const pages: number[] = buildRange(startPage, endPage);
  const showLeftEllipsis: boolean = startPage > 1;
  const showRightEllipsis: boolean = endPage < safeTotalPages;
  return { pages, showLeftEllipsis, showRightEllipsis };
}
