"use client";

import { Sun, Moon, Info, Truck, Fuel, Ticket } from "lucide-react";
import DashboardLayout from "@/app/dashboard-layout";
import { useTheme } from "@/hooks/useTheme";

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <DashboardLayout>
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Application configuration and preferences
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 divide-y divide-gray-200 dark:divide-gray-800">
          <div className="px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {theme === "dark" ? (
                  <Moon className="w-5 h-5 text-blue-500" />
                ) : (
                  <Sun className="w-5 h-5 text-yellow-500" />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Appearance</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Switch between light and dark mode
                  </p>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  theme === "dark" ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    theme === "dark" ? "translate-x-6" : ""
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="px-6 py-5">
            <div className="flex items-center gap-3 mb-4">
              <Info className="w-5 h-5 text-gray-400" />
              <p className="text-sm font-medium text-gray-900 dark:text-white">Business Rules</p>
            </div>
            <div className="space-y-3 ml-8">
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <Truck className="w-4 h-4 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-900 dark:text-white">Fuel Rate</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">$0.25 (0-3km) | $0.50 (3-9.9km) | $0.75 (10km+)</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <Ticket className="w-4 h-4 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-900 dark:text-white">Motor Ticket Cost</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">$0.50 per trip (default)</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <Fuel className="w-4 h-4 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-900 dark:text-white">Total Cost Formula</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Fuel Cost + Ticket Cost</p>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-5">
            <div className="flex items-center gap-3 mb-3">
              <Info className="w-5 h-5 text-gray-400" />
              <p className="text-sm font-medium text-gray-900 dark:text-white">Keyboard Shortcuts</p>
            </div>
            <div className="ml-8 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Save form</span>
                <kbd className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600">
                  Ctrl+S
                </kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Close dialog</span>
                <kbd className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600">
                  Esc
                </kbd>
              </div>
            </div>
          </div>

          <div className="px-6 py-5">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Mission Form Management System v1.0.0
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
