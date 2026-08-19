export type ProductFormExtraPriceValue = {
    label: string
    price: number | string
}

export type ProductFormUnitValue = {
    unitId: number | string
    importPrice?: number | string
    sellPrice: number | string
    vatPercent?: number | string
    extraPrices?: ProductFormExtraPriceValue[]
}

export type ProductFormValues = Omit<CreateProductPayload, 'units' | 'images'> & {
    units?: ProductFormUnitValue[]
}

export const validatePositiveNumber = (_: unknown, value?: number | string) => {
    if (value === undefined || value === null || value === '') {
        return Promise.reject(new Error('Required'))
    }

    if (Number(value) > 0) {
        return Promise.resolve()
    }

    return Promise.reject(new Error('Value must be greater than 0'))
}

export const validateVatPercent = (_: unknown, value?: number | string) => {
    if (value === undefined || value === null || value === '') {
        return Promise.resolve()
    }

    const numericValue = Number(value)
    if (numericValue >= 0 && numericValue <= 100) {
        return Promise.resolve()
    }

    return Promise.reject(new Error('VAT must be between 0 and 100'))
}

export const normalizeProductFormValues = (raw: ProductFormValues): CreateProductPayload => ({
    ...raw,
    units: raw.units?.map((unit) => ({
        ...unit,
        unitId: Number(unit.unitId),
        importPrice: unit.importPrice === undefined || unit.importPrice === null || unit.importPrice === '' ? 0 : Number(unit.importPrice),
        sellPrice: Number(unit.sellPrice),
        vatPercent: Number(unit.vatPercent || 0),
        extraPrices: unit.extraPrices?.map((extraPrice) => ({
            label: extraPrice.label,
            price: Number(extraPrice.price),
        })),
    })),
})

export const formatAmount = (value?: number, locale?: string) =>
    new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
        maximumFractionDigits: 2,
    }).format(value || 0)
