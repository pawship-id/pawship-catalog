"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  ShoppingCart,
  User,
  ChevronDown,
  Heart,
  Package,
  LogOut,
  Settings,
  Menu,
  X,
} from "lucide-react";

export default function NavigationHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const navigation = [
    { name: "Home", href: "/" },
    {
      name: "Our Collections",
      href: "/our-collections",
      subItems: [
        {
          name: "Collections",
          subItems: ["Bibs/Collar", "Harness", "Costume", "Basic"],
        },
        {
          name: "New Arrivals",
          href: "/",
        },
        {
          name: "Limited Stocks",
          href: "/",
        },
        {
          name: "Best Sellers",
          href: "/",
        },
        {
          name: "Sale",
          href: "/",
        },
      ],
    },
    {
      name: "Reseller",
      href: "/reseller",
      subItems: [
        { name: "Partners Program", href: "/" },
        { name: "White Labeling", href: "/" },
      ],
    },
    { name: "About Us", href: "/about-us" },
    { name: "Contact Us", href: "/contact-us" },
    { name: "FAQ", href: "/faq" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Announcement Bar */}
      <div className="bg-primary text-primary-foreground text-center py-2 text-sm">
        <p>
          Join our Telegram and unlock exclusive access to member-only pricing!
          <Button
            variant="link"
            className="text-primary-foreground underline p-0 ml-1 h-auto"
          >
            Join Now
          </Button>
        </p>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/images/transparent-logo-2.png"
              alt="Pawship"
              width={120}
              height={40}
              className="h-10 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            {navigation.map((item, idx) => (
              <Fragment key={idx}>
                {item.subItems ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center space-x-1 text-foreground hover:text-primary transition-colors relative group py-3">
                      <span>{item.name}</span>
                      <ChevronDown className="h-4 w-4" />
                      <span
                        className={`absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full`}
                      ></span>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent className="w-38">
                      {item.subItems.map((subItem, idx) => (
                        <Fragment key={idx}>
                          {subItem.subItems ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger className="flex items-center justify-between w-full px-2 py-1.5 text-sm hover:bg-accent rounded-sm">
                                <span>{subItem.name}</span>
                                <ChevronDown className="h-4 w-4" />
                              </DropdownMenuTrigger>

                              <DropdownMenuContent
                                className="w-full"
                                side="right"
                              >
                                {subItem.subItems.map((subItem, idx) => (
                                  <DropdownMenuItem asChild key={idx}>
                                    <Link href="/collections/bibs-collar">
                                      {subItem}
                                    </Link>
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : (
                            <DropdownMenuItem asChild key={idx}>
                              <Link href="/collections/costume">
                                {subItem.name}
                              </Link>
                            </DropdownMenuItem>
                          )}
                        </Fragment>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link
                    href="/"
                    className="text-foreground hover:text-primary transition-colors relative group py-3"
                  >
                    {item.name}
                    <span
                      className={`absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full`}
                    ></span>
                  </Link>
                )}
              </Fragment>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center">
            {/* Location */}
            <div className="hidden md:flex">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-1"
                  >
                    <span className="text-sm font-medium">IDR | Indonesia</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48" align="end">
                  <DropdownMenuItem>SGD | Singapore</DropdownMenuItem>
                  <DropdownMenuItem>USD | United State</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Search */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center space-x-2"
            >
              <Search className="h-4 w-4" />
            </Button>

            {/* Profile/Login */}
            {/* <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-1"
                >
                  <User className="h-4 w-4" />
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48" align="end">
                <DropdownMenuItem asChild>
                  <Link
                    href="/dashboard"
                    className="flex items-center space-x-2"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/orders" className="flex items-center space-x-2">
                    <Package className="h-4 w-4" />
                    <span>Orders</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/wishlist"
                    className="flex items-center space-x-2"
                  >
                    <Heart className="h-4 w-4" />
                    <span>Wishlist</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/logout" className="flex items-center space-x-2">
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu> */}
            <Button variant="ghost" size="sm" className="relative" asChild>
              <Link href="/">
                <User className="h-4 w-4" />
              </Link>
            </Button>

            {/* Cart */}
            <Button variant="ghost" size="sm" className="relative" asChild>
              <Link href="/cart">
                <ShoppingCart className="h-4 w-4" />
                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  3
                </Badge>
              </Link>
            </Button>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t py-4">
            <nav className="flex flex-col space-y-4">
              {navigation.map((item, idx) => (
                <Fragment key={idx}>
                  {item.subItems ? (
                    <div className="space-y-2">
                      <p className="font-medium text-foreground">{item.name}</p>
                      {item.subItems.map((subItem, idx) => (
                        <div className="pl-4 space-y-2" key={idx}>
                          {subItem.subItems ? (
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-muted-foreground">
                                {subItem.name}
                              </p>
                              <div className="pl-4 space-y-1">
                                {subItem.subItems.map((subItem, idx) => (
                                  <Link
                                    href="/collections/bibs-collar"
                                    className="block text-xs text-muted-foreground hover:text-primary"
                                    key={idx}
                                  >
                                    {subItem}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <Link
                              href="/white-labeling"
                              className="block text-sm text-muted-foreground hover:text-primary"
                            >
                              {subItem.name}
                            </Link>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Link
                      href="/"
                      className="text-foreground hover:text-primary transition-colors relative"
                    >
                      {item.name}
                    </Link>
                  )}
                </Fragment>
              ))}
            </nav>

            <div className="md:hidden mt-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center "
                  >
                    <span className="text-sm font-medium">IDR | Indonesia</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48" align="start">
                  <DropdownMenuItem>SGD | Singapore</DropdownMenuItem>
                  <DropdownMenuItem>USD | United State</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )}
      </div>

      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
          <div className="container mx-auto px-4 pt-20">
            <div className="max-w-4xl mx-auto">
              <div className="relative bg-white rounded-full shadow-lg border-2 border-gray-200">
                <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6" />
                <Input
                  type="search"
                  placeholder="Enter Product Name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-16 pr-20 py-6 text-lg w-full border-0 bg-transparent rounded-full focus:ring-0 focus:outline-none placeholder:text-gray-400"
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="lg"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full bg-gray-100 hover:bg-gray-200 p-3"
                >
                  <Search className="h-6 w-6 text-gray-600" />
                </Button>
              </div>

              <div className="mt-16 text-center">
                <div className="mb-4">
                  <Search className="h-16 w-16 text-gray-300 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  You have not searched anything yet
                </h3>
                <p className="text-gray-500">
                  Start typing a product name in the input
                </p>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSearchOpen(false)}
                className="absolute top-4 right-4 rounded-full p-2"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
