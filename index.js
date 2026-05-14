const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

const API_BASE = 'https://phimapi.com';
const APP_HOST = 'https://kkphim.agrhub.com';
const APP_PORT = 3005;

// Utilities
const getPosterUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `https://phimapi.com/image.php?url=https://phimimg.com/${path}`;
};

const formatChannel = (item, req) => {
    return {
        id: item.slug,
        name: item.name,
        description: item.name,
        type: "playlist",
        display: "text-below",
        enable_detail: true,
        image: {
            url: getPosterUrl(item.thumb_url || item.poster_url),
            type: "cover",
            width: 640,
            height: 480
        },
        remote_data: {
            url: `${APP_HOST}/detail?slug=${item.slug}`
        },
        share: {
            url: `${APP_HOST}/detail?slug=${item.slug}`
        }
    };
};

const fetchList = async (url) => {
    try {
        const response = await axios.get(url);
        const data = response.data;
        
        let items = [];
        let pagination = {};
        if (data.data && Array.isArray(data.data.items)) {
            items = data.data.items;
            pagination = data.data.params?.pagination ?? {};
        } else if (data.items && Array.isArray(data.items)) {
            items = data.items; 
            pagination = data.params?.pagination ?? {};
        } else if (Array.isArray(data)) {
            items = data;
        }
        return {items, pagination};
    } catch (error) {
        console.error(`Error fetching ${url}:`, error.message);
        return [];
    }
};

// 1. GET / (Home)
app.get('/', async (req, res) => {
    try {
        const [phimMoi, phimBo, phimLe, hoatHinh, tvShows, phimVietsub, phimLongTieng, phimThuyetMinh] = await Promise.all([
            fetchList(`${API_BASE}/danh-sach/phim-moi-cap-nhat?page=1`),
            fetchList(`${API_BASE}/v1/api/danh-sach/phim-bo?page=1`),
            fetchList(`${API_BASE}/v1/api/danh-sach/phim-le?page=1`),
            fetchList(`${API_BASE}/v1/api/danh-sach/hoat-hinh?page=1`),
            fetchList(`${API_BASE}/v1/api/danh-sach/tv-shows?page=1`),
            fetchList(`${API_BASE}/v1/api/danh-sach/phim-vietsub?page=1`),
            fetchList(`${API_BASE}/v1/api/danh-sach/phim-long-tieng?page=1`),
            fetchList(`${API_BASE}/v1/api/danh-sach/phim-thuyet-minh?page=1`)
            
        ]);
        
        const response = {
            id: "kkphim",
            name: "KKPhim",
            description: "KKPhim - Ứng dụng xem phim miễn phí",
            url: `${APP_HOST}`,
            color: "#2c70b0",
            image: {
                url: "https://kkphim.vip/assets/img/logo-2.png",
                type: "contain",
                height: 111,
                width: 300
            },
            notice: {
                id: "notice",
                link: "https://phimapi.com",
                text: "Info",
                icon: "https://kkphim.vip/assets/img/logo-2.png",
                closeable: true
            },
            search: {
                url: `${APP_HOST}/search`,
                suggest_url: `${APP_HOST}/suggest`,
                search_key: "keyword",
                paging: {
                    page_key: 'page',
                    size_key: 'limit'
                }
            },
            sorts: [
                { type: "dropdown", text: "Thể loại", value: [
                    { text: "Hành Động", type: "radio", url: `${APP_HOST}/list?category=hanh-dong` },
                    { text: "Hài Hước", type: "radio", url: `${APP_HOST}/list?category=hai-huoc` },
                    { text: "Tình Cảm", type: "radio", url: `${APP_HOST}/list?category=tinh-cam` },
                    { text: "Kinh Dị", type: "radio", url: `${APP_HOST}/list?category=kinh-di` },
                    { text: "Phiêu Lưu", type: "radio", url: `${APP_HOST}/list?category=phieu-luu` },
                    { text: "Khoa Học Viễn Tưởng", type: "radio", url: `${APP_HOST}/list?category=khoa-hoc-vien-tuong` },
                    { text: "Tâm Lý", type: "radio", url: `${APP_HOST}/list?category=tam-ly` },
                    { text: "Chính Kịch", type: "radio", url: `${APP_HOST}/list?category=chinh-kich` },
                    { text: "Giả Tưởng", type: "radio", url: `${APP_HOST}/list?category=gia-tuong` },
                    { text: "Gia Đình", type: "radio", url: `${APP_HOST}/list?category=gia-dinh` },
                    { text: "Chiến Tranh", type: "radio", url: `${APP_HOST}/list?category=chien-tranh` },
                    { text: "Hình Sự", type: "radio", url: `${APP_HOST}/list?category=hinh-su` },
                    { text: "Âm Nhạc", type: "radio", url: `${APP_HOST}/list?category=am-nhac` },
                    { text: "Thể Thao", type: "radio", url: `${APP_HOST}/list?category=the-thao` },
                    { text: "Bí Ẩn", type: "radio", url: `${APP_HOST}/list?category=bi-an` },
                    { text: "Lịch Sử", type: "radio", url: `${APP_HOST}/list?category=lich-su` },
                    { text: "Phim Tài Liệu", type: "radio", url: `${APP_HOST}/list?category=phim-tai-lieu` },
                    { text: "Phim Ngắn", type: "radio", url: `${APP_HOST}/list?category=phim-ngan` },
                    { text: "Phim Lẻ", type: "radio", url: `${APP_HOST}/list?category=phim-le` },
                    { text: "Phim Bộ", type: "radio", url: `${APP_HOST}/list?category=phim-bo` },
                    { text: "Hoạt Hình", type: "radio", url: `${APP_HOST}/list?category=hoat-hinh` },
                    { text: "TV Shows", type: "radio", url: `${APP_HOST}/list?category=tv-shows` },
                ] },
                { type: "dropdown", text: "Quốc gia", value: [
                    { text: "Việt Nam", type: "radio", url: `${APP_HOST}/list?country=viet-nam` },
                    { text: "Trung Quốc", type: "radio", url: `${APP_HOST}/list?country=trung-quoc` },
                    { text: "Hồng Kông", type: "radio", url: `${APP_HOST}/list?country=hong-kong` },
                    { text: "Hàn Quốc", type: "radio", url: `${APP_HOST}/list?country=han-quoc` },
                    { text: "Nhật Bản", type: "radio", url: `${APP_HOST}/list?country=nhat-ban` },
                    { text: "Mỹ", type: "radio", url: `${APP_HOST}/list?country=my` },
                    { text: "Anh", type: "radio", url: `${APP_HOST}/list?country=anh` },
                    { text: "Pháp", type: "radio", url: `${APP_HOST}/list?country=phap` },
                    { text: "Đức", type: "radio", url: `${APP_HOST}/list?country=duc` },
                    { text: "Ấn Độ", type: "radio", url: `${APP_HOST}/list?country=an-do` },
                    { text: "Thái Lan", type: "radio", url: `${APP_HOST}/list?country=thai-lan` },
                    { text: "Tây Ban Nha", type: "radio", url: `${APP_HOST}/list?country=tay-ban-nha` },
                    { text: "Ý", type: "radio", url: `${APP_HOST}/list?country=y` },
                    { text: "Châu Âu", type: "radio", url: `${APP_HOST}/list?country=chau-au` },
                    { text: "Châu Á", type: "radio", url: `${APP_HOST}/list?country=chau-a` },
                    { text: "Châu Mỹ", type: "radio", url: `${APP_HOST}/list?country=chau-my` },
                    { text: "Châu Phi", type: "radio", url: `${APP_HOST}/list?country=chau-phi` },
                    { text: "Châu Úc", type: "radio", url: `${APP_HOST}/list?country=chau-uc` },
                ] },
                { type: "dropdown", text: "Năm", value: [
                    { text: "2026", type: "radio", url: `${APP_HOST}/list?year=2026` },
                    { text: "2025", type: "radio", url: `${APP_HOST}/list?year=2025` },
                    { text: "2024", type: "radio", url: `${APP_HOST}/list?year=2024` },
                    { text: "2023", type: "radio", url: `${APP_HOST}/list?year=2023` },
                    { text: "2022", type: "radio", url: `${APP_HOST}/list?year=2022` },
                    { text: "2021", type: "radio", url: `${APP_HOST}/list?year=2021` },
                    { text: "2020", type: "radio", url: `${APP_HOST}/list?year=2020` },
                    { text: "2019", type: "radio", url: `${APP_HOST}/list?year=2019` },
                    { text: "2018", type: "radio", url: `${APP_HOST}/list?year=2018` },
                    { text: "2017", type: "radio", url: `${APP_HOST}/list?year=2017` },
                    { text: "2016", type: "radio", url: `${APP_HOST}/list?year=2016` },
                    { text: "2015", type: "radio", url: `${APP_HOST}/list?year=2015` },
                    { text: "2014", type: "radio", url: `${APP_HOST}/list?year=2014` },
                    { text: "2013", type: "radio", url: `${APP_HOST}/list?year=2013` },
                    { text: "2012", type: "radio", url: `${APP_HOST}/list?year=2012` },
                    { text: "2011", type: "radio", url: `${APP_HOST}/list?year=2011` },
                    { text: "2010", type: "radio", url: `${APP_HOST}/list?year=2010` },
                    { text: "2009", type: "radio", url: `${APP_HOST}/list?year=2009` },
                    { text: "2008", type: "radio", url: `${APP_HOST}/list?year=2008` },
                    { text: "2007", type: "radio", url: `${APP_HOST}/list?year=2007` },
                    { text: "2006", type: "radio", url: `${APP_HOST}/list?year=2006` },
                    { text: "2005", type: "radio", url: `${APP_HOST}/list?year=2005` },
                    { text: "2004", type: "radio", url: `${APP_HOST}/list?year=2004` },
                    { text: "2003", type: "radio", url: `${APP_HOST}/list?year=2003` },
                    { text: "2002", type: "radio", url: `${APP_HOST}/list?year=2002` },
                    { text: "2001", type: "radio", url: `${APP_HOST}/list?year=2001` },
                    { text: "2000", type: "radio", url: `${APP_HOST}/list?year=2000` },
                    { text: "1999", type: "radio", url: `${APP_HOST}/list?year=1999` },
                    { text: "1998", type: "radio", url: `${APP_HOST}/list?year=1998` },
                    { text: "1997", type: "radio", url: `${APP_HOST}/list?year=1997` },
                    { text: "1996", type: "radio", url: `${APP_HOST}/list?year=1996` },
                    { text: "1995", type: "radio", url: `${APP_HOST}/list?year=1995` },
                    { text: "1994", type: "radio", url: `${APP_HOST}/list?year=1994` },
                    { text: "1993", type: "radio", url: `${APP_HOST}/list?year=1993` },
                    { text: "1992", type: "radio", url: `${APP_HOST}/list?year=1992` },
                    { text: "1991", type: "radio", url: `${APP_HOST}/list?year=1991` },
                    { text: "1990", type: "radio", url: `${APP_HOST}/list?year=1990` },
                    { text: "1989", type: "radio", url: `${APP_HOST}/list?year=1989` },
                    { text: "1988", type: "radio", url: `${APP_HOST}/list?year=1988` },
                    { text: "1987", type: "radio", url: `${APP_HOST}/list?year=1987` },
                    { text: "1986", type: "radio", url: `${APP_HOST}/list?year=1986` },
                    { text: "1985", type: "radio", url: `${APP_HOST}/list?year=1985` },
                    { text: "1984", type: "radio", url: `${APP_HOST}/list?year=1984` },
                    { text: "1983", type: "radio", url: `${APP_HOST}/list?year=1983` },
                    { text: "1982", type: "radio", url: `${APP_HOST}/list?year=1982` },
                    { text: "1981", type: "radio", url: `${APP_HOST}/list?year=1981` },
                    { text: "1980", type: "radio", url: `${APP_HOST}/list?year=1980` },
                    { text: "1979", type: "radio", url: `${APP_HOST}/list?year=1979` },
                    { text: "1978", type: "radio", url: `${APP_HOST}/list?year=1978` },
                    { text: "1977", type: "radio", url: `${APP_HOST}/list?year=1977` },
                    { text: "1976", type: "radio", url: `${APP_HOST}/list?year=1976` },
                    { text: "1975", type: "radio", url: `${APP_HOST}/list?year=1975` },
                    { text: "1974", type: "radio", url: `${APP_HOST}/list?year=1974` },
                    { text: "1973", type: "radio", url: `${APP_HOST}/list?year=1973` },
                    { text: "1972", type: "radio", url: `${APP_HOST}/list?year=1972` },
                    { text: "1971", type: "radio", url: `${APP_HOST}/list?year=1971` },
                    { text: "1970", type: "radio", url: `${APP_HOST}/list?year=1970` },
                    { text: "1969", type: "radio", url: `${APP_HOST}/list?year=1969` },
                    { text: "1968", type: "radio", url: `${APP_HOST}/list?year=1968` },
                    { text: "1967", type: "radio", url: `${APP_HOST}/list?year=1967` },
                    { text: "1966", type: "radio", url: `${APP_HOST}/list?year=1966` },
                    { text: "1965", type: "radio", url: `${APP_HOST}/list?year=1965` },
                    { text: "1964", type: "radio", url: `${APP_HOST}/list?year=1964` },
                    { text: "1963", type: "radio", url: `${APP_HOST}/list?year=1963` },
                    { text: "1962", type: "radio", url: `${APP_HOST}/list?year=1962` },
                    { text: "1961", type: "radio", url: `${APP_HOST}/list?year=1961` },
                    { text: "1960", type: "radio", url: `${APP_HOST}/list?year=1960` },
                    { text: "1959", type: "radio", url: `${APP_HOST}/list?year=1959` },
                    { text: "1958", type: "radio", url: `${APP_HOST}/list?year=1958` },
                    { text: "1957", type: "radio", url: `${APP_HOST}/list?year=1957` },
                    { text: "1956", type: "radio", url: `${APP_HOST}/list?year=1956` },
                    { text: "1955", type: "radio", url: `${APP_HOST}/list?year=1955` },
                    { text: "1954", type: "radio", url: `${APP_HOST}/list?year=1954` },
                    { text: "1953", type: "radio", url: `${APP_HOST}/list?year=1953` },
                    { text: "1952", type: "radio", url: `${APP_HOST}/list?year=1952` },
                    { text: "1951", type: "radio", url: `${APP_HOST}/list?year=1951` },
                    { text: "1950", type: "radio", url: `${APP_HOST}/list?year=1950` },
                    { text: "1949", type: "radio", url: `${APP_HOST}/list?year=1949` },
                    { text: "1948", type: "radio", url: `${APP_HOST}/list?year=1948` },
                    { text: "1947", type: "radio", url: `${APP_HOST}/list?year=1947` },
                    { text: "1946", type: "radio", url: `${APP_HOST}/list?year=1946` },
                    { text: "1945", type: "radio", url: `${APP_HOST}/list?year=1945` },
                    { text: "1944", type: "radio", url: `${APP_HOST}/list?year=1944` },
                    { text: "1943", type: "radio", url: `${APP_HOST}/list?year=1943` },
                    { text: "1942", type: "radio", url: `${APP_HOST}/list?year=1942` },
                    { text: "1941", type: "radio", url: `${APP_HOST}/list?year=1941` },
                    { text: "1940", type: "radio", url: `${APP_HOST}/list?year=1940` },
                    { text: "1939", type: "radio", url: `${APP_HOST}/list?year=1939` },
                    { text: "1938", type: "radio", url: `${APP_HOST}/list?year=1938` },
                    { text: "1937", type: "radio", url: `${APP_HOST}/list?year=1937` },
                    { text: "1936", type: "radio", url: `${APP_HOST}/list?year=1936` },
                    { text: "1935", type: "radio", url: `${APP_HOST}/list?year=1935` },
                    { text: "1934", type: "radio", url: `${APP_HOST}/list?year=1934` },
                    { text: "1933", type: "radio", url: `${APP_HOST}/list?year=1933` },
                    { text: "1932", type: "radio", url: `${APP_HOST}/list?year=1932` },
                    { text: "1931", type: "radio", url: `${APP_HOST}/list?year=1931` },
                    { text: "1930", type: "radio", url: `${APP_HOST}/list?year=1930` },
                    { text: "1929", type: "radio", url: `${APP_HOST}/list?year=1929` },
                    { text: "1928", type: "radio", url: `${APP_HOST}/list?year=1928` },
                    { text: "1927", type: "radio", url: `${APP_HOST}/list?year=1927` },
                    { text: "1926", type: "radio", url: `${APP_HOST}/list?year=1926` },
                    { text: "1925", type: "radio", url: `${APP_HOST}/list?year=1925` },
                    { text: "1924", type: "radio", url: `${APP_HOST}/list?year=1924` },
                    { text: "1923", type: "radio", url: `${APP_HOST}/list?year=1923` },
                    { text: "1922", type: "radio", url: `${APP_HOST}/list?year=1922` },
                    { text: "1921", type: "radio", url: `${APP_HOST}/list?year=1921` },
                    { text: "1920", type: "radio", url: `${APP_HOST}/list?year=1920` },
                    { text: "1919", type: "radio", url: `${APP_HOST}/list?year=1919` },
                    { text: "1918", type: "radio", url: `${APP_HOST}/list?year=1918` },
                    { text: "1917", type: "radio", url: `${APP_HOST}/list?year=1917` },
                    { text: "1916", type: "radio", url: `${APP_HOST}/list?year=1916` },
                    { text: "1915", type: "radio", url: `${APP_HOST}/list?year=1915` },
                    { text: "1914", type: "radio", url: `${APP_HOST}/list?year=1914` },
                    { text: "1913", type: "radio", url: `${APP_HOST}/list?year=1913` },
                    { text: "1912", type: "radio", url: `${APP_HOST}/list?year=1912` },
                    { text: "1911", type: "radio", url: `${APP_HOST}/list?year=1911` },
                    { text: "1910", type: "radio", url: `${APP_HOST}/list?year=1910` },
                    { text: "1909", type: "radio", url: `${APP_HOST}/list?year=1909` },
                    { text: "1908", type: "radio", url: `${APP_HOST}/list?year=1908` },
                    { text: "1907", type: "radio", url: `${APP_HOST}/list?year=1907` },
                    { text: "1906", type: "radio", url: `${APP_HOST}/list?year=1906` },
                    { text: "1905", type: "radio", url: `${APP_HOST}/list?year=1905` },
                    { text: "1904", type: "radio", url: `${APP_HOST}/list?year=1904` },
                    { text: "1903", type: "radio", url: `${APP_HOST}/list?year=1903` },
                    { text: "1902", type: "radio", url: `${APP_HOST}/list?year=1902` },
                    { text: "1901", type: "radio", url: `${APP_HOST}/list?year=1901` },
                    { text: "1900", type: "radio", url: `${APP_HOST}/list?year=1900` },
                    { text: "1899", type: "radio", url: `${APP_HOST}/list?year=1899` },
                    { text: "1898", type: "radio", url: `${APP_HOST}/list?year=1898` },
                    { text: "1897", type: "radio", url: `${APP_HOST}/list?year=1897` },
                    { text: "1896", type: "radio", url: `${APP_HOST}/list?year=1896` },
                    { text: "1895", type: "radio", url: `${APP_HOST}/list?year=1895` },
                ] },
                { type: "dropdown", text: "Phân loại", value: [
                    { text: "Phim bộ", type: "radio", url: `${APP_HOST}/list?type=phim-bo` },
                    { text: "Phim lẻ", type: "radio", url: `${APP_HOST}/list?type=phim-le` },
                    { text: "TV Shows", type: "radio", url: `${APP_HOST}/list?type=tv-shows` },
                    { text: "Hoạt hình", type: "radio", url: `${APP_HOST}/list?type=hoat-hinh` },
                    { text: "Phim Vietsub", type: "radio", url: `${APP_HOST}/list?type=phim-vietsub` },
                    { text: "Phim Thuyết Minh", type: "radio", url: `${APP_HOST}/list?type=phim-thuyet-minh` },
                    { text: "Phim Lồng Tiếng", type: "radio", url: `${APP_HOST}/list?type=phim-long-tieng` },
                ] },
            ],
            grid_number: 1,
            groups: [],
            option: {
                save_history: true,
                save_search_history: true,
                save_wishlist: true
            }
        };

        const addGroup = (id, name, display, items) => {
            if (items && items.length > 0) {
                response.groups.push({
                    id: id,
                    name: name,
                    display: display,
                    enable_detail: true,
                    grid_number: 1,
                    channels: items.map(item => formatChannel(item, req)),
                    remote_data: {
                        url: `${APP_HOST}/list?type=${id}`
                    }
                });
            }
        };

        addGroup("phim-moi-cap-nhat", "Mới cập nhật", "slider", phimMoi.items);
        addGroup("phim-bo", "Phim Bộ", "horizontal", phimBo.items);
        addGroup("phim-le", "Phim Lẻ", "horizontal", phimLe.items);
        addGroup("hoat-hinh", "Hoạt Hình", "horizontal", hoatHinh.items);
        addGroup("tv-shows", "TV Shows", "horizontal", tvShows.items);
        addGroup("phim-vietsub", "Phim Vietsub", "horizontal", phimVietsub.items);
        addGroup("phim-thuyet-minh", "Phim Thuyết Minh", "horizontal", phimThuyetMinh.items);
        addGroup("phim-long-tieng", "Phim Lồng Tiếng", "horizontal", phimLongTieng.items);

        res.json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 2. GET /detail?slug=...
app.get('/detail', async (req, res) => {
    const slug = req.query.slug;
    if (!slug) return res.status(400).json({ error: "Missing slug parameter" });

    try {
        const response = await axios.get(`${API_BASE}/phim/${slug}`);
        const data = response.data;
        if (!data.status) {
             return res.status(404).json({ error: "Movie not found" });
        }

        const movie = data.movie;
        const episodes = data.episodes || [];

        const contents = [];
        episodes.forEach(server => {
            const streams = [];
            if (server.server_data) {
                server.server_data.forEach(ep => {
                    streams.push({
                        id: `${server.server_name}-${ep.slug}`,
                        name: ep.name,
                        image: {
                            url: getPosterUrl(movie.thumb_url || movie.poster_url),
                            type: "contain",
                            width: 128,
                            height: 72
                        },
                        remote_data: {
                            url: `${APP_HOST}/stream?slug=${slug}&server=${encodeURIComponent(server.server_name)}&ep=${ep.slug}`
                        }
                    });
                });

                contents.push({
                    id: movie._id || movie.slug,
                    name: server.server_name,
                    grid_number: 3,
                    streams: streams
                });
            }
        });

        res.json({
            sources: [
                {
                    id: movie._id || movie.slug,
                    name: movie.name,
                    contents: contents
                }
            ]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get('/stream', async (req, res) => {
    const slug = req.query.slug;
    const server = req.query.server;
    const ep = req.query.ep;
    const start_time = req.query.start_time || 0;
    
    if (!slug) return res.status(400).json({ error: "Missing slug parameter" });
    if (!server) return res.status(400).json({ error: "Missing server parameter" });
    if (!ep) return res.status(400).json({ error: "Missing episode parameter" });

    try {
        const response = await axios.get(`${API_BASE}/phim/${slug}`);
        const data = response.data;
        if (!data.status) {
             return res.status(404).json({ error: "Movie not found" });
        }

        const movie = data.movie;
        const episodes = data.episodes || [];
        let id = "";
        let name = "";
        let stream_url = "";
        let stream_type = "hls";
        for(let i = 0; i < episodes.length; i++){
            let item = episodes[i];
            if(item.server_data?.length > 0 && item.server_name == server){
                for(let j = 0; j < item.server_data.length; j++){
                    let epItem = item.server_data[j];
                    if(epItem.slug == ep){
                        id = epItem.slug;
                        name = epItem.name;
                        stream_url = epItem.link_m3u8 || epItem.link_embed;
                        stream_type = epItem.link_m3u8 ? "hls" : "webview";
                        break;
                    }
                }
            }
        }
        
        res.json({
            stream_links: [{
                id: id,
                name: name,
                url: stream_url,
                type: stream_type,
                start_time: Number.parseInt(start_time),
                default: true
            }]
        });
    } catch (error) {
         console.error(error);
         res.status(500).json({ error: "Internal Server Error" });
    }
});

// 3. GET /search?keyword=...
app.get('/search', async (req, res) => {
    const keyword = req.query.keyword;
    if (!keyword) return res.status(400).json({ error: "Missing keyword parameter" });
    const limit = req.query.limit || 24;
    const page = req.query.page || 1;
    const sortType = req.query.sort_type || 'desc';
    const sortField = req.query.sort_field || 'modified.time';

    try {
        const { items, pagination }  = await fetchList(`${API_BASE}/v1/api/tim-kiem?keyword=${encodeURIComponent(keyword)}&limit=${limit}&page=${page}&sort_field=${sortField}&sort_type=${sortType}`);
        
        res.json({
            grid_number: 3,
            groups: [
                {
                    id: "near-matches",
                    name: `Kết quả tìm kiếm: ${keyword} (${pagination?.totalItems ?? 0})`,
                    display: "vertical",
                    enable_detail: true,
                    grid_number: 3,
                    channels: items.map(item => formatChannel(item, req)),
                }                
            ],
            load_more: {
                remote_data: {
                    url: `${APP_HOST}/search?keyword=${encodeURIComponent(keyword)}`
                },
                pageInfo: {
                    current_page: pagination.currentPage ?? page,
                    total: pagination.totalItems ?? 0,
                    per_page: pagination.totalItemsPerPage ?? limit,
                    last_page: pagination.totalPages ?? page
                },
                paging: {
                    page_key: "page",
                    size_key: "limit"
                }
            }
        });
    } catch (error) {
         console.error(error);
         res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get('/suggest', async (req, res) => {
    const keyword = req.query.keyword;
    if (!keyword) return res.status(400).json({ error: "Missing keyword parameter" });

    try {
        const { items }  = await fetchList(`${API_BASE}/v1/api/tim-kiem?keyword=${encodeURIComponent(keyword)}`);
        
        res.json(items.map(item => item.name));
    } catch (error) {
         console.error(error);
         res.status(500).json({ error: "Internal Server Error" });
    }
});

// 4. GET /list?type=...
app.get('/list', async (req, res) => {
    const type = req.query.type;
    const page = req.query.page || 1;
    const limit = req.query.limit || 24;
    const category = req.query.category;
    const country = req.query.country;
    const year = req.query.year;
    const sortField = req.query.sort_field || 'modified.time';
    const sortType = req.query.sort_type || 'desc';

    try {
        let url = `${API_BASE}/v1/api/danh-sach/${type}?page=${page}&limit=${limit}&sort_field=${sortField}&sort_type=${sortType}`;
        let remote_url = `${API_BASE}/v1/api/danh-sach/${type}?sort_field=${sortField}&sort_type=${sortType}`;
        if(country && !type){
            url = `${API_BASE}/v1/api/quoc-gia/${country}?page=${page}&limit=${limit}&sort_field=${sortField}&sort_type=${sortType}`;
            remote_url = `${API_BASE}/v1/api/quoc-gia/${country}?sort_field=${sortField}&sort_type=${sortType}`;
        }
        else if(category && !type){
            url = `${API_BASE}/v1/api/the-loai/${category}?page=${page}&limit=${limit}&sort_field=${sortField}&sort_type=${sortType}`;
            remote_url = `${API_BASE}/v1/api/the-loai/${category}?sort_field=${sortField}&sort_type=${sortType}`;
        }
        else if(year && !type){
            url = `${API_BASE}/v1/api/nam/${year}?page=${page}&limit=${limit}&sort_field=${sortField}&sort_type=${sortType}`;
            remote_url = `${API_BASE}/v1/api/nam/${year}?sort_field=${sortField}&sort_type=${sortType}`;
        }
        else{
            if(!type){
                type = "phim-moi-cap-nhat-v3";
            }
            url = `${API_BASE}/v1/api/danh-sach/${type}?page=${page}&limit=${limit}&sort_field=${sortField}&sort_type=${sortType}`;
            if (category) url += `&category=${category}`;
            if (country) url += `&country=${country}`;
            if (year) url += `&year=${year}`;
            remote_url = `${API_BASE}/v1/api/danh-sach/${type}?sort_field=${sortField}&sort_type=${sortType}`;
        }

        const { items, pagination } = await fetchList(url);

        res.json({
            grid_number: 3,
            enable_detail: true,
            channels: items.map(item => formatChannel(item, req)),
            load_more: {
                remote_data: {
                    url: `${remote_url}`
                },
                pageInfo: {
                    current_page: pagination.currentPage,
                    total: pagination.totalItems,
                    per_page: pagination.totalItemsPerPage,
                    last_page: pagination.totalPages
                },
                paging: {
                    page_key: "page",
                    size_key: "limit"
                }
            }
        });
    } catch (error) {
         console.error(error);
         res.status(500).json({ error: "Internal Server Error" });
    }
});

const PORT = process.env.PORT || APP_PORT;
app.listen(PORT, () => {
    console.log(`MonPlayer API Proxy is running on port ${PORT}`);
});
