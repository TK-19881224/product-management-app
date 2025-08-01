"use client";

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { productConverter } from "@/lib/productConverter";
import { ProductData } from "@/types/product";
import Pagination from "./Pagination";

type Props = {
  searchKeyword: string;
};

type SortKey = "supplierCompany" | "supplier" | "purchasePlace" | "purchaseDate" | "lotNumber";
type SortDirection = "asc" | "desc";

export default function SupplyInfo({ searchKeyword = "" }: Props) {
  const { t } = useTranslation();

  const [products, setProducts] = useState<ProductData[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey | null;
    direction: SortDirection;
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

  const filteredProducts = products.filter((product) =>
    [
      product.supplierCompany,
      product.supplier,
      product.purchasePlace,
      product.purchaseDate?.toString(),
      product.lotNumber,
    ]
      .map((field) => (field ?? "").toLowerCase())
      .some((field) => field.includes(keyword))
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const key = sortConfig.key;
    if (!key) return 0;

    let aVal: any = a[key];
    let bVal: any = b[key];

    if (key === "purchaseDate") {
      aVal = aVal ? new Date(aVal).getTime() : 0;
      bVal = bVal ? new Date(bVal).getTime() : 0;
    }

    aVal = aVal ?? "";
    bVal = bVal ?? "";

    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
    }

    return sortConfig.direction === "asc"
      ? aVal.toString().localeCompare(bVal.toString())
      : bVal.toString().localeCompare(aVal.toString());
  });

  const handleSort = (key: SortKey) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const renderSortHeader = (labelKey: keyof ProductData, sortKey: SortKey) => (
    <th
      onClick={() => handleSort(sortKey)}
      className="p-2 border cursor-pointer hover:bg-gray-200"
    >
      {t(`supply.${labelKey}`)}
      {sortConfig.key === sortKey
        ? sortConfig.direction === "asc"
          ? " ▲"
          : " ▼"
        : ""}
    </th>
  );

  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const currentItems = sortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="bg-gray-100 text-sm text-gray-700">
            {renderSortHeader("supplierCompany", "supplierCompany")}{/* 仕入れ会社名 */}
            {renderSortHeader("supplier", "supplier")}{/* 担当者名 */}
            {renderSortHeader("purchasePlace", "purchasePlace")}{/* 仕入れ場所 */}
            {renderSortHeader("purchaseDate", "purchaseDate")}{/* 仕入れ日 */}
            {renderSortHeader("lotNumber", "lotNumber")}{/* ロット番号 */}
          </tr>
        </thead>
        <tbody>
          {currentItems.map((item, index) => (
            <tr key={index} className="text-sm">
              <td className="p-2 border">{item.supplierCompany}</td>
              <td className="p-2 border">{item.supplier}</td>
              <td className="p-2 border">{item.purchasePlace}</td>
              <td className="p-2 border">
                {item.purchaseDate
                  ? new Date(item.purchaseDate).toLocaleDateString()
                  : "-"}
              </td>
              <td className="p-2 border">{item.lotNumber}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </>
  );
}