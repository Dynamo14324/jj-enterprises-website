"use client"

import { useCurrency, Currency } from "@/lib/currency-context"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export function CurrencySelector() {
    const { currency, setCurrency } = useCurrency()

    return (
        <Select value={currency} onValueChange={(val: Currency) => setCurrency(val)}>
            <SelectTrigger className="w-[80px] h-8 text-xs bg-white/50 border-orange-200 text-gray-700">
                <SelectValue placeholder="Currency" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="INR">INR (₹)</SelectItem>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="AED">AED (Dh)</SelectItem>
            </SelectContent>
        </Select>
    )
}
