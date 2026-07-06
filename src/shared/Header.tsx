"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconUser, IconPencil, IconMenu2, IconX } from "@tabler/icons-react";
import { useAuth } from "@/contexts/AuthContext";
import { CONTAINER, ROUTES, EXTERNAL_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const Header = () => {
  const { user, isLoggedIn, isLoading, canWrite } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  const closeMenu = () => setIsMenuOpen(false);

  // 블로그 내부 경로는 전부 Blog 활성으로 취급
  const isBlogActive =
    pathname === "/" ||
    pathname.startsWith("/post") ||
    pathname.startsWith("/category");

  useEffect(() => {
    const onScroll = () => {
      setScrolled((prev) => {
        const next = window.scrollY > 8;
        return next === prev ? prev : next;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 모바일 메뉴가 열려 있는 동안 배경 스크롤 잠금.
  // 메뉴가 md:hidden이므로, 열린 채 데스크톱 폭으로 넘어가면 닫아서 잠금이 남지 않게 한다.
  useEffect(() => {
    if (!isMenuOpen) return;
    document.documentElement.style.overflow = "hidden";

    const mq = window.matchMedia("(min-width: 768px)");
    const onBreakpointChange = (e: MediaQueryListEvent) => {
      if (e.matches) setIsMenuOpen(false);
    };
    mq.addEventListener("change", onBreakpointChange);

    return () => {
      document.documentElement.style.overflow = "";
      mq.removeEventListener("change", onBreakpointChange);
    };
  }, [isMenuOpen]);

  const navLinkClass = (active: boolean) =>
    cn(
      "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded-sm",
      active ? "text-ink font-medium" : "text-muted hover:text-ink",
    );

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 h-18 transition-[background-color,border-color] duration-300",
          scrolled
            ? "bg-white/85 backdrop-blur-md border-b border-line"
            : "bg-white border-b border-transparent",
        )}
      >
        <div
          className={cn(CONTAINER, "h-full flex items-center justify-between")}
        >
          <div className="flex items-center gap-8 md:gap-14">
            <Link
              href={ROUTES.HOME}
              className="text-[22px] font-black tracking-tight text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded-sm"
            >
              Kwon<span className="text-accent">5700</span>
            </Link>
            <nav className="hidden md:block">
              <ul className="flex gap-7 text-[15px]">
                <li>
                  <Link
                    href={ROUTES.HOME}
                    aria-current={isBlogActive ? "page" : undefined}
                    className={navLinkClass(isBlogActive)}
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <a
                    href={EXTERNAL_LINKS.PORTFOLIO}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={navLinkClass(false)}
                  >
                    Portfolio
                  </a>
                </li>
              </ul>
            </nav>
          </div>

          {/* 로딩 중에도 폭을 유지해 레이아웃 시프트 방지 */}
          <div className="hidden md:flex items-center justify-end min-w-44">
            {!isLoading &&
              (isLoggedIn ? (
                <div className="flex items-center gap-2">
                  {canWrite && (
                    <Link
                      href={ROUTES.WRITE}
                      className="flex items-center gap-1.5 px-3 py-2 text-sm text-accent hover:bg-accent-soft rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                    >
                      <IconPencil size={17} />
                      글쓰기
                    </Link>
                  )}
                  <Link
                    href={ROUTES.PROFILE}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm text-muted hover:text-ink hover:bg-wash rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                  >
                    <IconUser size={17} />
                    {user?.username}
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <Link
                    href={ROUTES.LOGIN}
                    className="px-3.5 py-2 text-sm text-muted hover:text-ink rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                  >
                    로그인
                  </Link>
                  <Link
                    href={ROUTES.REGISTER}
                    className="px-3.5 py-2 text-sm text-white bg-accent rounded-lg hover:bg-accent-deep transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2"
                  >
                    회원가입
                  </Link>
                </div>
              ))}
          </div>

          <button
            type="button"
            onClick={() => setIsMenuOpen((v) => !v)}
            aria-label={isMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={isMenuOpen}
            className="md:hidden p-2 -mr-2 text-muted hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded-lg"
          >
            {isMenuOpen ? <IconX size={24} /> : <IconMenu2 size={24} />}
          </button>
        </div>
      </header>

      {isMenuOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 top-18 bg-black/25 z-30"
            onClick={closeMenu}
            aria-hidden="true"
          />
          <div className="menu-panel md:hidden fixed top-18 left-0 right-0 bg-white border-b border-line py-5 px-5 flex flex-col gap-4 z-40">
            <nav>
              <ul className="flex flex-col gap-1 text-[15px]">
                <li>
                  <Link
                    href={ROUTES.HOME}
                    onClick={closeMenu}
                    aria-current={isBlogActive ? "page" : undefined}
                    className={cn(
                      "block px-3 py-2.5 rounded-lg transition-colors",
                      isBlogActive
                        ? "text-ink font-medium bg-wash"
                        : "text-muted hover:text-ink hover:bg-wash",
                    )}
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <a
                    href={EXTERNAL_LINKS.PORTFOLIO}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={closeMenu}
                    className="block px-3 py-2.5 rounded-lg text-muted hover:text-ink hover:bg-wash transition-colors"
                  >
                    Portfolio
                  </a>
                </li>
              </ul>
            </nav>

            {!isLoading && (
              <div className="pt-4 border-t border-line">
                {isLoggedIn ? (
                  <div className="flex flex-col gap-1">
                    {canWrite && (
                      <Link
                        href={ROUTES.WRITE}
                        onClick={closeMenu}
                        className="flex items-center gap-2 px-3 py-2.5 text-sm text-accent hover:bg-accent-soft rounded-lg transition-colors"
                      >
                        <IconPencil size={18} />
                        글쓰기
                      </Link>
                    )}
                    <Link
                      href={ROUTES.PROFILE}
                      onClick={closeMenu}
                      className="flex items-center gap-2 px-3 py-2.5 text-sm text-muted hover:text-ink hover:bg-wash rounded-lg transition-colors"
                    >
                      <IconUser size={18} />
                      {user?.username}
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link
                      href={ROUTES.LOGIN}
                      onClick={closeMenu}
                      className="px-4 py-2.5 text-sm text-center text-body border border-line rounded-lg hover:bg-wash transition-colors"
                    >
                      로그인
                    </Link>
                    <Link
                      href={ROUTES.REGISTER}
                      onClick={closeMenu}
                      className="px-4 py-2.5 text-sm text-center text-white bg-accent rounded-lg hover:bg-accent-deep transition-colors"
                    >
                      회원가입
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default Header;
