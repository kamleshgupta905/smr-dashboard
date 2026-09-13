const localtunnel = require('localtunnel');

const PORT = 3000;
const SUBDOMAIN = 'smr-marketplace-' + Math.floor(1000 + Math.random() * 9000);

async function startTunnel() {
  try {
    console.log(`Connecting localtunnel to port ${PORT}...`);
    const tunnel = await localtunnel({
      port: PORT,
      subdomain: SUBDOMAIN,
    });

    console.log('====================================================');
    console.log(`🚀 PERMANENT TUNNEL ACTIVE: ${tunnel.url}`);
    console.log('====================================================');

    tunnel.on('close', () => {
      console.log('Tunnel closed. Reconnecting in 3s...');
      setTimeout(startTunnel, 3000);
    });

    tunnel.on('error', (err) => {
      console.error('Tunnel error:', err.message);
      tunnel.close();
    });

  } catch (err) {
    console.error('Failed to create tunnel:', err.message);
    setTimeout(startTunnel, 5000);
  }
}

startTunnel();
