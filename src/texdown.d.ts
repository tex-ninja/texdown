import * as moo from 'moo';
export declare type tokens = 'h6' | 'h5' | 'h4' | 'h3' | 'h2' | 'h1' | 'b' | 'i' | 'u' | 'uli' | 'oli' | 'a' | 'img' | '$' | '$$' | 'tikz' | 'esc' | 'txt' | 'blank' | 'eol';
export declare type typeElement = 'h6' | 'h5' | 'h4' | 'h3' | 'h2' | 'h1' | 'b' | 'i' | 'u' | 'p';
export declare type typeVal = 'txt';
export declare type type = typeElement | typeVal;
export declare type action = {
    [key in tokens]: (tkn: moo.Token) => void;
};
export interface parser {
    startElement: (type: typeElement) => void;
    endElement: (type: typeElement) => void;
    txt: (val: string) => void;
}
export declare function texdown<T extends parser>(markDown: string, parser: T): T;
