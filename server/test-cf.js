const { tunnel } = require('cloudflared');

async function main() {
  console.log('Starting Cloudflare Quick Tunnel for http://localhost:3000...');
  try {
    const { url, child } = tunnel({ '--url': 'http://localhost:3000' });
    const publicUrl = await url;
    console.log('======================================================');
    console.log('🎉 CLOUDFLARE PUBLIC URL READY:', publicUrl);
    console.log('======================================================');
  } catch (err) {
    console.error('Error starting Cloudflare tunnel:', err);
  }
}

main();
