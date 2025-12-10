import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

import Login from "./pages/Login";
import Home from "./pages/Home";
import CustomerList from "./pages/CustomerList";
import CustomerAdd from "./pages/CustomerAdd";
import CustomerDetail from "./pages/CustomerDetail";
import RoomMatrix from "./pages/RoomMatrix";
import OrderList from "./pages/OrderList";
import ApprovalList from "./pages/ApprovalList";
import RechargeRequest from "./pages/RechargeRequest";
import RechargeRequestList from "./pages/RechargeRequestList";
import ConsumptionRequestList from "./pages/ConsumptionRequestList";
import TeamManagement from "./pages/TeamManagement";
import TeamMemberDetail from "./pages/TeamMemberDetail";
import BookingApproval from "./pages/BookingApproval";
import RechargeApproval from "./pages/RechargeApproval";
import ConsumptionApproval from "./pages/ConsumptionApproval";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <DataProvider>
        <TooltipProvider>
          <Toaster position="top-center" />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customers"
                element={
                  <ProtectedRoute>
                    <CustomerList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customers/add"
                element={
                  <ProtectedRoute>
                    <CustomerAdd />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customers/:id"
                element={
                  <ProtectedRoute>
                    <CustomerDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/rooms"
                element={
                  <ProtectedRoute>
                    <RoomMatrix />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <OrderList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/approval"
                element={
                  <ProtectedRoute>
                    <ApprovalList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recharge/:id"
                element={
                  <ProtectedRoute>
                    <RechargeRequest />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recharge-requests"
                element={
                  <ProtectedRoute>
                    <RechargeRequestList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/consumption-requests"
                element={
                  <ProtectedRoute>
                    <ConsumptionRequestList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/team"
                element={
                  <ProtectedRoute>
                    <TeamManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/team/:staffNo"
                element={
                  <ProtectedRoute>
                    <TeamMemberDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/booking-approval"
                element={
                  <ProtectedRoute>
                    <BookingApproval />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recharge-approval"
                element={
                  <ProtectedRoute>
                    <RechargeApproval />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/consumption-approval"
                element={
                  <ProtectedRoute>
                    <ConsumptionApproval />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </DataProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
