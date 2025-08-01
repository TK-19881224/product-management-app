// Sidebar.tsx
import React from "react";

type SidebarProps = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
};

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  return (
    <nav className="w-64 bg-gray-100 p-4 flex flex-col space-y-2">
      {[
        { id: "create", label: "商品追加" },
        { id: "basic", label: "基本情報" },
        { id: "pricing", label: "価格・在庫" },
        { id: "supply", label: "仕入れ情報" },
        { id: "production", label: "生産・製造情報" },
        { id: "logistics", label: "ロジスティクス" },
        { id: "admin", label: "管理・運用" },
      ].map(({ id, label }) => (
        <button
          key={id}
          className={`text-left px-4 py-2 rounded ${
            activeTab === id ? "bg-blue-600 text-white" : "hover:bg-gray-200"
          }`}
          onClick={() => setActiveTab(id)}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}