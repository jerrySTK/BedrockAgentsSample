import { createFileRoute } from "@tanstack/react-router";
import CompaniesPage from "../pages/companies/CompaniesPage";

export const Route = createFileRoute("/companies")({
  component: CompaniesPage,
});
