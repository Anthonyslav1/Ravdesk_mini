"use client";

import React from "react";
import NextLink from "next/link";
import { useRouter, usePathname } from "next/navigation";

// Map legacy routes to Next routes where names differ
function mapPath(p?: string) {
  if (!p) return "/";
  if (p === "/home") return "/";
  if (p === "/landing") return "/";
  if (p === "/dashboard") return "/";
  return p;
}

// Minimal Link compatible with react-router-dom's API
export function Link({ to, href, children, className, onClick, ...rest }: any) {
  const h = mapPath((to ?? href) as string);
  return (
    <NextLink href={h} className={className} onClick={onClick} {...rest}>
      {children}
    </NextLink>
  );
}

// NavLink with isActive support for className function pattern
export function NavLink({ to, href, className, children, ...rest }: any) {
  const pathname = usePathname();
  const h = mapPath((to ?? href) as string);
  const isActive = pathname === h;
  const cls = typeof className === "function" ? className({ isActive }) : className;
  return (
    <NextLink href={h} className={cls} {...rest}>
      {children}
    </NextLink>
  );
}

export function useNavigate() {
  const router = useRouter();
  return React.useCallback((to: string) => router.push(mapPath(to)), [router]);
}

export function useLocation() {
  const pathname = usePathname();
  return { pathname } as { pathname: string };
}

export function BrowserRouter({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

// No-op helpers to satisfy potential imports
export const Routes = ({ children }: any) => <>{children}</>;
export const Route = ({ children }: any) => <>{children}</>;

export default { Link, NavLink, useNavigate, useLocation, BrowserRouter, Routes, Route };
