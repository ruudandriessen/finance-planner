import { Link } from "@tanstack/react-router";
import {
  CalendarClock,
  CreditCard,
  DollarSign,
  Home,
  LayoutDashboard,
  PiggyBank,
  Receipt,
  TrendingUp,
} from "lucide-react";
import { ModeToggle } from "./mode-toggle";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "./ui/sidebar";

const items = [
  {
    title: "Dashboard",
    url: "/",
    icon: () => <LayoutDashboard />,
  },
  {
    title: "Savings",
    url: "/financial-items/savings",
    icon: () => <PiggyBank />,
  },
  {
    title: "Checking",
    url: "/financial-items/checking",
    icon: () => <CreditCard />,
  },
  {
    title: "Income",
    url: "/financial-items/income",
    icon: () => <DollarSign />,
  },
  {
    title: "Expenses",
    url: "/financial-items/expenses",
    icon: () => <Receipt />,
  },
  {
    title: "Mortgages",
    url: "/financial-items/mortgage",
    icon: () => <Home />,
  },
  {
    title: "Investments",
    url: "/financial-items/investment",
    icon: () => <TrendingUp />,
  },
];

export function AppSidebar({ planId }: { planId?: string }) {
  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarMenu>
            {items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <Link to={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        {planId != null && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Plan</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link to="/events">
                      <CalendarClock />
                      <span>Events</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>
      <SidebarFooter>
        <ModeToggle />
      </SidebarFooter>
    </Sidebar>
  );
}
