const HOST = 'http://localhost:5000';
let old = [];

const slider1Options = {
    autoplay: true,
    infinite: true,
    pauseOnFocus: false,
    pauseOnHover: false,
}

const slider2Options = {
    autoplay: true,
    loop: true,
    pauseOnFocus: false,
    pauseOnHover: false,
}

function arraysAreIdentical(arr1, arr2) {
    if (arr1 === undefined || arr2 === undefined) return false;

    let string1
    let string2

    arr1.map(item => string1 += item)
    arr2.map(item => string2 += item)
    return string1 === string2;
}

const getCarousel = async (carouselIndex) => {
    const response = await fetch(`${HOST}/carousel?index=${carouselIndex}`);
    const json = await response.json();
    const is_same = arraysAreIdentical(old[carouselIndex], await json);
    old[carouselIndex] = await json;
    return await json;
}

const setContent = async (carouselIndex, carousel) => {
    const response = await fetch(`${HOST}/carousel?index=${carouselIndex}`);
    const items = await response.json()
    let html = ``;
    const is_same = arraysAreIdentical(old[carouselIndex], await items)
    if (is_same === false) {
        $(carousel).slick('unslick');
        $(`.slide-for-${carouselIndex}`).remove();
        await items.map(item => {
            html += `    
            <div class="slide-for-${carouselIndex}">
                <img src="${item}" alt="" />
            </div>
            `;
        });
        $(carousel).html(html);
        $(carousel).slick(carouselIndex === 1 ? slider1Options : slider2Options);
        return 0;
    }
};


const getContent = async (carouselIndex, carousel) => {
    console.log('getContent');
    const items = await getCarousel(carouselIndex);
    let html = ``;

    items.map(item => {
        html += `    
        <div class="slide-for-${carouselIndex}">
            <img src="${item}" alt="" />
        </div>
            `;
    });
    $(carousel).html(html);
};

(async () => {
    const video = document.querySelector('video');
    await getContent(1, '#leftCarousel');
    await getContent(2, '#rightTopCarousel');

    $('#rightTopCarousel').on('init', async (event, slick) => {
        if (slick.slideCount === 1) {
            const interval = setInterval(async () => {
                if (slick.slideCount > 1) {
                    clearInterval(interval);
                }
                await setContent(2, '#rightTopCarousel');
                return 0;
            }, 5000)
            return 0;
        };
    });

    $('#leftCarousel').on('init', async (event, slick) => {
        if (slick.slideCount === 1) {
            const interval = setInterval(async () => {
                if (slick.slideCount > 1) {
                    clearInterval(interval);
                }
                await setContent(1, '#leftCarousel');
                return 0;
            }, 5000)
            return 0;
        };
    });

    $('#leftCarousel').slick(slider1Options);
    $('#rightTopCarousel').slick(slider2Options);

    $('#leftCarousel').on('beforeChange', async function (event, slick, currentSlide, nextSlide) {
        if (nextSlide === 0) {
            await setContent(1, '#leftCarousel');
        }
    });

    $('#rightTopCarousel').on('beforeChange', async function (event, slick, currentSlide, nextSlide) {
        if (nextSlide === 0) {
            await setContent(2, '#rightTopCarousel');
        }
    });

    $('#leftCarousel').on('afterChange', async function (event, slick, currentSlide, nextSlide) {
        if (slick.slideCount === 1) {
            const interval = setInterval(async () => {
                if (slick.slideCount > 1) {
                    clearInterval(interval);
                }
                await setContent(1, '#leftCarousel');
                return 0;
            }, 5000)
            return 0;
        };
    });

    $('#rightTopCarousel').on('afterChange', async function (event, slick, currentSlide, nextSlide) {
        if (slick.slideCount === 1) {
            const interval = setInterval(async () => {
                if (slick.slideCount > 1) {
                    clearInterval(interval);
                }
                await setContent(2, '#leftCarousel');
                return 0;
            }, 5000)
            return 0;
        };
    });

    let activeVideo = 0;
    let videos = await getCarousel(3);
    video.src = videos[activeVideo];
    video.play();

    video.addEventListener('error', async () => {
        activeVideo = 0;
        videos = await getCarousel(3);
        video.src = videos[activeVideo];
        await video.play();
    });

    video.addEventListener('ended', async () => {
        if (videos.length === activeVideo) {
            activeVideo = 0;
            videos = await getCarousel(3);
            video.src = videos[activeVideo];
            await video.play();
            return 0;
        }
        activeVideo++;
        video.src = videos[activeVideo]
        await video.play()
    });

})()
