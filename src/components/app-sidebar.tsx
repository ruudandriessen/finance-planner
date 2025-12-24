import { Link } from "@tanstack/react-router";
import { ArrowRightLeft, DollarSign, Home, HouseIcon } from "lucide-react";
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
    title: "Accounts",
    url: "/accounts",
    icon: () => <HouseIcon />,
  },
  {
    title: "Flows",
    url: "/flows",
    icon: () => <ArrowRightLeft />,
  },
  {
    title: "Income",
    url: "/financial-items/income",
    icon: () => <DollarSign />,
  },
  {
    title: "Mortgages",
    url: "/financial-items/mortgage",
    icon: () => <Home />,
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
