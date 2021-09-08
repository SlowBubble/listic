
///////// This is the main logic, agnostic to its host, i.e. the chrome extension //////////

// These must be var instead of const because the script may be injected into the page more than once.
var listicClassName = 'listic-node';
var unlisticClassName = 'unlistic-node';
var tagSet = new Set([
  'p',
  'li',
  // 'pre',
]);
var checkboxHtml = `<input type="checkbox" style="width:10px;height:10px;display:inline;margin-right:5px;">`
// Should we turn this into:
// Any word with no vowels, length <= 3, capitalized?
// Not yet, because we know these usually is not the end of a sentence.
var possAbbrevSet = new Set([
  'Mr',
  'Mrs',
  'Ms',
  'Dr',
  'al', // et al.
]);

// Exclude paragraphs within lists or paragraphs.
function getSimpleParagraphs() {
  const elts = [...tagSet].flatMap(tag => {
    return [...document.getElementsByTagName(tag)];
  })
  return elts.filter(elt => {
    return isSimple(elt);
  });
}


function isSimple(elt) {
  const parent = elt.parentElement;
  if (parent === null) {
    return true;
  }
  if (tagSet.has(parent.tagName.toLowerCase())) {
    return false;
  }
  return isSimple(parent);
}

function swapVisibility(newNode, referenceNode) {
  newNode.className += ` ${listicClassName}`;
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);

  // referenceNode.remove();
  referenceNode.className += ` ${unlisticClassName}`;
  referenceNode.style.display = 'none';
}

function toSentences(str) {
  const regexp = /([^\s]+)[\.!\?]\s+/g;
  const matches = [...str.matchAll(regexp)];
  const validMatches = matches.filter(match => {
    const wordBeforePunctuation = match[1];
    // This includes i.e and e.g, but not fab.com
    if (wordBeforePunctuation.includes('.') && wordBeforePunctuation.length < 6) {
      return false;
    }
    // Middle name initials.
    if (wordBeforePunctuation.match(/^[A-Z]$/)) {
      return false;
    }
    if (possAbbrevSet.has(wordBeforePunctuation)) {
      return false;
    }
    return true;
  });
  return splitStr(str, validMatches)
    // .filter(sentence => sentence.trim().length > 0);
}

function splitStr(str, validMatches) {
  let currStartIdx = 0;
  const res = validMatches.map(match => {
    const startIdx = currStartIdx;
    const endIdx = match.index + match[0].length;
    currStartIdx = endIdx;
    return str.substring(startIdx, endIdx);
  })
  if (currStartIdx < str.length) {
    res.push(str.substring(currStartIdx, str.length));
  }
  return res;
}

function getWords(phrase) {
  return phrase.split(/(\s+)/).filter(word => word.trim().length > 0);
}

// TODO use both textContent and innerHTML to make sure we are splitting things properly.
// Due to this shortcoming, we cannot split for ; and : as they are used in non-textContent.
function toPhrases(sentence) {
  const regexp = /[,\)]\s+/g;
  const matches = [...sentence.matchAll(regexp)];
  return splitStr(sentence, matches);
}

function toListElt(sentences) {
  const listItemElts = sentences.map(sentence => {
    const listItemElt = document.createElement('li');
    listItemElt.style['list-style-type'] = 'none';
    const phrases = toPhrases(sentence);
    if (phrases.length <= 1) {
      listItemElt.innerHTML = `<label>${checkboxHtml}${sentence}</label>`;
    } else {
      const sublist = toListElt(phrases.slice(1));
      listItemElt.innerHTML = `<label>${checkboxHtml}${phrases[0]}\n${sublist.outerHTML}</label>`
    }
    return listItemElt;
  });
  // Using ol instead of ul because mysteriously, list-style is not none for the latter.
  const listElt = document.createElement('ol');
  listElt.style['margin-left'] = '0px';
  listElt.style['padding-inline-start'] = '20px';
  listElt.style['list-style-type'] = 'none';
  listItemElts.forEach(listItemElt => {
    listElt.appendChild(listItemElt);
  });
  return listElt;
}

function listicize() {
  const invisbleListicNodes = [...document.getElementsByClassName(listicClassName)].filter(node => {
    return node.style.display === 'none';
  });
  if (invisbleListicNodes.length > 0) {
    invisbleListicNodes.forEach(node => {
      node.style.display = '';
    });
    [...document.getElementsByClassName(unlisticClassName)].forEach(node => {
      node.style.display = 'none';
    });
    return;
  }

  getSimpleParagraphs().forEach(elt => {
    const sentences = toSentences(elt.innerHTML);
    const listElt = toListElt(sentences);
    listElt.style['padding-inline-start'] = '10px';
    listElt.style['border-top'] = 'solid';
    listElt.style['margin-bottom'] = '8px';
    let listicizedElt = listElt;
    if (elt.tagName.toLowerCase() === 'li') {
      listicizedElt = document.createElement('li');
      listicizedElt.appendChild(listElt)
    }
    if (listicizedElt.textContent.split(' ').length > 9) {
      swapVisibility(listicizedElt, elt);
    }
  });
}

function unlisticize() {
  [...document.getElementsByClassName(listicClassName)].forEach(node => {
    node.style.display = 'none';
  });
  [...document.getElementsByClassName(unlisticClassName)].forEach(node => {
    node.style.display = '';
  });

}

function toggleListic() {
  const visbleListicNodes = [...document.getElementsByClassName(listicClassName)].filter(node => {
    return node.style.display !== 'none';
  });
  if (visbleListicNodes.length === 0) {
    listicize();
    return;
  }
  unlisticize();
}

function main() {
  if (document.contentType === 'application/pdf') {
    window.open(`https://slowbubble.github.io/listic/demo.html?pdf=${window.location.href}`, '_blank');
    return;
  }
  toggleListic();

}

main();
