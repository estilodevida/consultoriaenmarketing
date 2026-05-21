"use client";

import { useEffect, useState } from "react";

interface Banner {
  desktop_url: string;
  mobile_url: string;
  target: "affiliate" | "client";
  active: boolean;
  created_at: string;
}

interface Props {
  target: "affiliate" | "client";
}

export function BannerDisplay({ target }: Props) {
  const [banner, setBanner] = useState<Banner | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    fetch("/api/banners")
      .then((res) => res.json())
      .then((data) => {
        const found = data.banners?.find((b: Banner) => b.target === target);
        setBanner(found || null);
      })
      .catch(() => setBanner(null));
  }, [target]);

  if (!banner) return null;

  const imageUrl = isMobile ? banner.mobile_url : banner.desktop_url;

  return (
    <div className="relative w-full overflow-hidden bg-black">
      <picture>
        <source media="(max-width: 767px)" srcSet={banner.mobile_url} />
        <img
          src={banner.desktop_url}
          alt="Banner"
          className="w-full h-auto object-cover"
          style={{
            maxHeight: isMobile ? "100dvh" : undefined,
            minHeight: isMobile ? "100dvh" : undefined,
            width: "100%",
            display: "block",
          }}
        />
      </picture>
    </div>
  );
}
