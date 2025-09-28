import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { PaginatedLaunchResponse, Launchpad } from "../types/spacex";

export const spacexApi = createApi({
  reducerPath: "spacexApi",
  baseQuery: fetchBaseQuery({ baseUrl: "https://api.spacexdata.com/" }),
  endpoints: (builder) => ({
    getLaunches: builder.query<
      any,
      { limit: number; offset: number; searchTerm?: string }
    >({
      query: ({ limit, offset, searchTerm }) => {
        const nameFilter = searchTerm
          ? { name: { $regex: searchTerm, $options: "i" } }
          : {};
        return {
          url: "v5/launches/query",
          method: "POST",
          body: {
            query: nameFilter,
            options: {
              limit,
              offset,
              sort: { date_utc: "desc" },
            },
          },
        };
      },
    }),
    getLaunchpad: builder.query<Launchpad, string>({
      query: (launchpadId) => `v4/launchpads/${launchpadId}`,
    }),
  }),
});

export const { useGetLaunchesQuery, useGetLaunchpadQuery } = spacexApi;
