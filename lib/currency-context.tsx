"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

export type Currency = "INR" | "USD" | "AED"

interface CurrencyContextType {
    currency: Currency
    setCurrency: (currency: Currency) => void
    formatPrice: (price: number) => string
    exchangeRates: Record<Currency, number>
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
    const [currency, setCurrency] = useState<Currency>("INR")

    // Exchange rates relative to INR
    const exchangeRates = {
        INR: 1,
        USD: 0.012,
        AED: 0.044,
    }

    const formatPrice = (price: number) => {
        const value = price * exchangeRates[currency]
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency,
            maximumFractionDigits: 2,
        }).format(value)
    }

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, exchangeRates }}>
            {children}
        </CurrencyContext.Provider>
    )
}

export function useCurrency() {
    const context = useContext(CurrencyContext)
    if (!context) {
        throw new Error("useCurrency must be used within a CurrencyProvider")
    }
    return context
}
