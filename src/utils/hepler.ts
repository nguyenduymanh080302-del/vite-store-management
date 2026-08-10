import { managementRoutes } from "@/router/routeConfig";

export type FileLike = Blob | File;

// -------------------- Functions --------------------

// Convert a File/Blob to Base64 (client-side)
export const getBase64 = (file: FileLike): Promise<string | ArrayBuffer | null> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
};

// Remove Vietnamese tones from a string
export const removeCharactersTone = (str: string): string => {
    str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    // Some systems encode Vietnamese combining accents as individual UTF-8 characters
    str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // Huyền sắc hỏi ngã nặng
    str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // Â, Ê, Ă, Ơ, Ư
    return str;
};

export const generatePathFromName = (name: string) => {
    return name
        .toLowerCase()
        .normalize("NFD") // tách dấu tiếng Việt
        .replace(/[\u0300-\u036f]/g, "") // xóa dấu
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9\s-]/g, "") // bỏ ký tự đặc biệt
        .trim()
        .replace(/\s+/g, "-"); // thay khoảng trắng bằng -
};

export const pick = <T extends object, K extends keyof T>(object: T, keys: K[]): Pick<T, K> => {
    const pickedObject: Pick<T, K> = {} as Pick<T, K>;

    keys.forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(object, key)) {
            pickedObject[key] = object[key];
        }
    });

    return pickedObject;
};

export const omit = <T extends object, K extends keyof T>(object: T, keys: K[]): Pick<T, K> => {
    const newObj: Pick<T, K> = {} as Pick<T, K>;

    Object.keys(object).forEach((key) => {
        if (!keys.includes(key as K)) {
            newObj[key as K] = object[key as K];
        }
    });

    return newObj;
};

export const getDefaultManagementRoute = (
    permissions: string[] = []
) => {
    return managementRoutes.find(route =>
        route.permission && permissions.includes(route.permission)
    );
};

export const normalizeSpace = (value?: string) => {
    if (!value) return value;

    return value.replace(/\s+/g, ' ')
};

export const normalizeSlug = (value?: string) => {
    if (!value) return value;

    return value
        .toLowerCase()
        .replace(/\s+/g, '-')        // space → dash
        .replace(/[^a-z0-9-]/g, '')  // remove invalid chars
        .replace(/-+/g, '-')         // no double dashes
        .replace(/^-+|-+$/g, '');    // trim dashes
};

export const formatAmount = (value: number, locale?: string) =>
    new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
        maximumFractionDigits: 2,
    }).format(value || 0)

