"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { productConverter } from "@/lib/productConverter";
import { ProductData } from "@/types/product";
import Pagination from "./Pagination";
import { useTranslation } from "react-i18next";

type Props = {
  searchKeyword: string;
};

type SortKey = keyof ProductData | "salesPrice";

export default function InventoryPricing({ searchKeyword = "" }: Props) {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey | null;
    direction: "asc" | "desc";
  }>({ key: null, direction: "asc" });

  useEffect(() => {
    const fetchProducts = async () => {
      const ref = collection(db, "products").withConverter(productConverter);
      const snapshot = await getDocs(ref);
      const data = snapshot.docs.map((doc) => doc.data());
      setProducts(data);
    };
    fetchProducts();
  }, []);

  const keyword = searchKeyword.toLowerCase();

  const filteredProducts = products.filter((product) => {
    const price = product.price ?? 0;
    const orderUnit = product.orderUnit ?? 0;
    const salesPrice = price * orderUnit;

    return [
      product.name,
      product.price?.toString(),
      product.stock?.toString(),
      product.minStock?.toString(),
      product.orderUnit?.toString(),
      salesPrice.toString(),
    ]
      .map((field) => (field ?? "").toLowerCase())
      .some((field) => field.includes(keyword));
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const { key, direction } = sortConfig;
    if (!key) return 0;

    let aVal: any = key === "salesPrice" ? (a.price ?? 0) * (a.orderUnit ?? 0) : a[key];
    let bVal: any = key === "salesPrice" ? (b.price ?? 0) * (b.orderUnit ?? 0) : b[key];

    if (typeof aVal === "number" && typeof bVal === "number") {
      return direction === "asc" ? aVal - bVal : bVal - aVal;
    }

    const aStr = aVal?.toString() ?? "";
    const bStr = bVal?.toString() ?? "";
    return direction === "asc"
      ? aStr.localeCompare(bStr)
      : bStr.localeCompare(aStr);
  });

  const handleSort = (key: SortKey) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const renderSortHeader = (label: string, key: SortKey) => (
    <th
      onClick={() => handleSort(key)}
      className="p-2 border cursor-pointer hover:bg-gray-200"
    >
      {label}
      {sortConfig.key === key ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
    </th>
  );

  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const currentItems = sortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const { t } = useTranslation();

  return (
    <>
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="bg-gray-100 text-sm text-gray-700">
            {renderSortHeader(t("inventory.name"), "name")}{/* 商品名 */}
            {renderSortHeader(t("inventory.price"), "price")}{/* 単価（円） */}
            {renderSortHeader(t("inventory.salesPrice"), "salesPrice")}{/* 販売価格（円） */}
            {renderSortHeader(t("inventory.stock"), "stock")}{/* 在庫数 */}
            {renderSortHeader(t("inventory.minStock"), "minStock")}{/* 最低在庫数 */}
            {renderSortHeader(t("inventory.orderUnit"), "orderUnit")}{/* 発注単位 */}
          </tr>
        </thead>
        <tbody>
          {currentItems.map((item, index) => (
            <tr key={index} className="text-sm">
              <td className="p-2 border">{item.name}</td>
              <td className="p-2 border">{item.price}</td>
              <td className="p-2 border">
                {typeof item.price === "number" && typeof item.orderUnit === "number"
                  ? item.price * item.orderUnit
                  : "-"}
              </td>
              <td className="p-2 border">{item.stock}</td>
              <td className="p-2 border">{item.minStock}</td>
              <td className="p-2 border">{item.orderUnit}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ✅ テーブルの外に配置 */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </>
  );
}