export declare type typeElement = 'doc' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'ul' | 'ol' | 'li' | 'b' | 'i';
export declare type typeVal = '' | '$$' | '$';
export declare type typeLink = 'a' | 'img';
export interface parent {
    type: typeElement;
    kids: node[];
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
export declare type node = parent | val | link | br;
export declare type vVal<T> = {
    [key in typeVal]: (val: string, parent: T) => T;
};
export declare type vBr<T> = {
    [key in 'br']: (parent: T) => T;
};
export declare type vLink<T> = {
    [key in typeLink]: (title: string, href: string, parent: T) => T;
};
export interface vElement<T> {
    element: (type: typeElement, parent: T) => T;
}
export declare type visitor<T> = vVal<T> & vBr<T> & vLink<T> & vElement<T>;
export declare function visit<T>(node: node, visitor: visitor<T>, parent: T): T;
export declare function texdown(markDown: string): parent;
