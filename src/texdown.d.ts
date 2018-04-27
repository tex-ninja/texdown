export declare type typeElement = 'div' | 'p' | 'ul' | 'ol' | 'li' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'b' | 'i' | 'u' | 'span';
export declare type typeVal = '' | '$$' | '$';
export declare type typeLink = 'a' | 'img';
export interface kids {
    kids: node[];
}
export interface element extends kids {
    type: typeElement;
}
export interface br {
    type: 'br';
}
export interface val {
    type: typeVal;
    val: string;
}
export interface link {
    type: typeLink;
    title: string;
    href: string;
}
export declare type node = element | val | link | br;
export declare type vVal<T> = {
    [key in typeVal]: (val: string, parent: T) => void;
};
export declare type vBr<T> = {
    [key in 'br']: (parent: T) => void;
};
export declare type vLink<T> = {
    [key in typeLink]: (title: string, href: string, parent: T) => void;
};
export interface vElement<T> {
    element: (type: typeElement, parent: T) => T;
}
export interface vDoc<T> {
    doc: () => T;
}
export declare type visitor<T> = vDoc<T> & vElement<T> & vLink<T> & vVal<T> & vBr<T>;
export declare function visit<T>(ast: element, visitor: visitor<T>): T;
export declare function visitNode<T>(node: node, visitor: visitor<T>, parent: T): void;
export declare function texdown(markDown: string): element;
