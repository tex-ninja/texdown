# TeXdowN

TeXdowN is a lightweight alternative to LaTeX for writing short texts with math equations.
While TeXdowN is heavily influenced by Markdown it is **NOT** Markdown + MathJax. 
TeXDown is a work in progress.

## Why?

1. Markdown does not support math formula by itself.
2. Markdown is hard to parse.
3. Markdown is not well defined and even this 116 pages long (!!!) [Spec](https://spec.commonmark.org/0.28/) does not solve all the quirks of Markdown.
4. Markdown does not support underlined text.

## The Language

| TeXdowN                           | Html                                                   |
----------                          |-------                                                 |
| \*bold\*                          | **bold**                                               |
| \_underline\_                     | <u style='text-decoration:underline'>underline</u>     |
| /italic/                          | <i>italic</i>                                          |
| # h1                              | <h1>h1</h1>                                            |
| ## h2                             | <h2>h2</h2>                                            |
| ### h3                            | <h3>h3</h3>                                            |
| #### h4                           | <h4>h4</h4>                                            |
| ##### h5                          | <h5>h5</h5>                                            |
| ###### h6                         | <h6>h6</h6>                                            |
| \[link\](http://example.com)      | [link](http://example.com)                             |
| !\[image\](https://bit.ly/2K9maeN)| ![image](https://bit.ly/2K9maeN)                       |
| $a^2 + b^2 = c^ 2$                | ![](https://bit.ly/2KODTsT)                            |
| $$<br>a^2 + b^2 = c^ 2<br>$$      | <div align='center'>![](https://bit.ly/2KODTsT)</div>  |

## Live example

See live example at [tex.ninja](http://tex.ninja)