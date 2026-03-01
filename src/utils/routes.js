
// src/utils/routes.js
import { FaTachometerAlt, FaUserTie, FaBullhorn, FaComments, FaUserShield, FaKey, FaBoxOpen, FaUsers, FaBuilding, FaUserFriends } from 'react-icons/fa';
import { MdOutlineCampaign } from 'react-icons/md';
import { HiOutlineUserGroup } from 'react-icons/hi';

import Campaigns from "../page/admin/Campaigns";
import Companies from "../page/admin/Companies";
import Conversations from "../page/admin/Conversations";
import Coustomers from "../page/admin/Coustomers";
import Dashboard from "../page/admin/Dashboard";
import Employees from "../page/admin/Employees";
import Leads from "../page/admin/Leads";
import Packages from "../page/admin/Packages";
import Permissions from "../page/admin/Permissions";
import Roles from "../page/admin/Roles";
import LoginPage from "../page/common/LoginPage";

const routes = [
  {
    path: "/dashboard",
    component: Dashboard,
    module: "admin",
    label: "Dashboard",
    icon: FaTachometerAlt,
  },
  {
    path: "/leads",
    component: Leads,
    module: "admin",
    label: "Leads",
    icon: HiOutlineUserGroup,
  },
  {
    path: "/campaigns",
    component: Campaigns,
    module: "admin",
    label: "Campaigns",
    icon: MdOutlineCampaign,
  },
  {
    path: "/conversations",
    component: Conversations,
    module: "admin",
    label: "Conversations",
    icon: FaComments,
  },
  {
    path: "/roles",
    component: Roles,
    module: "admin",
    label: "Roles",
    icon: FaUserShield,
  },
  {
    path: "/permissions",
    component: Permissions,
    module: "admin",
    label: "Permissions",
    icon: FaKey,
  },
  {
    path: "/package",
    component: Packages,
    module: "admin",
    label: "Packages",
    icon: FaBoxOpen,
  },
  {
    path: "/employees",
    component: Employees,
    module: "admin",
    label: "Employees",
    icon: FaUserTie,
  },
  {
    path: "/customers",
    component: Coustomers,
    module: "admin",
    label: "Customers",
    icon: FaUserFriends,
  },
  {
    path: "/company",
    component: Companies,
    module: "admin",
    label: "Company",
    icon: FaBuilding,
  },
  {
    path: "/login",
    component: LoginPage,
    module: "auth",
    label: "Login",
  },
];

export default routes;