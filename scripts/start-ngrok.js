import ngrok from 'ngrok';

(async function() {
    try {
        const url = await ngrok.connect({
            addr: 3000,
            proto: 'http',
            authtoken: process.env.NGROK_AUTH_TOKEN
        });
        console.log('ngrok tunnel is running at:', url);
        console.log('Use this URL in your Cashfree webhook configuration:', `${url}/webhooks/cashfree`);
    } catch (err) {
        console.error('Error starting ngrok:', err);
        process.exit(1);
    }
})(); 