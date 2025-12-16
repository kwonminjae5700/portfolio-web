"use client";

import { useEffect } from "react";
import { API_BASE_URL } from "@/lib/constants";

interface ViewCounterProps {
  articleId: number;
}

export default function ViewCounter({ articleId }: ViewCounterProps) {
  useEffect(() => {
    // 게시글이 로드될 때 조회수 증가
    const incrementView = async () => {
      try {
        await fetch(`${API_BASE_URL}/articles/${articleId}/views`, {
          method: "POST",
        });
      } catch (error) {
        console.error("조회수 증가 중 오류:", error);
      }
    };

    incrementView();
  }, [articleId]);

  return null;
}
