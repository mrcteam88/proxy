const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

// Fungsi untuk mendapatkan proxy dari ProxyScrape
async function getProxiesFromProxyScrape() {
    try {
        const url = 'https://api.proxyscrape.com/v2/?request=getproxies&protocol=http&timeout=10000&country=ID&ssl=no&anonymity=all';
        const response = await axios.get(url);
        const proxyList = response.data.split('\r\n').filter(proxy => proxy);

        console.log(`Ditemukan ${proxyList.length} proxy Indonesia dari ProxyScrape.`);
        return proxyList;
    } catch (error) {
        console.error('Error saat mendapatkan proxy dari ProxyScrape:', error.message);
        return [];
    }
}

// Fungsi untuk scraping proxy dari FreeProxy.cz
async function getProxiesFromFreeProxyCz() {
    try {
        const url = 'http://free-proxy.cz/en/proxylist/country/ID/http/ping/all';
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        const proxyList = [];
        $('table#proxy_list tbody tr').each((index, element) => {
            const ipEncoded = $(element).find('td:nth-child(1) script').html();
            const ip = ipEncoded ? eval(ipEncoded.match(/"([^"]+)"/)[1]) : null; // Decode IP
            const port = $(element).find('td:nth-child(2)').text();

            if (ip && port) {
                proxyList.push(`${ip}:${port}`);
            }
        });

        console.log(`Ditemukan ${proxyList.length} proxy Indonesia dari FreeProxy.cz.`);
        return proxyList;
    } catch (error) {
        console.error('Error saat scraping proxy dari FreeProxy.cz:', error.message);
        return [];
    }
}

// Fungsi untuk scraping proxy dari OpenProxySpace
async function getProxiesFromOpenProxySpace() {
    try {
        const url = 'https://openproxy.space/list/http';
        const response = await axios.get(url);
        const proxyList = response.data.split('\n').filter(line => line.includes(':')).map(line => line.trim());

        console.log(`Ditemukan ${proxyList.length} proxy dari OpenProxySpace.`);
        return proxyList.filter(proxy => proxy.includes('.id:')); // Filter untuk proxy Indonesia
    } catch (error) {
        console.error('Error saat mendapatkan proxy dari OpenProxySpace:', error.message);
        return [];
    }
}

// Fungsi untuk scraping proxy dari CoolProxy
async function getProxiesFromCoolProxy() {
    try {
        const url = 'https://www.cool-proxy.net/proxies.json';
        const response = await axios.get(url);
        const proxyList = response.data
            .filter(proxy => proxy.country === 'ID')
            .map(proxy => `${proxy.ip}:${proxy.port}`);

        console.log(`Ditemukan ${proxyList.length} proxy Indonesia dari CoolProxy.`);
        return proxyList;
    } catch (error) {
        console.error('Error saat scraping proxy dari CoolProxy:', error.message);
        return [];
    }
}

// Fungsi untuk scraping proxy dari IP3366
async function getProxiesFromIP3366() {
    try {
        const url = 'http://www.ip3366.net/free/?stype=1&country=ID';
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        const proxyList = [];
        $('table tbody tr').each((index, element) => {
            const ip = $(element).find('td').eq(0).text().trim();
            const port = $(element).find('td').eq(1).text().trim();

            if (ip && port) {
                proxyList.push(`${ip}:${port}`);
            }
        });

        console.log(`Ditemukan ${proxyList.length} proxy Indonesia dari IP3366.`);
        return proxyList;
    } catch (error) {
        console.error('Error saat scraping proxy dari IP3366:', error.message);
        return [];
    }
}

// Fungsi untuk menyimpan proxy ke file
function saveProxiesToFile(filename, proxies) {
    try {
        fs.writeFileSync(filename, proxies.join('\n'));
        console.log(`Proxy berhasil disimpan ke file ${filename}`);
    } catch (error) {
        console.error('Error saat menyimpan proxy ke file:', error.message);
    }
}

// Jalankan script
(async () => {
    const filename = 'proxy.txt';

    console.log('Mengumpulkan proxy dari berbagai sumber...');
    const proxies1 = await getProxiesFromProxyScrape();
    const proxies2 = await getProxiesFromFreeProxyCz();
    const proxies3 = await getProxiesFromOpenProxySpace();
    const proxies4 = await getProxiesFromCoolProxy();
    const proxies5 = await getProxiesFromIP3366();

    // Gabungkan semua proxy dan hilangkan duplikat
    const allProxies = Array.from(new Set([...proxies1, ...proxies2, ...proxies3, ...proxies4, ...proxies5]));

    console.log(`\nTotal ${allProxies.length} proxy Indonesia berhasil dikumpulkan.`);
    saveProxiesToFile(filename, allProxies);
})();
