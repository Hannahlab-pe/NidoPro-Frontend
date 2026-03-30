import React from "react";

const PageHeader = ({ title, actions, theme = "blue" }) => {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-700">{title}</h1>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
};

export default PageHeader;
