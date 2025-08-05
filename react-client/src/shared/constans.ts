export const BASE_API_URL =
  process.env.NODE_ENV === "production"
    ? "https://work.site.kz/api"
    : "http://localhost:4000/api";