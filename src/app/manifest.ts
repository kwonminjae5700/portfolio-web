import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/constants";

/**
 * 웹 앱 매니페스트 — 안드로이드 크롬의 "홈 화면에 추가"가 쓰는 아이콘 출처.
 *
 * 이게 없으면 크롬은 파비콘(48px)을 홈 화면 크기까지 늘려서 쓴다.
 * apple-icon.png는 iOS 전용이라 대신 잡아주지 않는다.
 *
 * purpose가 둘로 나뉘는 이유:
 *   any      — 아이콘을 준 그대로 그린다. 그래서 모서리가 둥근 타일을 준다.
 *   maskable — 런처가 자기 모양(원·스퀘어클…)으로 잘라낸다. 잘려도 되는 여백이
 *              필요해서 글리프를 줄인 풀블리드 버전을 따로 준다. 여기에 둥근
 *              타일을 주면 모서리가 두 번 깎여 지저분해진다.
 *
 * display는 지정하지 않는다(기본값 browser). standalone으로 바꾸면 설치형 앱처럼
 * 주소창 없이 뜨는데, 이 블로그는 링크를 복사해 나가는 흐름이 더 자연스럽다.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: "Kwon5700",
    description: SITE_DESCRIPTION,
    lang: "ko",
    start_url: "/",
    // 사이트 표면이 흰색이라 스플래시도 흰색으로 맞춘다 — 아이콘의 파인 그린만 뜬다
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
