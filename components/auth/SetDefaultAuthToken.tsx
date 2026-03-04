"use client";

import { useEffect } from "react";
import configs from "@/constants/config";
import Cookies from "js-cookie";

export function SetDefaultAuthToken() {
  useEffect(() => {
    const defaultToken = configs.DEFAULT_AUTH_TOKEN?.trim();
    if (defaultToken) {
      Cookies.set("token", defaultToken);
    }
  }, []);
  return null;
}
