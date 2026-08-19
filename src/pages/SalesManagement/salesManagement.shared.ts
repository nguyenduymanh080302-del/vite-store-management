import { ORDER_STATUS } from '@/utils/enum'

export const statusColorMap: Record<ORDER_STATUS, string> = {
    [ORDER_STATUS.PENDING]: 'gold',
    [ORDER_STATUS.CANCELED]: 'red',
    [ORDER_STATUS.DELIVERING]: 'cyan',
    [ORDER_STATUS.DONE]: 'green',
}

export const formatAmount = (value?: number, locale?: string) =>
    new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
        maximumFractionDigits: 2,
    }).format(value || 0)
