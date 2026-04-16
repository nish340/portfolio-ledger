import { Link, useLocation } from "react-router-dom";
import {
  homeActiveIcon,
  homeInactiveIcon,
  trendActiveIcon,
  trendInactiveIcon,
  coinActiveIcon,
  coinInactiveIcon,
  settingsActiveIcon,
  settingsInactiveIcon,
} from "@/assets/images/index";

const navItems = [
  { to: "/",         activeIcon: homeActiveIcon,     inactiveIcon: homeInactiveIcon,     label: "Home"    },
  { to: "/trends",   activeIcon: trendActiveIcon,    inactiveIcon: trendInactiveIcon,    label: "Trend"   },
  { to: "/coins",    activeIcon: coinActiveIcon,     inactiveIcon: coinInactiveIcon,     label: "Coin"    },
  { to: "/settings", activeIcon: settingsActiveIcon, inactiveIcon: settingsInactiveIcon, label: "Setting" },
];

const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-lg">
      <div className="relative mx-auto flex max-w-full items-center justify-around px-4 py-2.5">
        {navItems.map(({ to, activeIcon, inactiveIcon, label }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-opacity"
            >
              <img
                src={active ? activeIcon : inactiveIcon}
                alt={label}
                className={`h-6 w-6 object-contain transition-opacity ${active ? "opacity-100" : "opacity-50"}`}
              />
              <span className={`text-xs font-semibold transition-colors ${active ? "text-accent" : "text-muted-foreground"}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
