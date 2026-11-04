const res = await fetch('http://localhost:3000');
const html = await res.text();
console.log('HTML status:', res.status, 'HTML length:', html.length);

const links = html.match(/<link[^>]+>/g) || [];
console.log('\n--- Link tags in HTML ---');
for (const link of links) {
  console.log(link);
  const hrefMatch = link.match(/href="([^"]+)"/);
  if (hrefMatch && hrefMatch[1].endsWith('.css')) {
    const cssUrl = hrefMatch[1].startsWith('http') ? hrefMatch[1] : 'http://localhost:3000' + hrefMatch[1];
    try {
      const cRes = await fetch(cssUrl);
      const text = await cRes.text();
      console.log('  -> CSS:', cssUrl, 'Status:', cRes.status, 'Bytes:', text.length);
      console.log('  -> Snippet:', text.slice(0, 200).replace(/\n/g, ' '));
    } catch (e) {
      console.log('  -> ERROR fetching CSS:', e.message);
    }
  }
}
