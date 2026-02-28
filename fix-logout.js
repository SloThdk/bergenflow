const fs = require('fs');

// BergenFlow: logout should go to bergen-fitness.pages.dev (the public site)
const files = ['app/book/page.tsx', 'app/dashboard/page.tsx', 'app/owner/page.tsx', 'app/trainer/page.tsx'];

for (const f of files) {
  let c = fs.readFileSync(f, 'utf8');
  // Replace router.push("/") with window.location.href to the public site
  c = c.replace(
    /router\.push\("\/"\)/g,
    'window.location.href = "https://bergen-fitness.pages.dev"'
  );
  fs.writeFileSync(f, c, 'utf8');
  console.log(f + ': fixed');
}
