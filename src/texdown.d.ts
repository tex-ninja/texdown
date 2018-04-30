import * as moo from 'moo';
export declare type h = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
export declare type tokens = h | 'b' | 'i' | 'u' | 'uli' | 'oli' | 'a' | 'img' | '$' | '$$' | 'tikz' | 'esc' | 'txt' | 'blank' | 'eol';
export declare type typeElement = h | 'b' | 'i' | 'u' | 'p' | 'ul' | 'ol' | 'li';
export declare type action = {
    [key in tokens]: (tkn: moo.Token) => void;
};
export interface Renderer {
    startElement: (type: typeElement, id: number) => void;
    endElement: (type: typeElement) => void;
    txt: (val: string) => void;
    eol: () => void;
    blank: () => void;
    a: (title: string, href: string, id: number) => void;
    img: (title: string, src: string, id: number) => void;
    $: (tex: string, id: number) => void;
    $$: (tex: string, id: number) => void;
    tikz: (tikz: string, id: number) => void;
}
export declare function texDown(markDown: string, ...renderers: Renderer[]): void;
