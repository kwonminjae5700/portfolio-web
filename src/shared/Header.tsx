"use client";

import Link from "next/link";
import { IconUser, IconPencil } from "@tabler/icons-react";
import { useAuth } from "@/contexts/AuthContext";
import { ROUTES, EXTERNAL_LINKS } from "@/lib/constants";

const Header = () => {
  const { user, isLoggedIn, isLoading } = useAuth();

  return (
    <header className="w-full h-18 px-78 flex justify-between items-center fixed top-0 bg-white z-50 border-b border-gray-300">
      <div className="flex space-x-20 items-center">
        <Link href={ROUTES.HOME} className="text-2xl font-bold">
          Kwon5700
        </Link>
        <nav>
          <ul className="flex space-x-8 text-[18px] text-gray-400">
            <li>
              <a href={EXTERNAL_LINKS.PORTFOLIO} className="hover:underline">
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
      <div className="flex items-center gap-4">
        {/* <div className="border-[#d8d8d8] border-[1.3px] rounded-xs">
          <input
            className="px-3 py-2 w-56 focus:outline-none text-[14px]"
            placeholder="검색어를 입력하세요.."
            type="text"
          />
        </div>
        <button className="border-[#e0e0e0] border-l-[1.5px] pl-4">
          <IconSearch size={22} className="text-gray-400" />
        </button> */}

        {!isLoading && (
          <>
            {isLoggedIn ? (
              <div className="flex items-center gap-3 ml-4">
                <Link
                  href={ROUTES.WRITE}
                  className="flex items-center gap-1 px-3 py-2 text-sm text-mainBlue hover:bg-gray-100 rounded-lg transition"
                >
                  <IconPencil size={18} />
                  글쓰기
                </Link>
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
    </header>
  );
};

export default Header;
