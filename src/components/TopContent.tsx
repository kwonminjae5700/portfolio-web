import Category from "./Category";
import TopPost from "./TopPost";

interface TopContentProps {
  mode: "posts" | "categories";
}

const TopContent = ({ mode }: TopContentProps) => {
  return (
    <div className="w-64 pb-10 border-b border-gray-300">
      <h3 className="font-bold text-xl mb-4">
        TOP {mode === "posts" ? "5" : "CATEGORIES"}
      </h3>
      {mode === "posts" ? (
        <div className="flex-col gap-3">
          <TopPost />
          <TopPost />
          <TopPost />
          <TopPost />
          <TopPost />
        </div>
      ) : (
        <div className="flex gap-3 flex-wrap">
          <Category />
          <Category />
          <Category />
          <Category />
          <Category />
        </div>
      )}
    </div>
  );
};

export default TopContent;
