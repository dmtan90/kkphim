const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

// Helper for dynamic app host
const getAppHost = (req, prefix = '') => {
    const host = req.get('host');
    const protocol = req.protocol;
    // console.log(protocol, host);
    return `https://${host}${prefix}`;
};

// ==========================================
// KKPHIM API INTEGRATION (phimapi.com)
// ==========================================
const KKPHIM_API_BASE = 'https://phimapi.com';

const getPhimPosterUrl = (path) => {
    if (!path) return "";
    if (path.includes("phimimg.com")) {
        return `https://phimapi.com/image.php?url=${path}`;
    }
    else if(!path.startsWith("http")){
        return `https://phimapi.com/image.php?url=https://phimimg.com/${path}`;
    }
    return path;
};

const formatKkphimChannel = (item, landscape = true, req, appHost) => {
    let width = landscape ? 640 : 480;
    let height = landscape ? 480 : 640;
    let poster_url = item.poster_url || item.thumb_url;
    if (landscape) {
        poster_url = item.thumb_url || item.poster_url;
    }
    return {
        id: item.slug,
        name: item.name,
        subtitle: item.origin_name,
        description: getPhimDescription(item),
        type: "playlist",
        display: "text-below",
        enable_detail: true,
        image: {
            url: getPhimPosterUrl(poster_url),
            type: "cover",
            width: width,
            height: height
        },
        remote_data: {
            url: `${appHost}/detail?slug=${item.slug}`
        },
        share: {
            url: `${appHost}/detail?slug=${item.slug}`
        }
    };
};

const fetchKkphimList = async (url) => {
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
            pagination = data.pagination ?? {};
        } else if (Array.isArray(data)) {
            items = data;
        }
        return {items, pagination};
    } catch (error) {
        console.error(`Error fetching ${url}:`, error.message);
        return {items: [], pagination: {}};
    }
};

const createKkphimRouter = () => {
    const router = express.Router();

    router.get('/', async (req, res) => {
        const appHost = getAppHost(req, req.baseUrl);
        try {
            const [phimMoi, phimVN, phimTQ, phimUS, phimBo, phimLe, hoatHinh, tvShows, phimVietsub, phimLongTieng, phimThuyetMinh] = await Promise.all([
                fetchKkphimList(`${KKPHIM_API_BASE}/danh-sach/phim-moi-cap-nhat`),
                fetchKkphimList(`${KKPHIM_API_BASE}/v1/api/quoc-gia/viet-nam`),
                fetchKkphimList(`${KKPHIM_API_BASE}/v1/api/quoc-gia/trung-quoc`),
                fetchKkphimList(`${KKPHIM_API_BASE}/v1/api/quoc-gia/au-my`),
                fetchKkphimList(`${KKPHIM_API_BASE}/v1/api/danh-sach/phim-bo`),
                fetchKkphimList(`${KKPHIM_API_BASE}/v1/api/danh-sach/phim-le`),
                fetchKkphimList(`${KKPHIM_API_BASE}/v1/api/danh-sach/hoat-hinh`),
                fetchKkphimList(`${KKPHIM_API_BASE}/v1/api/danh-sach/tv-shows`),
                fetchKkphimList(`${KKPHIM_API_BASE}/v1/api/danh-sach/phim-vietsub`),
                fetchKkphimList(`${KKPHIM_API_BASE}/v1/api/danh-sach/phim-long-tieng`),
                fetchKkphimList(`${KKPHIM_API_BASE}/v1/api/danh-sach/phim-thuyet-minh`)
            ]);
            
            const response = {
                id: "kkphim",
                name: "KKPhim",
                description: "KKPhim - Ứng dụng xem phim miễn phí",
                url: `${appHost}`,
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
                    url: `${appHost}/search`,
                    suggest_url: `${appHost}/suggest`,
                    search_key: "keyword",
                    paging: {
                        page_key: "page",
                        size_key: "limit"
                    }
                },
                sorts: [
                    { type: "dropdown", text: "Thể loại", value: [
                        { text: "Hành Động", type: "radio", url: `${appHost}/list?category=hanh-dong` },
                        { text: "Hài Hước", type: "radio", url: `${appHost}/list?category=hai-huoc` },
                        { text: "Tình Cảm", type: "radio", url: `${appHost}/list?category=tinh-cam` },
                        { text: "Kinh Dị", type: "radio", url: `${appHost}/list?category=kinh-di` },
                        { text: "Phiêu Lưu", type: "radio", url: `${appHost}/list?category=phieu-luu` },
                        { text: "Khoa Học Viễn Tưởng", type: "radio", url: `${appHost}/list?category=khoa-hoc-vien-tuong` },
                        { text: "Tâm Lý", type: "radio", url: `${appHost}/list?category=tam-ly` },
                        { text: "Chính Kịch", type: "radio", url: `${appHost}/list?category=chinh-kich` },
                        { text: "Giả Tưởng", type: "radio", url: `${appHost}/list?category=gia-tuong` },
                        { text: "Gia Đình", type: "radio", url: `${appHost}/list?category=gia-dinh` },
                        { text: "Chiến Tranh", type: "radio", url: `${appHost}/list?category=chien-tranh` },
                        { text: "Hình Sự", type: "radio", url: `${appHost}/list?category=hinh-su` },
                        { text: "Âm Nhạc", type: "radio", url: `${appHost}/list?category=am-nhac` },
                        { text: "Thể Thao", type: "radio", url: `${appHost}/list?category=the-thao` },
                        { text: "Bí Ẩn", type: "radio", url: `${appHost}/list?category=bi-an` },
                        { text: "Lịch Sử", type: "radio", url: `${appHost}/list?category=lich-su` },
                        { text: "Phim Tài Liệu", type: "radio", url: `${appHost}/list?category=phim-tai-lieu` },
                        { text: "Phim Ngắn", type: "radio", url: `${appHost}/list?category=phim-ngan` },
                        { text: "Phim Lẻ", type: "radio", url: `${appHost}/list?category=phim-le` },
                        { text: "Phim Bộ", type: "radio", url: `${appHost}/list?category=phim-bo` },
                        { text: "Hoạt Hình", type: "radio", url: `${appHost}/list?category=hoat-hinh` },
                        { text: "TV Shows", type: "radio", url: `${appHost}/list?category=tv-shows` }
                    ] },
                    { type: "dropdown", text: "Quốc gia", value: [
                        { text: "Việt Nam", type: "radio", url: `${appHost}/list?country=viet-nam` },
                        { text: "Trung Quốc", type: "radio", url: `${appHost}/list?country=trung-quoc` },
                        { text: "Hồng Kông", type: "radio", url: `${appHost}/list?country=hong-kong` },
                        { text: "Hàn Quốc", type: "radio", url: `${appHost}/list?country=han-quoc` },
                        { text: "Nhật Bản", type: "radio", url: `${appHost}/list?country=nhat-ban` },
                        { text: "Mỹ", type: "radio", url: `${appHost}/list?country=my` },
                        { text: "Anh", type: "radio", url: `${appHost}/list?country=anh` },
                        { text: "Pháp", type: "radio", url: `${appHost}/list?country=phap` },
                        { text: "Đức", type: "radio", url: `${appHost}/list?country=duc` },
                        { text: "Ấn Độ", type: "radio", url: `${appHost}/list?country=an-do` },
                        { text: "Thái Lan", type: "radio", url: `${appHost}/list?country=thai-lan` },
                        { text: "Tây Ban Nha", type: "radio", url: `${appHost}/list?country=tay-ban-nha` },
                        { text: "Ý", type: "radio", url: `${appHost}/list?country=y` },
                        { text: "Châu Âu", type: "radio", url: `${appHost}/list?country=chau-au` },
                        { text: "Châu Á", type: "radio", url: `${appHost}/list?country=chau-a` },
                        { text: "Châu Mỹ", type: "radio", url: `${appHost}/list?country=chau-my` },
                        { text: "Châu Phi", type: "radio", url: `${appHost}/list?country=chau-phi` },
                        { text: "Châu Úc", type: "radio", url: `${appHost}/list?country=chau-uc` }
                    ] },
                    { type: "dropdown", text: "Năm", value: [
                        { text: "2026", type: "radio", url: `${appHost}/list?year=2026` },
                        { text: "2025", type: "radio", url: `${appHost}/list?year=2025` },
                        { text: "2024", type: "radio", url: `${appHost}/list?year=2024` },
                        { text: "2023", type: "radio", url: `${appHost}/list?year=2023` },
                        { text: "2022", type: "radio", url: `${appHost}/list?year=2022` },
                        { text: "2021", type: "radio", url: `${appHost}/list?year=2021` },
                        { text: "2020", type: "radio", url: `${appHost}/list?year=2020` },
                        { text: "2019", type: "radio", url: `${appHost}/list?year=2019` },
                        { text: "2018", type: "radio", url: `${appHost}/list?year=2018` },
                        { text: "2017", type: "radio", url: `${appHost}/list?year=2017` },
                        { text: "2016", type: "radio", url: `${appHost}/list?year=2016` },
                        { text: "2015", type: "radio", url: `${appHost}/list?year=2015` },
                        { text: "2014", type: "radio", url: `${appHost}/list?year=2014` },
                        { text: "2013", type: "radio", url: `${appHost}/list?year=2013` },
                        { text: "2012", type: "radio", url: `${appHost}/list?year=2012` },
                        { text: "2011", type: "radio", url: `${appHost}/list?year=2011` },
                        { text: "2010", type: "radio", url: `${appHost}/list?year=2010` }
                    ] },
                    { type: "dropdown", text: "Phân loại", value: [
                        { text: "Phim bộ", type: "radio", url: `${appHost}/list?type=phim-bo` },
                        { text: "Phim lẻ", type: "radio", url: `${appHost}/list?type=phim-le` },
                        { text: "TV Shows", type: "radio", url: `${appHost}/list?type=tv-shows` },
                        { text: "Hoạt hình", type: "radio", url: `${appHost}/list?type=hoat-hinh` },
                        { text: "Phim Vietsub", type: "radio", url: `${appHost}/list?type=phim-vietsub` },
                        { text: "Phim Thuyết Minh", type: "radio", url: `${appHost}/list?type=phim-thuyet-minh` },
                        { text: "Phim Lồng Tiếng", type: "radio", url: `${appHost}/list?type=phim-long-tieng` }
                    ] }
                ],
                grid_number: 1,
                groups: [],
                option: {
                    save_history: true,
                    save_search_history: true,
                    save_wishlist: true
                }
            };

            const addGroup = (id, name, display, items, type = '', country = '', year = '') => {
                if (items && items.length > 0) {
                    response.groups.push({
                        id: id,
                        name: name,
                        display: display,
                        enable_detail: true,
                        grid_number: 1,
                        channels: items.map(item => formatKkphimChannel(item, false, req, appHost)),
                        remote_data: type || country || year ? {
                            url: `${appHost}/list?type=${type}&country=${country}&year=${year}`
                        } : null
                    });
                }
            };

            addGroup("phim-moi-cap-nhat", "Mới cập nhật", "slider", phimMoi.items, 'phim-moi-cap-nhat');
            addGroup("viet-nam", "Phim Việt Nam", "horizontal", phimVN.items, '', 'viet-nam');
            addGroup("trung-quoc", "Phim Trung Quốc", "horizontal", phimTQ.items, '', 'trung-quoc');
            addGroup("au-my", "Âu Mỹ", "horizontal", phimUS.items, '', 'au-my');
            addGroup("phim-bo", "Phim Bộ", "horizontal", phimBo.items, 'phim-bo');
            addGroup("phim-le", "Phim Lẻ", "horizontal", phimLe.items, 'phim-le');
            addGroup("hoat-hinh", "Hoạt Hình", "horizontal", hoatHinh.items, 'hoat-hinh');
            addGroup("tv-shows", "TV Shows", "horizontal", tvShows.items, 'tv-shows');
            addGroup("phim-vietsub", "Phim Vietsub", "horizontal", phimVietsub.items, 'phim-vietsub');
            addGroup("phim-thuyet-minh", "Phim Thuyết Minh", "horizontal", phimThuyetMinh.items, 'phim-thuyet-minh');
            addGroup("phim-long-tieng", "Phim Lồng Tiếng", "horizontal", phimLongTieng.items, 'phim-long-tieng');

            res.json(response);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    });

    router.get('/detail', async (req, res) => {
        const appHost = getAppHost(req, req.baseUrl);
        const slug = req.query.slug;
        if (!slug) return res.status(400).json({ error: "Missing slug parameter" });

        try {
            const response = await axios.get(`${KKPHIM_API_BASE}/phim/${slug}`);
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
                        if(ep.link_embed || ep.link_m3u8 || ep.link_m3u){
                            streams.push({
                                id: `${server.server_name}-${ep.slug}`,
                                name: ep.name,
                                remote_data: {
                                    url: `${appHost}/stream?slug=${slug}&server=${encodeURIComponent(server.server_name)}&ep=${ep.slug}`
                                }
                            });   
                        }
                    });

                    contents.push({
                        id: `${movie._id || movie.slug}-${server.server_name}`,
                        name: server.server_name,
                        grid_number: 3,
                        streams: streams
                    });
                }
            });

            res.json({
                id: movie._id || movie.slug,
                name: movie.name,
                subtitle: movie.origin_name || movie.name,
                description: getPhimDescription(movie),
                type: "playlist",
                display: "text-below",
                enable_detail: true,
                image: {
                    url: getPhimPosterUrl(movie.thumb_url || movie.poster_url),
                    type: "cover",
                    width: 640,
                    height: 480
                },
                remote_data: {
                    url: `${appHost}/detail?slug=${movie.slug}`
                },
                share: {
                    url: `${appHost}/detail?slug=${movie.slug}`
                },
                sources: [
                    {
                        id: movie._id || movie.slug,
                        name: "Nguồn",
                        contents: contents
                    }
                ]
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    });

    router.get('/stream', async (req, res) => {
        const slug = req.query.slug;
        const server = req.query.server;
        const ep = req.query.ep;
        const start_time = req.query.start_time || 0;
        
        if (!slug) return res.status(400).json({ error: "Missing slug parameter" });
        if (!server) return res.status(400).json({ error: "Missing server parameter" });
        if (!ep) return res.status(400).json({ error: "Missing episode parameter" });

        try {
            const response = await axios.get(`${KKPHIM_API_BASE}/phim/${slug}`);
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
                if(item.server_data?.length > 0 && item.server_name === server){
                    for(let j = 0; j < item.server_data.length; j++){
                        let epItem = item.server_data[j];
                        if(epItem.slug === ep){
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
                    default: false
                }]
            });
        } catch (error) {
             console.error(error);
             res.status(500).json({ error: "Internal Server Error" });
        }
    });

    router.get('/search', async (req, res) => {
        const appHost = getAppHost(req, req.baseUrl);
        const keyword = req.query.keyword;
        if (!keyword) return res.status(400).json({ error: "Missing keyword parameter" });
        const limit = req.query.limit || 24;
        const page = req.query.page || 1;
        const sortType = req.query.sort_type || 'desc';
        const sortField = req.query.sort_field || '_id';

        try {
            const { items, pagination }  = await fetchKkphimList(`${KKPHIM_API_BASE}/v1/api/tim-kiem?keyword=${encodeURIComponent(keyword)}&limit=${limit}&page=${page}&sort_field=${sortField}&sort_type=${sortType}`);
            
            res.json({
                grid_number: 3,
                groups: [
                    {
                        id: "near-matches",
                        name: `Kết quả tìm kiếm: ${keyword} (${pagination?.totalItems ?? 0})`,
                        display: "vertical",
                        enable_detail: true,
                        grid_number: 3,
                        channels: items.map(item => formatKkphimChannel(item, false, req, appHost)),
                    }
                ],
                load_more: {
                    remote_data: {
                        url: `${appHost}/search?keyword=${encodeURIComponent(keyword)}`
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

    router.get('/suggest', async (req, res) => {
        const keyword = req.query.keyword;
        if (!keyword) return res.status(400).json({ error: "Missing keyword parameter" });

        try {
            const { items }  = await fetchKkphimList(`${KKPHIM_API_BASE}/v1/api/tim-kiem?keyword=${encodeURIComponent(keyword)}`);
            res.json(items.map(item => item.name));
        } catch (error) {
             console.error(error);
             res.status(500).json({ error: "Internal Server Error" });
        }
    });

    router.get('/list', async (req, res) => {
        const appHost = getAppHost(req, req.baseUrl);
        let type = req.query.type || "";
        const page = req.query.page || 1;
        const limit = req.query.limit || 24;
        const category = req.query.category;
        const country = req.query.country;
        const year = req.query.year;
        const sortField = req.query.sort_field || '_id';
        const sortType = req.query.sort_type || 'desc';
        if(!type && !category && !country && !year){
            type = "phim-moi-cap-nhat";
        }

        try {
            let url = `${KKPHIM_API_BASE}/v1/api/danh-sach/${type}?page=${page}&limit=${limit}&sort_field=${sortField}&sort_type=${sortType}`;
            let remote_url = `${appHost}/list?type=${type}&page=${page}&limit=${limit}&sort_field=${sortField}&sort_type=${sortType}`;

            if(country && !type){
                url = `${KKPHIM_API_BASE}/v1/api/quoc-gia/${country}?page=${page}&limit=${limit}&sort_field=${sortField}&sort_type=${sortType}`;
                remote_url += `&country=${country}`;
            }
            else if(category && !type){
                url = `${KKPHIM_API_BASE}/v1/api/the-loai/${category}?page=${page}&limit=${limit}&sort_field=${sortField}&sort_type=${sortType}`;
                remote_url += `&category=${category}`;
            }
            else if(year && !type){
                url = `${KKPHIM_API_BASE}/v1/api/nam/${year}?page=${page}&limit=${limit}&sort_field=${sortField}&sort_type=${sortType}`;
                remote_url += `&year=${year}`;
            }
            else if(type && type.includes('phim-moi-cap-nhat')){
                url = `${KKPHIM_API_BASE}/danh-sach/${type}?page=${page}&limit=${limit}&sort_field=${sortField}&sort_type=${sortType}`;
            }
            else{
                // remote_url += `&type=${type}`;
                if (category){
                    url += `&category=${category}`;
                    remote_url += `&category=${category}`;
                } 
                if (country){
                    url += `&country=${country}`;
                    remote_url += `&country=${country}`;
                } 
                if (year){
                    url += `&year=${year}`;
                    remote_url += `&year=${year}`;
                } 
            }

            const { items, pagination } = await fetchKkphimList(url);

            res.json({
                grid_number: 3,
                enable_detail: true,
                channels: items.map(item => formatKkphimChannel(item, false, req, appHost)),
                load_more: {
                    remote_data: {
                        url: remote_url
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

    return router;
};

// ==========================================
// NGUONC API INTEGRATION (phim.nguonc.com)
// ==========================================
const NGUONC_API_BASE = 'https://phim.nguonc.com/api';

const resolveNguoncStream = async (embedUrl) => {
    try {
        // const parsedUrl = new URL(embedUrl);
        // const domain = parsedUrl.origin;
        
        // const response = await axios.get(embedUrl, {
        //     headers: {
        //         'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        //         'Referer': embedUrl
        //     }
        // });
        
        // const html = response.data;
        // const matchObf = html.match(/data-obf=["']([^"']+)["']/);
        // if (matchObf && matchObf[1]) {
        //     const obfBase64 = matchObf[1];
        //     const streamData = JSON.parse(atob(obfBase64));
        //     if (streamData.sUb) {
        //         return {
        //             url: `${domain}/${streamData.sUb}.m3u8`,
        //             hash: streamData.hD || ""
        //         };
        //     }
        // }
    } catch (error) {
        console.error("Error resolving NguonC stream:", error.message);
    }
    return null;
};

const formatNguoncChannel = (item, landscape = true, req, appHost) => {
    let width = landscape ? 640 : 480;
    let height = landscape ? 480 : 640;
    let poster_url = item.thumb_url || item.poster_url;
    if (landscape) {
        poster_url = item.poster_url || item.thumb_url;
    }
    return {
        id: item.slug,
        name: item.name,
        subtitle: item.original_name,
        description: getPhimDescription(item),
        type: "playlist",
        display: "text-below",
        enable_detail: true,
        image: {
            url: getPhimPosterUrl(poster_url), // getPhimPosterUrl handles http prefix correctly
            type: "cover",
            width: width,
            height: height
        },
        remote_data: {
            url: `${appHost}/detail?slug=${item.slug}`
        },
        share: {
            url: `${appHost}/detail?slug=${item.slug}`
        }
    };
};

function getPhimDescription(movie) {
  const { description, original_name } = movie;
  if (description) {
    return description.replace(/<[^>]*>/g, '').trim();
  }

  const categories = [];
  if (movie.category && movie.category['2'] && Array.isArray(movie.category['2'].list)) {
    movie.category['2'].list.forEach(c => categories.push(c.name));
  }
  const catStr = categories.join(', ');

  let country = '';
  if (movie.category && movie.category['4'] && Array.isArray(movie.category['4'].list)) {
    country = movie.category['4'].list.map(c => c.name).join(', ');
  }

  return `Xem phim ${movie.name} (${original_name || 'đang cập nhật'}) - ${country} ${catStr}`;
}

const fetchNguoncList = async (url) => {
    try {
        const response = await axios.get(url);
        const data = response.data;
        
        let items = [];
        let pagination = {};
        if (data.data && Array.isArray(data.data.items)) {
            items = data.data.items;
            pagination = data.data.params?.paginate ?? {};
        } else if (data.items && Array.isArray(data.items)) {
            items = data.items;
            pagination = data.paginate ?? {};
        } else if (Array.isArray(data)) {
            items = data;
        }
        return {items, pagination};
    } catch (error) {
        console.error(`Error fetching ${url}:`, error.message);
        return {items: [], pagination: {}};
    }
};

const createNguoncRouter = () => {
    const router = express.Router();

    router.get('/', async (req, res) => {
        const appHost = getAppHost(req, req.baseUrl);
        try {
            const [phimMoi, phimVN, phimTQ, phimUS, phimBo, phimLe, phimHoatHinh, tvShows, phimDangChieu] = await Promise.all([
                fetchNguoncList(`${NGUONC_API_BASE}/films/phim-moi-cap-nhat`),
                fetchNguoncList(`${NGUONC_API_BASE}/films/quoc-gia/viet-nam`),
                fetchNguoncList(`${NGUONC_API_BASE}/films/quoc-gia/trung-quoc`),
                fetchNguoncList(`${NGUONC_API_BASE}/films/quoc-gia/au-my`),
                fetchNguoncList(`${NGUONC_API_BASE}/films/danh-sach/phim-bo`),
                fetchNguoncList(`${NGUONC_API_BASE}/films/danh-sach/phim-le`),
                fetchNguoncList(`${NGUONC_API_BASE}/films/danh-sach/hoat-hinh`),
                fetchNguoncList(`${NGUONC_API_BASE}/films/danh-sach/tv-shows`),
                fetchNguoncList(`${NGUONC_API_BASE}/films/danh-sach/phim-dang-chieu`)
            ]);
            
            const response = {
                id: "nguonc",
                name: "NguonC Phim",
                description: "NguonC Phim - Ứng dụng xem phim chất lượng cao",
                url: `${appHost}`,
                color: "#2c70b0",
                image: {
                    url: "https://phim.nguonc.com/public/images/Logo/logonc.png",
                    type: "contain",
                    height: 111,
                    width: 300
                },
                notice: {
                    id: "notice",
                    link: "https://phim.nguonc.com",
                    text: "Info",
                    icon: "https://phim.nguonc.com/public/images/Logo/logonc.png",
                    closeable: true
                },
                search: {
                    url: `${appHost}/search`,
                    suggest_url: `${appHost}/suggest`,
                    search_key: "keyword",
                    paging: {
                        page_key: "page",
                        size_key: "limit"
                    }
                },
                sorts: [
                    { type: "dropdown", text: "Thể loại", value: [
                        { text: "Hành Động", type: "radio", url: `${appHost}/list?category=hanh-dong` },
                        { text: "Phiêu Lưu", type: "radio", url: `${appHost}/list?category=phieu-luu` },
                        { text: "Hoạt Hình", type: "radio", url: `${appHost}/list?category=hoat-hinh` },
                        { text: "Hài Hước", type: "radio", url: `${appHost}/list?category=phim-hai` },
                        { text: "Hình Sự", type: "radio", url: `${appHost}/list?category=hinh-su` },
                        { text: "Tài Liệu", type: "radio", url: `${appHost}/list?category=tai-lieu` },
                        { text: "Chính Kịch", type: "radio", url: `${appHost}/list?category=chinh-kich` },
                        { text: "Gia Đình", type: "radio", url: `${appHost}/list?category=gia-dinh` },
                        { text: "Giả Tưởng", type: "radio", url: `${appHost}/list?category=gia-tuong` },
                        { text: "Lịch Sử", type: "radio", url: `${appHost}/list?category=lich-su` },
                        { text: "Kinh Dị", type: "radio", url: `${appHost}/list?category=kinh-di` },
                        { text: "Nhạc", type: "radio", url: `${appHost}/list?category=phim-nhac` },
                        { text: "Bí Ẩn", type: "radio", url: `${appHost}/list?category=bi-an` },
                        { text: "Lãng Mạn", type: "radio", url: `${appHost}/list?category=lang-man` },
                        { text: "Khoa Học Viễn Tưởng", type: "radio", url: `${appHost}/list?category=khoa-hoc-vien-tuong` },
                        { text: "Gây Cấn", type: "radio", url: `${appHost}/list?category=gay-can` },
                        { text: "Chiến Tranh", type: "radio", url: `${appHost}/list?category=chien-tranh` },
                        { text: "Tâm Lý", type: "radio", url: `${appHost}/list?category=tam-ly` },
                        { text: "Tình Cảm", type: "radio", url: `${appHost}/list?category=tinh-cam` },
                        { text: "Cổ Trang", type: "radio", url: `${appHost}/list?category=co-trang` },
                        { text: "Miền Tây", type: "radio", url: `${appHost}/list?category=mien-tay` },
                        // { text: "Phim 18+", type: "radio", url: `${appHost}/list?category=phim-18` }
                    ] },
                    { type: "dropdown", text: "Quốc gia", value: [
                        { text: "Việt Nam", type: "radio", url: `${appHost}/list?country=viet-nam` },
                        { text: "Âu Mỹ", type: "radio", url: `${appHost}/list?country=au-my` },
                        { text: "Anh", type: "radio", url: `${appHost}/list?country=anh` },
                        { text: "Trung Quốc", type: "radio", url: `${appHost}/list?country=trung-quoc` },
                        { text: "Indonesia", type: "radio", url: `${appHost}/list?country=indonesia` },
                        { text: "Pháp", type: "radio", url: `${appHost}/list?country=phap` },
                        { text: "Hồng Kông", type: "radio", url: `${appHost}/list?country=hong-kong` },
                        { text: "Hàn Quốc", type: "radio", url: `${appHost}/list?country=han-quoc` },
                        { text: "Nhật Bản", type: "radio", url: `${appHost}/list?country=nhat-ban` },
                        { text: "Thái Lan", type: "radio", url: `${appHost}/list?country=thai-lan` },
                        { text: "Đài Loan", type: "radio", url: `${appHost}/list?country=dai-loan` },
                        { text: "Nga", type: "radio", url: `${appHost}/list?country=nga` },
                        { text: "Hà Lan", type: "radio", url: `${appHost}/list?country=ha-lan` },
                        { text: "Philippines", type: "radio", url: `${appHost}/list?country=philippines` },
                        { text: "Ấn Độ", type: "radio", url: `${appHost}/list?country=an-do` },
                        { text: "Quốc gia khác", type: "radio", url: `${appHost}/list?country=quoc-gia-khac` }
                    ] },
                    { type: "dropdown", text: "Năm", value: [
                        { text: "2026", type: "radio", url: `${appHost}/list?year=2026` },
                        { text: "2025", type: "radio", url: `${appHost}/list?year=2025` },
                        { text: "2024", type: "radio", url: `${appHost}/list?year=2024` },
                        { text: "2023", type: "radio", url: `${appHost}/list?year=2023` },
                        { text: "2022", type: "radio", url: `${appHost}/list?year=2022` },
                        { text: "2021", type: "radio", url: `${appHost}/list?year=2021` },
                        { text: "2020", type: "radio", url: `${appHost}/list?year=2020` },
                        { text: "2019", type: "radio", url: `${appHost}/list?year=2019` },
                        { text: "2018", type: "radio", url: `${appHost}/list?year=2018` },
                        { text: "2017", type: "radio", url: `${appHost}/list?year=2017` },
                        { text: "2016", type: "radio", url: `${appHost}/list?year=2016` },
                        { text: "2015", type: "radio", url: `${appHost}/list?year=2015` },
                        { text: "2014", type: "radio", url: `${appHost}/list?year=2014` },
                        { text: "2013", type: "radio", url: `${appHost}/list?year=2013` },
                        { text: "2012", type: "radio", url: `${appHost}/list?year=2012` },
                        { text: "2011", type: "radio", url: `${appHost}/list?year=2011` },
                        { text: "2010", type: "radio", url: `${appHost}/list?year=2010` },
                        { text: "2009", type: "radio", url: `${appHost}/list?year=2009` },
                        { text: "2008", type: "radio", url: `${appHost}/list?year=2008` },
                        { text: "2007", type: "radio", url: `${appHost}/list?year=2007` },
                        { text: "2006", type: "radio", url: `${appHost}/list?year=2006` },
                        { text: "2005", type: "radio", url: `${appHost}/list?year=2005` },
                        { text: "2004", type: "radio", url: `${appHost}/list?year=2004` }
                    ] },
                    { type: "dropdown", text: "Phân loại", value: [
                        { text: "Phim bộ", type: "radio", url: `${appHost}/list?type=phim-bo` },
                        { text: "Phim lẻ", type: "radio", url: `${appHost}/list?type=phim-le` },
                        { text: "TV Shows", type: "radio", url: `${appHost}/list?type=tv-shows` },
                        { text: "Phim đang chiếu", type: "radio", url: `${appHost}/list?type=phim-dang-chieu` }
                    ] }
                ],
                grid_number: 1,
                groups: [],
                option: {
                    save_history: true,
                    save_search_history: true,
                    save_wishlist: true
                }
            };

            const addGroup = (id, name, display, items, type = '', country = '', year = '') => {
                if (items && items.length > 0) {
                    response.groups.push({
                        id: id,
                        name: name,
                        display: display,
                        enable_detail: true,
                        grid_number: 1,
                        channels: items.map(item => formatNguoncChannel(item, false, req, appHost)),
                        remote_data: type || country || year ? {
                            url: `${appHost}/list?type=${type}&country=${country}&year=${year}`
                        } : null
                    });
                }
            };

            addGroup("phim-moi-cap-nhat", "Mới cập nhật", "slider", phimMoi.items, 'phim-moi-cap-nhat');
            addGroup("phim-vn", "Phim Việt Nam", "horizontal", phimVN.items, '', 'viet-nam');
            addGroup("phim-tq", "Phim Trung Quốc", "horizontal", phimTQ.items, '', 'trung-quoc');
            addGroup("phim-us", "Phim Âu Mỹ", "horizontal", phimUS.items, '', 'au-my');
            addGroup("phim-bo", "Phim Bộ", "horizontal", phimBo.items, 'phim-bo');
            addGroup("phim-le", "Phim Lẻ", "horizontal", phimLe.items, 'phim-le');
            addGroup("phim-hoat-hinh", "Phim Hoạt Hình", "horizontal", phimHoatHinh.items, 'hoat-hinh');
            addGroup("tv-shows", "TV Shows", "horizontal", tvShows.items, 'tv-shows');
            addGroup("phim-dang-chieu", "Phim Đang Chiếu", "horizontal", phimDangChieu.items, 'phim-dang-chieu');

            res.json(response);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    });

    router.get('/detail', async (req, res) => {
        const appHost = getAppHost(req, req.baseUrl);
        const slug = req.query.slug;
        if (!slug) return res.status(400).json({ error: "Missing slug parameter" });

        try {
            const response = await axios.get(`${NGUONC_API_BASE}/film/${slug}`);
            const data = response.data;
            if (data.status !== "success" || !data.movie) {
                 return res.status(404).json({ error: "Movie not found" });
            }

            const movie = data.movie;
            const episodes = movie.episodes || [];

            const contents = [];
            episodes.forEach(server => {
                const streams = [];
                if (server.items) {
                    server.items.forEach(ep => {
                        if(ep.embed || ep.m3u8){
                            streams.push({
                                id: `${server.server_name}-${ep.slug}`,
                                name: ep.name,
                                remote_data: {
                                    url: `${appHost}/stream?slug=${slug}&server=${encodeURIComponent(server.server_name)}&ep=${ep.slug}`
                                }
                            });   
                        }
                    });

                    contents.push({
                        id: `${movie.id || movie.slug}-${server.server_name}`,
                        name: server.server_name,
                        grid_number: 3,
                        streams: streams
                    });
                }
            });

            res.json({
                id: movie.id || movie.slug,
                name: movie.name,
                subtitle: movie.original_name || movie.name,
                description: getPhimDescription(movie),
                type: "playlist",
                display: "text-below",
                enable_detail: true,
                image: {
                    url: getPhimPosterUrl(movie.thumb_url || movie.poster_url),
                    type: "cover",
                    width: 640,
                    height: 480
                },
                remote_data: {
                    url: `${appHost}/detail?slug=${movie.slug}`
                },
                share: {
                    url: `${appHost}/detail?slug=${movie.slug}`
                },
                sources: [
                    {
                        id: movie.id || movie.slug,
                        name: "Nguồn",
                        contents: contents
                    }
                ]
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    });

    router.get('/stream', async (req, res) => {
        const slug = req.query.slug;
        const server = req.query.server;
        const ep = req.query.ep;
        const start_time = req.query.start_time || 0;
        
        if (!slug) return res.status(400).json({ error: "Missing slug parameter" });
        if (!server) return res.status(400).json({ error: "Missing server parameter" });
        if (!ep) return res.status(400).json({ error: "Missing episode parameter" });

        try {
            const response = await axios.get(`${NGUONC_API_BASE}/film/${slug}`);
            const data = response.data;
            if (data.status !== "success" || !data.movie) {
                 return res.status(404).json({ error: "Movie not found" });
            }

            const movie = data.movie;
            const episodes = movie.episodes || [];
            let id = "";
            let name = "";
            let embedUrl = "";
            let fallbackM3u8 = "";
            
            for(let i = 0; i < episodes.length; i++){
                let item = episodes[i];
                if(item.items?.length > 0 && item.server_name === server){
                    for(let j = 0; j < item.items.length; j++){
                        let epItem = item.items[j];
                        if(epItem.slug === ep){
                            id = epItem.slug;
                            name = epItem.name;
                            embedUrl = epItem.embed || "";
                            fallbackM3u8 = epItem.m3u8 || "";
                            break;
                        }
                    }
                }
            }
            
            let stream_url = embedUrl || fallbackM3u8;
            let stream_type = embedUrl ? "webview" : "hls";
            let video_hash = "";
            
            if (embedUrl) {
                // Fetch the embed link and extract the real HLS stream
                const resolved = await resolveNguoncStream(embedUrl);
                if (resolved && resolved.url) {
                    stream_url = resolved.url;
                    stream_type = "hls";
                    video_hash = resolved.hash;
                    console.log(`[NguonC Stream Resolver] Successfully resolved native HLS for slug "${slug}" ep "${ep}": ${resolved.url}`);
                } else {
                    console.log(`[NguonC Stream Resolver] Failed to resolve native HLS for slug "${slug}" ep "${ep}". Falling back to embed webview.`);
                }
            }
            
            res.json({
                stream_links: [{
                    id: id,
                    name: name,
                    url: stream_url,
                    type: stream_type,
                    start_time: Number.parseInt(start_time),
                    video_hash: video_hash,
                    default: false
                }]
            });
        } catch (error) {
             console.error(error);
             res.status(500).json({ error: "Internal Server Error" });
        }
    });

    router.get('/search', async (req, res) => {
        const appHost = getAppHost(req, req.baseUrl);
        const keyword = req.query.keyword;
        if (!keyword) return res.status(400).json({ error: "Missing keyword parameter" });
        const page = req.query.page || 1;

        try {
            const { items, pagination: paginate }  = await fetchNguoncList(`${NGUONC_API_BASE}/films/search?keyword=${encodeURIComponent(keyword)}&page=${page}`);
            res.json({
                grid_number: 3,
                groups: [
                    {
                        id: "near-matches",
                        name: `Kết quả tìm kiếm: ${keyword} (${paginate.total_items ?? 0})`,
                        display: "vertical",
                        enable_detail: true,
                        grid_number: 3,
                        channels: items.map(item => formatNguoncChannel(item, false, req, appHost)),
                    }
                ],
                load_more: {
                    remote_data: {
                        url: `${appHost}/search?keyword=${encodeURIComponent(keyword)}`
                    },
                    pageInfo: {
                        current_page: paginate.current_page ?? page,
                        total: paginate.total_items ?? 0,
                        per_page: paginate.items_per_page ?? 10,
                        last_page: paginate.total_page ?? page
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

    router.get('/suggest', async (req, res) => {
        const keyword = req.query.keyword;
        if (!keyword) return res.status(400).json({ error: "Missing keyword parameter" });

        try {
            const { items }  = await fetchNguoncList(`${NGUONC_API_BASE}/films/search?keyword=${encodeURIComponent(keyword)}`);
            res.json(items.map(item => item.name));
        } catch (error) {
             console.error(error);
             res.status(500).json({ error: "Internal Server Error" });
        }
    });

    router.get('/list', async (req, res) => {
        const appHost = getAppHost(req, req.baseUrl);
        let type = req.query.type || "";
        const page = req.query.page || 1;
        const limit = req.query.limit || 10;
        const category = req.query.category;
        const country = req.query.country;
        const year = req.query.year;
        if(!category && !country && !year && !type){
            type = "phim-moi-cap-nhat";
        }

        try {
            let url = `${NGUONC_API_BASE}/films/${type}?page=${page}`;
            let remote_url = `${appHost}/list?type=${type}&limit=${limit}&page=${page}`;

            if (country) {
                url = `${NGUONC_API_BASE}/films/quoc-gia/${country}?page=${page}`;
                remote_url += `&country=${country}`;
            } else if (category) {
                url = `${NGUONC_API_BASE}/films/the-loai/${category}?page=${page}`;
                remote_url += `&category=${category}`;
            } else if (year) {
                url = `${NGUONC_API_BASE}/films/nam-phat-hanh/${year}?page=${page}`;
                remote_url += `&year=${year}`;
            } else if(type && type.includes('phim-moi-cap-nhat')){
                url = `${NGUONC_API_BASE}/films/${type}?page=${page}`;
            } else {
                if (category){
                    url += `&category=${category}`;
                    remote_url += `&category=${category}`;
                } 
                if (country){
                    url += `&country=${country}`;
                    remote_url += `&country=${country}`;
                } 
                if (year){
                    url += `&year=${year}`;
                    remote_url += `&year=${year}`;
                } 
            }

            const { items, pagination: paginate }  = await fetchNguoncList(url);
            res.json({
                grid_number: 3,
                enable_detail: true,
                channels: items.map(item => formatNguoncChannel(item, false, req, appHost)),
                load_more: {
                    remote_data: {
                        url: remote_url
                    },
                    pageInfo: {
                        current_page: paginate.current_page ?? page,
                        total: paginate.total_items ?? 0,
                        per_page: paginate.items_per_page ?? limit,
                        last_page: paginate.total_page ?? page
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

    return router;
};

// ==========================================
// EXPRESS MOUNTING & INITIALIZATION
// ==========================================
const kkphimRouter = createKkphimRouter();
const nguoncRouter = createNguoncRouter();

// 1. Mount prefix routes
app.use('/kkphim', kkphimRouter);
app.use('/nguonc', nguoncRouter);

// 2. Mount root fallback (pointing to KKPhim for backward compatibility)
app.use('/', kkphimRouter);

const APP_PORT = 3005;
const PORT = process.env.PORT || APP_PORT;
app.listen(PORT, () => {
    console.log(`MonPlayer Dual API Proxy is running on port ${PORT}`);
    console.log(`- KKPhim API active at http://localhost:${PORT}/kkphim (and fallback at /)`);
    console.log(`- NguonC API active at http://localhost:${PORT}/nguonc`);
});
