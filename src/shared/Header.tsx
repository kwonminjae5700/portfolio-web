"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconUser,
  IconPencil,
  IconMenu2,
  IconX,
} from "@tabler/icons-react";
import { useAuth } from "@/contexts/AuthContext";
import { ROUTES, EXTERNAL_LINKS } from "@/lib/constants";

const Header = () => {
  const { user, isLoggedIn, isLoading, canWrite } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      <header className="w-full h-18 px-6 sm:px-12 md:px-24 lg:px-48 xl:px-78 flex justify-between items-center fixed top-0 bg-white z-50 border-b border-gray-300 transition-all duration-300">
        <div className="flex space-x-8 md:space-x-20 items-center">
          <Link href={ROUTES.HOME} className="text-2xl font-bold">
            Kwon5700
          </Link>
          <nav className="hidden md:block">
            <ul className="flex space-x-8 text-base md:text-[18px] text-gray-400">
              <li>
                <a
                  href={EXTERNAL_LINKS.PORTFOLIO}
                  target="_blank"
                  className="hover:underline"
                >
                  Portfolio
                </a>
              </li>
              <li>
                <Link href={ROUTES.HOME} className="hover:underline">
                  Blog
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="hidden md:flex items-center gap-4">
          {!isLoading && (
            <>
              {isLoggedIn ? (
                <div className="flex items-center gap-3 ml-4">
                  {canWrite && (
                    <Link
                      href={ROUTES.WRITE}
                      className="flex items-center gap-1 px-3 py-2 text-sm text-mainBlue hover:bg-gray-100 rounded-lg transition"
                    >
                      <IconPencil size={18} />
                      글쓰기
                    </Link>
                  )}
                  <Link
                    href={ROUTES.PROFILE}
                    className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
                  >
                    <IconUser size={18} />
                    {user?.username}
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-2 ml-4">
                  <Link
                    href={ROUTES.LOGIN}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition"
                  >
                    로그인
                  </Link>
                  <Link
                    href={ROUTES.REGISTER}
                    className="px-4 py-2 text-sm text-white bg-mainBlue rounded-lg hover:bg-blue-600 transition"
                  >
                    회원가입
                  </Link>
                </div>
              )}
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsMenuOpen((v) => !v)}
          aria-label={isMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={isMenuOpen}
          className="md:hidden p-2 -mr-2 text-gray-600 hover:text-gray-900 transition"
        >
          {isMenuOpen ? <IconX size={24} /> : <IconMenu2 size={24} />}
        </button>
      </header>

      {isMenuOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 top-18 bg-black/20 z-30"
            onClick={closeMenu}
            aria-hidden="true"
          />
          <div className="md:hidden fixed top-18 left-0 right-0 bg-white border-b border-gray-300 py-6 px-6 flex flex-col gap-5 z-40">
            <nav>
              <ul className="flex flex-col gap-4 text-base text-gray-500">
                <li>
                  <a
                    href={EXTERNAL_LINKS.PORTFOLIO}
                    target="_blank"
                    onClick={closeMenu}
                    className="block hover:text-gray-900 transition"
                  >
                    Portfolio
                  </a>
                </li>
                <li>
                  <Link
                    href={ROUTES.HOME}
                    onClick={closeMenu}
                    className="block hover:text-gray-900 transition"
                  >
                    Blog
                  </Link>
                </li>
              </ul>
            </nav>

            {!isLoading && (
              <div className="pt-4 border-t border-gray-200">
                {isLoggedIn ? (
                  <div className="flex flex-col gap-2">
                    {canWrite && (
                      <Link
                        href={ROUTES.WRITE}
                        onClick={closeMenu}
                        className="flex items-center gap-2 px-3 py-2.5 text-sm text-mainBlue hover:bg-gray-100 rounded-lg transition"
                      >
                        <IconPencil size={18} />
                        글쓰기
                      </Link>
                    )}
                    <Link
                      href={ROUTES.PROFILE}
                      onClick={closeMenu}
                      className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
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
                      className="px-4 py-2.5 text-sm text-center text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                      로그인
                    </Link>
                    <Link
                      href={ROUTES.REGISTER}
                      onClick={closeMenu}
                      className="px-4 py-2.5 text-sm text-center text-white bg-mainBlue rounded-lg hover:bg-blue-600 transition"
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
