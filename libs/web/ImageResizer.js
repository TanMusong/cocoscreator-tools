(() => {
    const RESIZED_IMAGE_DATA_MAP = {};
    const noCacheRex = /\?/;
    const log = (text) => cc.log(`[ImageResizer]${text}`);

    const urlAppendTimestamp = (url) => {
        if (cc.game.config['noCache'] && typeof url === 'string') {
            const timestamp = new Date().getTime();
            url += (noCacheRex.test(url) ? '&_t=' : '?_t=') + timestamp;
        }
        return url;
    };

    const downloadImage = (item, callback, isCrossOrigin = true, img) => {
        let url = urlAppendTimestamp(item.url);
        const imageName = cc.path.basename(url).replace(cc.path.extname(url), '');
        const resizedImageData = RESIZED_IMAGE_DATA_MAP[imageName];
        if (resizedImageData) url = url.replace(imageName, resizedImageData.name);
        img = img || new Image();
        img.crossOrigin = isCrossOrigin && window.location.protocol !== 'file:' ? 'anonymous' : null;
        if (img.complete && img.naturalWidth > 0 && img.src === url) return img;
        const loadCallback = () => {
            if (resizedImageData) {
                const imgWidth = img.width;
                const imgHeight = img.height;
                img.width = resizedImageData.w;
                img.height = resizedImageData.h;
                log(`Resized Image Loaded, Url = ${url}, Resize = ${imgWidth}*${imgHeight} -> ${resizedImageData.w}*${resizedImageData.h}`);
            }
            img.removeEventListener('load', loadCallback);
            img.removeEventListener('error', errorCallback);
            img.id = item.id;
            callback(null, img);
        };
        const errorCallback = () => {
            img.removeEventListener('load', loadCallback);
            img.removeEventListener('error', errorCallback);
            if (window.location.protocol !== 'https:' && img.crossOrigin && img.crossOrigin.toLowerCase() === 'anonymous')
                downloadImage(item, callback, false, img);
            else
                callback(new Error(cc.debug.getError('4930', url)));
        };
        img.addEventListener('load', loadCallback);
        img.addEventListener('error', errorCallback);
        img.src = url;
    };

    cc.loader.downloader.addHandlers({
        'png': downloadImage,
        'jpg': downloadImage,
        'bmp': downloadImage,
        'jpeg': downloadImage,
        'gif': downloadImage,
        'ico': downloadImage,
        'tiff': downloadImage,
        'webp': downloadImage,
        'image': downloadImage,
    });

    log(`ImageResizer Lib Loaded`);
})();
