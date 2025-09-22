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
import { Badge } from "@/components/ui/badge";
import {
  Search,
  ShoppingCart,
  User,
  ChevronDown,
  Menu,
  X,
  ChevronRight,
  Heart,
} from "lucide-react";
import SearchBar from "@/components/search-bar";
import { useCurrency } from "@/context/CurrencyContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export default function NavigationHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedItems, setExpandedItems] = useState<{
    [key: number]: boolean;
  }>({});
  const [expandedSubItems, setExpandedSubItems] = useState<{
    [key: string]: boolean;
  }>({});

  const { currency, setCurrency, loading } = useCurrency();

  const navigation = [
    { name: "Home", href: "/" },
    {
      name: "Our Collections",
      href: "/our-collections",
      subItems: [
        {
          name: "Collections",
          subItems: [
            {
              name: "Bibs/Collar",
              href: `/catalog/${encodeURIComponent("bibs/collar")}`, // encode to "bibs%2Fcollar"
            },
            {
              name: "Harness",
              href: "/catalog/harness",
            },
            {
              name: "Costume",
              href: "/catalog/custome",
            },
            {
              name: "Basic",
              href: "/catalog/basic",
            },
          ],
        },
        {
          name: "New Arrivals",
          href: "/catalog/new-arrivals",
        },
        {
          name: "Limited Stocks",
          href: "/catalog/limited-stocks",
        },
        {
          name: "Best Sellers",
          href: "/catalog/best-sellers",
        },
        {
          name: "Sale",
          href: "/catalog/sale",
        },
      ],
    },
    {
      name: "Reseller",
      href: "/reseller",
      subItems: [
        { name: "Partners Program", href: "/reseller" },
        { name: "White Labeling", href: "/reseller/white-labeling" },
      ],
    },
    { name: "About Us", href: "/about-us" },
    { name: "Contact Us", href: "/contact-us" },
    { name: "FAQ", href: "/faq" },
    {
      name: "More",
      href: "/",
      subItems: [
        // { name: "FAQ", href: "/faq" },
        { name: "Stores", href: "/stores" },
        { name: "Payments", href: "/payments" },
        { name: "Good Cause", href: "/good-cause" },
      ],
    },
  ];

  const toggleExpandedItem = (index: number) => {
    setExpandedItems((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const toggleExpandedSubItem = (key: string) => {
    setExpandedSubItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

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
          <nav className="hidden xl:flex items-center space-x-6">
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
                                    <Link href={subItem.href}>
                                      {subItem.name}
                                    </Link>
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : (
                            <DropdownMenuItem asChild key={idx}>
                              <Link href={subItem.href}>{subItem.name}</Link>
                            </DropdownMenuItem>
                          )}
                        </Fragment>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link
                    href={item.href}
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
            <div className="hidden lg:flex">
              {loading ? (
                <p>Detecting location...</p>
              ) : (
                <div className="relative">
                  <Select
                    value={currency}
                    onValueChange={(value) => setCurrency(value as any)}
                  >
                    <SelectTrigger className="w-auto bg-transparent border-none outline-none hover:bg-accent hover:text-accent-foreground transition-colors rounded-md p-2">
                      <SelectValue placeholder="Select Currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD | United States</SelectItem>
                      <SelectItem value="IDR">IDR | Indonesia</SelectItem>
                      <SelectItem value="SGD">SGD | Singapore</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
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

            <Button variant="ghost" size="sm" className="relative" asChild>
              <Link href="/">
                <User className="h-4 w-4" />
              </Link>
            </Button>

            <Button variant="ghost" size="sm" className="relative" asChild>
              <Link href="/">
                <Heart className="h-4 w-4" />
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
              className="xl:hidden"
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
          <div className="xl:hidden border-t py-4">
            <nav className="flex flex-col space-y-2">
              {navigation.map((item, idx) => (
                <Fragment key={idx}>
                  {item.subItems ? (
                    <div className="space-y-2">
                      <button
                        onClick={() => toggleExpandedItem(idx)}
                        className="flex items-center justify-between w-full text-left font-medium text-foreground hover:text-primary transition-colors py-2"
                      >
                        <span>{item.name}</span>
                        <ChevronRight
                          className={`h-4 w-4 transition-transform ${
                            expandedItems[idx] ? "rotate-90" : ""
                          }`}
                        />
                      </button>

                      {expandedItems[idx] && (
                        <div className="pl-4 space-y-2">
                          {item.subItems.map((subItem, subIdx) => (
                            <div key={subIdx}>
                              {subItem.subItems ? (
                                <div className="space-y-2">
                                  <button
                                    onClick={() =>
                                      toggleExpandedSubItem(`${idx}-${subIdx}`)
                                    }
                                    className="flex items-center justify-between w-full text-left text-sm text-muted-foreground hover:text-primary py-1"
                                  >
                                    <span>{subItem.name}</span>
                                    <ChevronRight
                                      className={`h-3 w-3 transition-transform ${
                                        expandedSubItems[`${idx}-${subIdx}`]
                                          ? "rotate-90"
                                          : ""
                                      }`}
                                    />
                                  </button>

                                  {expandedSubItems[`${idx}-${subIdx}`] && (
                                    <div className="pl-4 space-y-1">
                                      {subItem.subItems.map(
                                        (nestedItem, nestedIdx) => (
                                          <Link
                                            href={nestedItem.href}
                                            className="block text-xs text-muted-foreground hover:text-primary py-1"
                                            key={nestedIdx}
                                          >
                                            {nestedItem.name}
                                          </Link>
                                        )
                                      )}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <Link
                                  href={subItem.href || "/"}
                                  className="block text-sm text-muted-foreground hover:text-primary py-1"
                                >
                                  {subItem.name}
                                </Link>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.href || "/"}
                      className="text-foreground hover:text-primary transition-colors py-2"
                    >
                      {item.name}
                    </Link>
                  )}
                </Fragment>
              ))}
            </nav>

            <div className="lg:hidden mt-4">
              {loading ? (
                <p>Detecting location...</p>
              ) : (
                <div className="relative">
                  <Select
                    value={currency}
                    onValueChange={(value) => setCurrency(value as any)}
                  >
                    <SelectTrigger className="w-auto bg-transparent border-none outline-none hover:bg-accent hover:text-accent-foreground transition-colors rounded-md p-2">
                      <SelectValue placeholder="Select Currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD | United States</SelectItem>
                      <SelectItem value="IDR">IDR | Indonesia</SelectItem>
                      <SelectItem value="SGD">SGD | Singapore</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Search Bar Navigation */}
      {isSearchOpen && <SearchBar setIsSearchOpen={setIsSearchOpen} />}
    </header>
  );
}
