"use client"

import Link from "next/link"
import { FC } from "react"
import { ChatbotUISVG } from "../icons/chatbotui-svg"
import Image from "next/image"

interface BrandProps {
  theme?: "dark" | "light"
}

const appName = process.env.NEXT_PUBLIC_WHITE_LABEL_APP_NAME
const appUrl = process.env.NEXT_PUBLIC_WHITE_LABEL_APP_URL || ""
const appLogo = process.env.NEXT_PUBLIC_WHITE_LABEL_LOGO || ""

export const Brand: FC<BrandProps> = ({ theme = "dark" }) => {
  return (
    <Link
      className="flex cursor-pointer flex-col items-center hover:opacity-50"
      href={appUrl}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="mb-2">
        <Image src={appLogo} alt="logo" width="128" height="128" />
      </div>

      <div className="text-4xl font-bold tracking-wide">{appName}</div>
    </Link>
  )
}

/*
        <!--<ChatbotUISVG theme={theme === "dark" ? "dark" : "light"} scale={0.3} />-->
*/
