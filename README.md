# Listic

Listic is a Chrome extension that turns long text into more readable checklists.

The goal is make reading more pleasant and productive.

## Demo

https://slowbubble.github.io/listic/demo.html

## Chrome Extension Description

Listic makes articles easier to read and to bookmark by:
- splitting a long paragraph into a checklist.
- splitting a long sentence into a sub-checklist.

How to use it:
1. Install the extension
2. Pin the extension
  - (you should see an "L" icon on the upper right part of the browser)
3. Navigate to an article in the browser
4. Click on the pinned "L" icon
  - Alternatively, press the keyboard shortcut: `Ctrl+Shift+L`
5. The article should now be turned into checklists.
6. When you want to take a break from reading, just click on the sentence you are reading to checkpoint where you are at, so that it is easier to resume reading after the break.

## TODO

- Scroll to the first visible dom element before the conversion.
  - https://gomakethings.com/how-to-test-if-an-element-is-in-the-viewport-with-vanilla-javascript/
  - test it on: https://preethikasireddy.medium.com/how-does-ethereum-work-anyway-22d1df506369
- ol bug for "A chunk of data" in: https://preethikasireddy.medium.com/how-does-ethereum-work-anyway-22d1df506369
- Add a shortcut to split fine-grain or allow users to customize
  - what tags are considered paragraphs, e.g. some forums use pre tag for paragraphs.
  - whether to split into sub-checklist.
- ." should also be split.
- New empty line with one space: https://blog.rsk.co/noticia/sidechains-drivechains-and-rsk-2-way-peg-design/
- Design a better way to split
- Handle pdf pages (https://stackoverflow.com/q/1554280/2191332)
- Block these from splitting:
  - Fig.
  - Mr. Mrs. Ms. Dr.
  - A. B. C. ...
- Don't split if a sentence is 2 words or shorter.

## Design for PDF

### V0
- Paste URL into the demo textarea
  - Need to use CORS proxy to avoid error.

### V1

- Have a demo page that takes the PDF URL as a url param
  - In that case, hide the demo textarea.
- For the chrome extension, provide a pop-up if it's a non-local pdf page, and send the user to the demo.

## Design a better way to split

### Requirements

* Count spans that are not in a p as a paragraph.
* Treat (...) as 1 phrase.
* Treat <Space><Capital Letter>. as not the end of a sentence.
* Also use : and ; for splitting phrases
  - Need to detect if something is in the textContent but not innerHTML.

### Design

- Extract non-tag text content as tokens from html strings.
- Inspect each token's neighborhood for the splitting criteria.
  - Returns the indices for splitting.



