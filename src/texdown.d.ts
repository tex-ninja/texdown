import * as moo from 'moo';
export declare type H = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
export declare type Format = 'b' | 'i' | 'u';
export declare type Element = H | Format | 'p' | 'ul' | 'ol' | 'li';
export declare type Env = 'center';
export declare type Cmd = 'vspace';
export declare type Token = H | Format | 'uli' | 'oli' | 'a' | 'img' | '$' | '$$' | 'env' | 'cmd' | 'tikz' | 'esc' | 'txt' | 'blank' | 'eol' | 'hr';
export declare type action = {
    [key in Token]: (tkn: moo.Token) => void;
};
export interface Renderer {
    startElement: (type: Element, id: number) => void;
    endElement: (type: Element) => void;
    startEnv: (type: Env) => void;
    endEnv: (type: Env) => void;
    cmd: (name: Cmd, arg: string) => void;
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
