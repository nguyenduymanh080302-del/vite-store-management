declare module '*.scss';
declare module '*.sass';
declare module '*.css';

// Image files
declare module '*.png' {
    const src: string
    export default src
}

declare module '*.jpg' {
    const src: string
    export default src
}

declare module '*.jpeg' {
    const src: string
    export default src
}

declare module '*.gif' {
    const src: string
    export default src
}

declare module '*.webp' {
    const src: string
    export default src
}

declare module '*.ico' {
    const src: string
    export default src
}

// SVG (import as URL)
declare module '*.svg' {
    import * as React from 'react'
    const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>
    const src: string
    export default ReactComponent
    export { src }
}

/// <reference types="vite/client" />

declare module '*.svg?react' {
    import type { FC, SVGProps } from 'react'
    const ReactComponent: FC<
        SVGProps<SVGSVGElement> & { title?: string }
    >
    export default ReactComponent
}

type SvgProps = {
    width: number;
    height?: number;
    className?: string;
    color?: string;
}

type Language = "vi" | "en" | "zh-cn" | "ja";

type ModalActionMode = "create" | "edit" | "delete" | null;
