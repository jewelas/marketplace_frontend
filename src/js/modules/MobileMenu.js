require("matchmedia-polyfill")
require("matchmedia-polyfill/matchMedia.addListener")

class MobileMenu {
  constructor() {
    this.mobileToggle = document.querySelector(".js-mobile-toggle")
    this.mobileMenu = document.querySelector(".js-mobile-menu")
    this.mobileMenuClose = document.querySelector(".js-mobile-close")
    this.pageHeader = document.querySelector(".js-page-header")
    this.navDropdown = document.querySelectorAll(".js-nav-dropdown")

    if (!this.mobileToggle) return
    this.events()
  }

  events() {
    this.belowMobile = window.matchMedia("(max-width: 1024px)")
    this.aboveMobile = window.matchMedia("(min-width: 1025px)")
    this.mobileToggle.addEventListener("click", e => this.toggleMobileMenu(e))
    this.mobileMenuClose.addEventListener("click", e => this.toggleMobileMenu(e))

    this.belowMobile.addListener(e => {
      if (e.matches) {
        this.mobileMenu.classList.remove("nav-menu--is-open")
      }
    })

    this.aboveMobile.addListener(e => {
      if (e.matches) {
        document.body.classList.remove("nav-open-noscroll")
        this.pageHeader.classList.remove("h-full")
        this.mobileMenu.classList.remove("nav-menu--is-open")
      }
    })

    this.navDropdown.forEach(dropdown => {
      dropdown.addEventListener("mouseenter", e => this.toggleAriaExpanded(e))
      dropdown.addEventListener("mouseleave", e => this.toggleAriaExpanded(e))
    })
  }

  toggleAriaExpanded(e) {
    if (e.type === "mouseenter") {
      e.target.firstElementChild.setAttribute("aria-expanded", true)
    } else if (e.type === "mouseleave") {
      e.target.firstElementChild.setAttribute("aria-expanded", false)
    }
  }

  toggleMobileMenu(e) {
    document.body.classList.toggle("nav-open-noscroll")
    this.pageHeader.classList.toggle("h-full")
    this.mobileMenu.classList.toggle("nav-menu--is-open")
  }
}

export default MobileMenu
