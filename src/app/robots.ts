import { MetadataRoute } from "next";
import { ROUTES, SITE_URL } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        /**
         * 로그인·작성·관리 화면. 색인될 내용이 없고, 색인되면 검색 결과에
         * 빈 폼이 노출된다. ROUTES를 쓰는 이유는 경로가 바뀌었을 때
         * 여기만 조용히 옛 주소로 남는 걸 막기 위해서다.
         *
         * "/edit/"는 접두사 매칭이라 /edit/1 이하가 모두 막힌다.
         * "/categories"는 카테고리 관리 화면이고, 공개 카테고리 페이지인
         * "/category/{id}"와는 다른 경로다 — 그쪽은 sitemap에 들어간다.
         */
        disallow: [
          ROUTES.LOGIN,
          ROUTES.REGISTER,
          ROUTES.RESET_PASSWORD,
          ROUTES.PROFILE,
          ROUTES.WRITE,
          "/edit/",
          "/categories",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
