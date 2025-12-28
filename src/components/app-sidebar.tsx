import { Link } from "@tanstack/react-router";
import {
  ArrowRightLeft,
  CreditCard,
  DollarSign,
  Home,
  PiggyBank,
  Receipt,
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
} from "./ui/sidebar";

const items = [
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
    title: "Flows",
    url: "/flows",
    icon: () => <ArrowRightLeft />,
  },
];

export function AppSidebar() {
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
      </SidebarContent>
      <SidebarFooter>
        <ModeToggle />
      </SidebarFooter>
    </Sidebar>
  );
}
