// import Swiper JS
import Swiper, { Navigation, Thumbs, Autoplay, Lazy } from "swiper"
import "swiper/css"

class Sliders {
  constructor() {
    this.initFullSlider()
    this.initCenteredSlider()
    this.initCardSlider()
    this.initCollectionsSlider()
    this.initCartSlider3Columns()
  }

  initFullSlider() {
    const swiperThumbs = new Swiper(".full-slider-thumbs", {
      modules: [Thumbs, Autoplay, Lazy],
      loop: true,
      slidesPerView: 2,
      breakpoints: {
        1024: {
          slidesPerView: 3
        }
      },
      freeMode: true,
      preloadImages: false,
      lazy: true,
      watchSlidesProgress: true
    })

    const swiper = new Swiper(".full-slider", {
      modules: [Thumbs, Autoplay, Lazy],
      speed: 400,
      slidesPerView: 1,
      loop: true,
      preloadImages: false,
      lazy: true,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false
      },
      thumbs: {
        swiper: swiperThumbs
      }
    })
  }

  initCenteredSlider() {
    const swiper = new Swiper(".centered-slider", {
      modules: [Lazy],
      speed: 400,
      spaceBetween: 30,
      slidesPerView: 2,
      slidesPerGroup: 1,
      centeredSlides: true,
      breakpoints: {
        560: {
          slidesPerView: 2,
          slidesPerGroup: 2
        },
        768: {
          slidesPerView: 4
        },
        1024: {
          slidesPerView: 4
        },
        1280: {
          slidesPerView: 6
        }
      },
      loop: true,
      preloadImages: false,
      lazy: true
    })
  }

  initCardSlider() {
    const swiper = new Swiper(".card-slider-4-columns", {
      modules: [Navigation, Lazy],
      speed: 400,
      spaceBetween: 30,
      slidesPerView: 1,
      breakpoints: {
        560: {
          slidesPerView: 2,
          slidesPerGroup: 2
        },
        768: {
          slidesPerView: 3,
          slidesPerGroup: 3
        },
        1024: {
          slidesPerView: 3,
          slidesPerGroup: 3
        },
        1200: {
          slidesPerView: 4,
          slidesPerGroup: 4
        }
      },
      preloadImages: false,
      lazy: true,
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev"
      }
    })
  }

  initCollectionsSlider() {
    const swiper = new Swiper(".collections-slider", {
      modules: [Navigation, Lazy],
      speed: 400,
      spaceBetween: 30,
      slidesPerView: 1,
      breakpoints: {
        560: {
          slidesPerView: 2,
          slidesPerGroup: 2
        },
        768: {
          slidesPerView: 3,
          slidesPerGroup: 3
        },
        1024: {
          slidesPerView: 3,
          slidesPerGroup: 3
        },
        1200: {
          slidesPerView: 4,
          slidesPerGroup: 4
        }
      },
      preloadImages: false,
      lazy: true,
      navigation: {
        nextEl: ".swiper-button-next-2",
        prevEl: ".swiper-button-prev-2"
      }
    })
  }

  initCartSlider3Columns() {
    const swiper = new Swiper(".card-slider-3-columns", {
      modules: [Navigation, Lazy],
      speed: 400,
      spaceBetween: 16,
      slidesPerView: 1,
      breakpoints: {
        560: {
          slidesPerView: 2,
          slidesPerGroup: 2
        },
        768: {
          slidesPerView: 3,
          slidesPerGroup: 3
        },
        1024: {
          slidesPerView: 3,
          slidesPerGroup: 3
        }
      },
      preloadImages: false,
      lazy: true,
      navigation: {
        nextEl: ".swiper-button-next-3",
        prevEl: ".swiper-button-prev-3"
      }
    })
  }
}

export default Sliders
