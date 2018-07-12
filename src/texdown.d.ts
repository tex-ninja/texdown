export declare type H = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
export declare type ElementTypeBlock = H | 'p' | 'ul' | 'ol' | 'li';
export declare type ElementTypeInline = 'b' | 'i' | 'u';
export declare type ElementType = ElementTypeBlock | ElementTypeInline;
export declare type Element = {
    type: ElementType;
    token: string;
    data?: any;
};
export declare type TokenType = H | ElementTypeInline | 'uli' | 'oli' | 'a' | 'img' | '$' | '$$' | 'env' | 'cmd' | 'tikz' | 'esc' | 'txt' | 'blank' | 'eol' | 'hr';
export declare type action = {
    [key in TokenType]: () => void;
};
export interface Renderer {
    startElement: (el: Element, id: number) => void;
    endElement: (el: Element) => void;
    startEnv: (name: string) => void;
    endEnv: (name: string) => void;
    cmd: (name: string, arg: string) => void;
    esc: (val: string) => void;
    txt: (val: string) => void;
    hr: () => void;
    eol: () => void;
    blank: () => void;
    a: (title: string, href: string, id: number) => void;
    img: (title: string, src: string, id: number) => void;
    $: (tex: string, id: number) => void;
    $$: (tex: string, id: number) => void;
    tikz: (tikz: string, id: number) => void;
    done: () => void;
}
export declare function texDown(markDown: string, ...renderers: Renderer[]): void;
