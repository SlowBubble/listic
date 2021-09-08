main();

function main() {
  const input = document.getElementById('input');
  const output = document.getElementById('output');
  const title = document.getElementById('title');
  const pdfFileInput = document.getElementById('pdf-input');
  pdfFileInput.onchange = _ => {
    handlePdfFileInput(pdfFileInput, output);
    input.remove();
    title.remove();
    pdfFileInput.remove();
  };

  // e.g. demo.html?pdf=https://eprint.iacr.org/2017/791.pdf
  const pdfUrl = (new URL(document.URL)).searchParams.get('pdf');
  if (pdfUrl) {
    input.remove();
    title.remove();
    pdfFileInput.remove();
    runWithPdf(pdfUrl, output);
    return;
  }
  input.addEventListener('input', function() {
    const val = input.value;
    // e.g. https://eprint.iacr.org/2017/791.pdf
    if (val.endsWith('.pdf')) {
      runWithPdf(val, output);
      return;
    }
    run(input.value, output);
  });

  run(input.value, output);
}

function handlePdfFileInput(pdfFileInput, output) {
  const selectedFile = pdfFileInput.files[0];
  //Step 2: Read the file using file reader
  var fileReader = new FileReader();  

  fileReader.onload = async _ => {
      //Step 4:turn array buffer into typed array
      var typedarray = new Uint8Array(fileReader.result);

      //Step 5:pdfjs should be able to read this
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'lib/pdf.worker.min.js';
      const pdf = await pdfjsLib.getDocument(typedarray).promise;
      await renderPdfOutput(pdf, output);
  };
  //Step 3:Read the file as ArrayBuffer
  fileReader.readAsArrayBuffer(selectedFile);
}

function addTextToHtml(text, parentHtml) {
  text.split('\n').filter(para => para.trim().length > 0).forEach(para => {
    const elt = document.createElement('p');
    elt.textContent = para;
    parentHtml.appendChild(elt);
  });
}

function run(inputValue, output) {
  output.innerHTML = '';
  addTextToHtml(inputValue, output);
  listicize();
}

async function runWithPdf(url, output) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'lib/pdf.worker.min.js';
  const corsProxyUrl = 'https://cors-anywhere.herokuapp.com/';
  let pdf;
  try {
    pdf = await pdfjsLib.getDocument(url).promise;
  } catch(err) {
    const urlWithProxy = corsProxyUrl + url;
    console.log('Retrying with CORS proxy.', err);
    try {
      pdf = await pdfjsLib.getDocument(urlWithProxy).promise;
      console.log('Succeeded with CORS proxy.');
    } catch(corsProxyErr) {
      // TODO see if there's a different error for wrong URL vs failing proxy.
      // Wrong URL: "UnexpectedResponseException" 403.
      console.warn('Failed even when using CORS proxy. Url: ', urlWithProxy);
      output.innerHTML = `<h2>Failed to obtain the PDF</h2><br/>
      <h2>Please enable <b><a href="${corsProxyUrl}">the proxy access here</a></b> and retry.</h2>
      <h2>If that fails also, then save the PDF file and upload it to <a href="demo.html">the demo page</a>.</h2>
      `;
      throw corsProxyErr;
    }
  }

  await renderPdfOutput(pdf, output);
}

async function renderPdfOutput(pdf, output) {
  // TODO detect new lines by looking at item.width and
  // item.transform of the form [h 0 0 h x0 y0]
  // When there is a new line and the x0 is different from the previous
  // new line, infer that as a new paragraph.
  // Also, on end of a line, look at x0 + width to see if it is much shorter
  // than the previous end of a line.
  const strs = [];
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    console.log(textContent)
    textContent.items.forEach(item => {
      const str = item.str;
      strs.push(str.endsWith('-') ? str.slice(0, str.length - 1) : str + ' ');
    });
    strs.push('\n');
  }
  run(strs.join(''), output);
}
