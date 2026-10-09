import { HashRouter, MemoryRouter, Navigate, Route, Routes } from "react-router-dom";
import type { ReactNode } from "react";
import AdminLayout from "@/layouts/AdminLayout";
import StoreLayout from "@/layouts/StoreLayout";
import { Toaster } from "@/components/ui/overlays";
import Overview from "@/pages/Overview";
import Today from "@/pages/admin/Today";
import InboxPage from "@/pages/admin/Inbox";
import OrdersPage from "@/pages/admin/Orders";
import RepairsPage from "@/pages/admin/Repairs";
import ClientsPage from "@/pages/admin/Clients";
import ClientProfile from "@/pages/admin/ClientProfile";
import CatalogPage from "@/pages/admin/Catalog";
import InvoicesPage from "@/pages/admin/Invoices";
import MessagingPage from "@/pages/admin/Messaging";
import PartnersPage from "@/pages/admin/Partners";
import ReportsPage from "@/pages/admin/Reports";
import SettingsPage from "@/pages/admin/Settings";
import StoreHome from "@/pages/store/StoreHome";
import StoreShop from "@/pages/store/StoreShop";
import Requirements from "@/pages/store/Requirements";
import RepairRequest from "@/pages/store/RepairRequest";
import Track from "@/pages/store/Track";
import Account from "@/pages/store/Account";
import Checkout from "@/pages/store/Checkout";

/* Plain #anchors (e.g. #shop, #inbox) open a section directly in the single-file build. */
const ANCHORS: Record<string, string> = {
  overview: "/",
  admin: "/admin",
  console: "/admin",
  inbox: "/admin/inbox",
  orders: "/admin/orders",
  repairs: "/admin/repairs",
  clients: "/admin/clients",
  catalog: "/admin/catalog",
  invoices: "/admin/invoices",
  automations: "/admin/messaging",
  reports: "/admin/reports",
  shop: "/shop",
  store: "/shop",
  storefront: "/shop",
  requirements: "/shop/requirements",
  repair: "/shop/repair",
  track: "/shop/track",
};

function Router({ children }: { children: ReactNode }) {
  if (__SINGLE_FILE__) {
    const token = window.location.hash.replace(/^#\/?/, "").toLowerCase();
    return <MemoryRouter initialEntries={[ANCHORS[token] ?? "/"]}>{children}</MemoryRouter>;
  }
  return <HashRouter>{children}</HashRouter>;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Today />} />
          <Route path="inbox" element={<InboxPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="repairs" element={<RepairsPage />} />
          <Route path="clients" element={<ClientsPage />} />
          <Route path="clients/:id" element={<ClientProfile />} />
          <Route path="catalog" element={<CatalogPage />} />
          <Route path="invoices" element={<InvoicesPage />} />
          <Route path="messaging" element={<MessagingPage />} />
          <Route path="partners" element={<PartnersPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="/shop" element={<StoreLayout />}>
          <Route index element={<StoreHome />} />
          <Route path="catalog" element={<StoreShop />} />
          <Route path="requirements" element={<Requirements />} />
          <Route path="repair" element={<RepairRequest />} />
          <Route path="track" element={<Track />} />
          <Route path="track/:code" element={<Track />} />
          <Route path="account" element={<Account />} />
          <Route path="checkout" element={<Checkout />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </Router>
  );
}
