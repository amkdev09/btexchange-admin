import { Leaderboard, Person, AccountBalanceWallet, History, MonetizationOn } from "@mui/icons-material";
import asyncComponent from "../utils/asyncComponent.jsx";

export const authRouters = [
  {
    path: "/trade/login",
    component: asyncComponent(() => import("../pages/auth/LoginTrade.jsx")),
  },
  {
    path: "/trade/forgot-password",
    component: asyncComponent(() => import("../pages/auth/ForgotPassword.jsx")),
  },
  {
    path: "/network/login",
    component: asyncComponent(() => import("../pages/auth/LoginNetwork.jsx")),
  },
  {
    path: "/network/forgot-password",
    component: asyncComponent(() => import("../pages/auth/ForgotPassword2.jsx")),
  }
];

export const protectedRouters = [
  {
    path: "/",
    inSidebarMenu: true,
    label: "Dashboard",
    icon: Leaderboard,
    component: asyncComponent(() => import("../pages/trade/dashboard.jsx")),
  },
  {
    path: "/manage-users",
    inSidebarMenu: true,
    label: "Manage Users",
    icon: Person,
    component: asyncComponent(() => import("../pages/trade/manageUser/index.jsx")),
  },
  {
    path: "/manage-funds",
    inSidebarMenu: true,
    label: "Manage Funds",
    icon: AccountBalanceWallet,
    component: asyncComponent(() => import("../pages/trade/manageFund/index.jsx")),
  },
  {
    path: "/manage-history-and-logs",
    inSidebarMenu: true,
    label: "Manage History & Logs",
    icon: History,
    component: asyncComponent(() => import("../pages/trade/manageHistoryNLogs/index.jsx")),
  },
];

export const protectedRouters2 = [
  {
    path: "/network/dashboard",
    inSidebarMenu: true,
    label: "Dashboard",
    icon: Leaderboard,
    component: asyncComponent(() => import("../pages/network/dashboard.jsx")),
  },
  {
    path: "/network/manage-users",
    inSidebarMenu: true,
    label: "Manage Users",
    icon: Person,
    component: asyncComponent(() => import("../pages/network/manageUser/index.jsx")),
  },
  {
    path: "/network/manage-funds",
    inSidebarMenu: true,
    label: "Manage Funds",
    icon: AccountBalanceWallet,
    component: asyncComponent(() => import("../pages/network/manageFund/index.jsx")),
  },
  {
    path: "/network/manage-finance",
    inSidebarMenu: true,  
    label: "Manage Finance",
    icon: MonetizationOn,
    component: asyncComponent(() => import("../pages/network/manageFinance/index.jsx")),
  },
];

export const routers = [...authRouters, ...protectedRouters, ...protectedRouters2];
