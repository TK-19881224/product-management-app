"use client";

import "./i18n";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import Sidebar from "./Sidebar";
import ProductList from "./ProductList";
import ProductForm from "./ProductForm";
import InventoryPricing from "./InventoryPricing";
import SupplyInfo from "./SupplyInfo";
import ProductionInfo from "./ProductionInfo";
import LogisticsInfo from "./LogisticsInfo";
import AdminInfo from "./AdminInfo";
import LanguageSwitcher from "./LanguageSwitcher";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("create");
  const [searchKeyword, setSearchKeyword] = useState("");
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 p-8 max-w-5xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">
            {t("dashboardTitle")}
          </h1>

          <div className="flex items-center gap-4">
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="border border-gray-300 px-4 py-2 rounded w-64"
            />

            {/* 言語切り替えボタン */}
            <LanguageSwitcher />
          </div>
        </header>

        {activeTab === "create" && (
          <Section title={t("createProduct")}>
            <ProductForm />
          </Section>
        )}

        {activeTab === "basic" && (
          <Section title={t("section.basicInfo")}>
            <ProductList searchKeyword={searchKeyword} />
          </Section>
        )}

        {activeTab === "pricing" && (
          <Section title={t("section.pricingInfo")}>
            <InventoryPricing searchKeyword={searchKeyword} />
          </Section>
        )}

        {activeTab === "supply" && (
          <Section title={t("section.supplyInfo")}>
            <SupplyInfo searchKeyword={searchKeyword} />
          </Section>
        )}

        {activeTab === "production" && (
          <Section title={t("section.productionInfo")}>
            <ProductionInfo searchKeyword={searchKeyword} />
          </Section>
        )}

        {activeTab === "logistics" && (
          <Section title={t("section.logisticsInfo")}>
            <LogisticsInfo searchKeyword={searchKeyword} />
          </Section>
        )}

        {activeTab === "admin" && (
          <Section title={t("section.adminInfo")}>
            <AdminInfo searchKeyword={searchKeyword} />
          </Section>
        )}
      </main>
    </div>
  );
}

// 共通セクションラッパー
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white p-6 rounded-xl shadow-md mb-10 border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">{title}</h2>
      {children}
    </section>
  );
}