import React from "react";
import { useOutletContext } from "react-router-dom";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

const themeStyles = {
  blue: {
    toggleHover: "hover:text-blue-600 hover:bg-blue-50",
    toggleText: "text-gray-500",
  },
  green: {
    toggleHover: "hover:text-green-600 hover:bg-green-50",
    toggleText: "text-gray-500",
  },
};

const PageHeader = ({ title, actions, theme = "blue" }) => {
  const outletContext = useOutletContext() || {};
  const { isSidebarCollapsed, setIsSidebarCollapsed } = outletContext;
  const canToggle = typeof setIsSidebarCollapsed === "function";
  const styles = themeStyles[theme] || themeStyles.blue;

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {canToggle && (
          <button
            className={`hidden lg:flex p-2 ${styles.toggleText} ${styles.toggleHover} transition-colors rounded-md`}
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            title={isSidebarCollapsed ? "Expandir menu" : "Colapsar menu"}
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="w-5 h-5" />
            ) : (
              <PanelLeftClose className="w-5 h-5" />
            )}
          </button>
        )}
        <h1 className="text-4xl font-bold text-gray-700">{title}</h1>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
};

export default PageHeader;
