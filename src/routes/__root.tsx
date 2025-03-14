import { createRootRoute, Outlet } from "@tanstack/react-router";
import Layout from "../components/layout/Layout";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export const Route = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
      <TanStackRouterDevtools />
    </Layout>
  ),
});
