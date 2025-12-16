import React from "react";

const TopContent = ({ content }: { content: React.ReactElement }) => {
  return (
    <div>
      <h3 className="font-bold text-2xl mb-4">TOP 5</h3>
      {content}
    </div>
  );
};

export default TopContent;
