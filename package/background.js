// This is entry point; triggered via a click of the extension icon.
chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: {tabId: tab.id},
    files: ['listicize.js'],
  }, _ => console.log('Executed listicize.js'));
});
