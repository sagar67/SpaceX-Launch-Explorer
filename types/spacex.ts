// Launch object type
export interface Launch {
  id: string;
  name: string;
  date_utc: string;
  success: boolean | null;
  links: { patch: { small: string | null; large: string | null } };
  launchpad: string;
}

// Launchpad object type
export interface Launchpad {
  id: string;
  name: string;
  locality: string;
  region: string;
  latitude: number;
  longitude: number;
  images: { large: string[] };
  details: string;
  full_name: string;
  status: string;
}

// Common pagination metadata type
export interface Pagination {
  totalDocs: number; // Total number of documents
  limit: number; // Number of items per page
  totalPages: number; // Total number of pages
  page: number; // Current page number
  pagingCounter: number; // Starting index for the current page
  hasPrevPage: boolean; // Whether there is a previous page
  hasNextPage: boolean; // Whether there is a next page
  prevPage: number | null; // Previous page number (null if none)
  nextPage: number | null; // Next page number (null if none)
}

// Paginated response for launches
export interface PaginatedLaunchResponse extends Pagination {
  docs: Launch[]; // Array of launches
}
