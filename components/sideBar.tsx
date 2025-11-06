"use client";

import { logoutAction } from "@/app/action/auth";
import {
  FlaskConical,
  Home,
  LogOutIcon,
  PanelLeftClose,
  PanelLeftOpen,
  BadgeDollarSign,
} from "lucide-react";
import { useState } from "react";
import { twMerge } from "tailwind-merge";
import CustomTooltip from "./tooltip/customTooltip";
import { Button } from "./ui/button";
import Link from "next/link";

function SideBar() {
  const [isOpen, setIsOpen] = useState(true);

  const handleToggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div
      id="sidebar"
      className={twMerge(
        "flex flex-col h-full bg-gray-950 text-white py-4 transition-all",
        isOpen ? "w-80" : "w-20"
      )}
    >
      <div className="flex h-fit justify-between items-center mb-10 px-4 py-2">
        {isOpen && <p className="text-xl font-bold ">Portfolio Visualizer</p>}

        <Button
          onClick={handleToggleSidebar}
          variant={"ghost"}
          className={twMerge(
            "my-auto size-8 p-0 has-[>svg]:px-0 cursor-pointer hover:text-black",
            !isOpen && "mx-auto"
          )}
        >
          {isOpen ? (
            <PanelLeftClose className="size-6" />
          ) : (
            <PanelLeftOpen className="size-6" />
          )}
        </Button>
      </div>

      <nav className={"flex flex-col gap-2 font-semibold px-2"}>
        <Link
          href="/"
          className={twMerge(
            "flex w-full h-fit items-center gap-2 p-2 rounded-lg hover:bg-gray-800 cursor-pointer",
            !isOpen && "justify-center"
          )}
        >
          <CustomTooltip content={<p>Home</p>} disable={isOpen}>
            <div className="flex items-center gap-2 cursor-pointer">
              <Home />
              <div className={twMerge("text-white", !isOpen && "sr-only")}>
                Home
              </div>
            </div>
          </CustomTooltip>
        </Link>

        <Link
          href="/portfolio"
          className={twMerge(
            "flex w-full h-fit items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-800 cursor-pointer",
            !isOpen && "justify-center"
          )}
        >
          <CustomTooltip content={<p>포트폴리오</p>} disable={isOpen}>
            <div className="flex items-center gap-2 cursor-pointer">
              <FlaskConical />
              <div className={twMerge("text-white", !isOpen && "sr-only")}>
                포트폴리오
              </div>
            </div>
          </CustomTooltip>
        </Link>

        <Link
          href={"/market"}
          className={twMerge(
            "flex w-full h-fit items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-800 cursor-pointer",
            !isOpen && "justify-center"
          )}
        >
          <CustomTooltip content={<p>시장분석</p>} disable={isOpen}>
            <div className="flex items-center gap-2 cursor-pointer">
              <BadgeDollarSign />
              <div className={twMerge("text-white", !isOpen && "sr-only")}>
                시장분석
              </div>
            </div>
          </CustomTooltip>
        </Link>
      </nav>
      <form action={logoutAction} className="mt-auto ml-auto px-4">
        <Button
          type="submit"
          variant={"ghost"}
          className={twMerge(
            "my-auto size-8 p-0 has-[>svg]:px-0 cursor-pointer hover:text-black",
            !isOpen && "mx-auto"
          )}
        >
          <LogOutIcon />
        </Button>
      </form>
    </div>
  );
}

export default SideBar;
