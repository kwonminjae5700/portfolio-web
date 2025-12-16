"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Category } from "@/types/api";

const CategoryList = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await api.getCategories();
        setCategories(data);
      } catch (err) {
        console.error("카테고리 로드 실패:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (isLoading) {
    return <div className="text-sm text-gray-400">로딩 중...</div>;
  }

  if (categories.length === 0) {
    return <div className="text-sm text-gray-400">카테고리가 없습니다.</div>;
  }

  return (
    <div className="flex gap-3 flex-wrap">
      {categories.map((category) => (
        <div
          key={category.id}
          className="w-fit bg-gray-100 rounded-3xl px-5 py-1 text-gray-500 cursor-pointer hover:text-black transition"
        >
          {category.name}
        </div>
      ))}
    </div>
  );
};

export default CategoryList;
