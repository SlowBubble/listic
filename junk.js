function tokenizeText(text) {
  let currIdx = 0;
  return text.split(/(\s+)/).filter(token => token.length > 0).map(token => {
    const idx = currIdx;
    currIdx += token.length;
    return {
      token: token,
      idx: idx,
    };
  });
}