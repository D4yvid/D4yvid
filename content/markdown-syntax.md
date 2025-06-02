---
title: Markdown Capabilities
date: 2007-10-23T22:23:00
type: article
author:
  name: Dayvid Albuquerque
  email: kkd4yv1d@gmail.com
topic: Testing environment
---

# Markdown Capabilities Demonstration

A smile emoji: :smile:

## -1. Math
Inline math is $\left(x^2-x=0\right)=0$

Multi-line math is
$$
\begin{align}
x^2+y=10 \\
y=5
\end{align}
$$

## 0. Blockquotes
> Normal blockquote

> [!NOTE]
> Highlights information that users should take into account, even when skimming.

> [!TIP]
> Optional information to help a user be more successful.

> [!IMPORTANT]
> Crucial information necessary for users to succeed.

> [!WARNING]
> Critical content demanding immediate user attention due to potential risks.

> [!CAUTION]
> Negative potential consequences of an action.

## 1. Headers

Markdown allows you to create headers of different levels:
# H1 Header
## H2 Header
### H3 Header
#### H4 Header
##### H5 Header
###### H6 Header

## 2. Emphasis

You can emphasize text using **bold** or *italic* formatting:

- **Bold Text**
- *Italic Text*
- ***Bold and Italic Text***

## 3. Lists

### Unordered List

- Item 1
- Item 2
  - Sub-item 1
  - Sub-item 2

### Ordered List

1. First item
2. Second item
3. Third item

## 4. Links and Images

### Links
You can add links like this:
[Google](https://www.google.com)

### Images
You can display images using the following syntax:
![Alt text](https://via.placeholder.com/150)

## 5. Blockquotes

> This is a blockquote.

## 6. Code

Inline code can be added using backticks like this:
`var x = 10;`

### Code Block

You can also display larger blocks of code. Here's an example of a JavaScript function:

```js
// Single-line comment: Demonstrates basic JS syntax and functionalities

// Declaring variables
let name = "John"; // string literal
const age = 25; // number literal

// Function declaration
function greet(person) {
  // Block of code inside function
  return `Hello, ${person}!`;
}

// Calling function
console.log(greet(name)); // Outputs: Hello, John!

// Demonstrating different data types
let isActive = true; // boolean literal
let balance = null; // null literal
let person = { name: "Alice", age: 30 }; // object literal
let arr = [1, 2, 3]; // array literal

// Loop example
for (let i = 0; i < arr.length; i++) {
  console.log(arr[i]); // Logs each element of the array
}

// Conditional example
if (age > 18) {
  console.log("Adult");
} else {
  console.log("Minor");
}

// Arrow function
const add = (a, b) => a + b;
console.log(add(2, 3)); // Outputs: 5

// Try-catch block
try {
  throw new Error("Something went wrong!");
} catch (error) {
  console.log(error.message); // Outputs: Something went wrong!
}

// Using a regular expression
const regex = /\d+/;
console.log(regex.test("123")); // Outputs: true
```

## 7. Horizontal Line

You can create horizontal lines using three hyphens (`---`):

---

## 8. Tables

You can create tables using pipes (`|`) and dashes (`-`):

| Header 1 | Header 2 | Header 3 | Header 3 | Header 3 | Header 3 | Header 3 | Header 3 | Header 3 | Header 3 | Header 3 | Header 3 | Header 3 | Header 3 |
|----------|----------|----------|----------|----------|----------|----------|----------|----------|----------|----------|----------|----------|----------|
| Row 1    | Cell 1   | Cell 2   | Cell 2   | Cell 2   | Cell 2   | Cell 2   | Cell 2   | Cell 2   | Cell 2   | Cell 2   | Cell 2   | Cell 2   | Cell 2   |
| Row 2    | Cell 3   | Cell 4   | Cell 4   | Cell 4   | Cell 4   | Cell 4   | Cell 4   | Cell 4   | Cell 4   | Cell 4   | Cell 4   | Cell 4   | Cell 4   |

## 9. Task Lists

You can create task lists with checkboxes:

- [x] Task 1
- [ ] Task 2
- [x] Task 3

## 10. Strikethrough

You can strike through text using two tildes (`~~`):

~~This text is struck through.~~

## 11. Footnotes

You can add footnotes like this:

Here is a footnote reference[^1].

[^1]: This is the footnote text.

## 12. Emoji

Markdown supports emoji using `:` syntax:

Here is a smiley face: :smile:

## 13. JS Scripting!!

<button class="boton">La boton</button>

```js page.script
const boton = document.querySelector(".boton")

boton.onclick = () => {
    boton.innerText = "La Boton clicked"

    alert("La boton clicked")
};
```

