class DarkMode {
  constructor() {
    this.storageKey = "theme-preference"
    this.theme = {
      value: this.getColorPreference()
    }
    this.reflectPreference()
    this.events()
  }

  events() {
    window.onload = () => {
      // set on load so screen readers can see latest value on the button
      this.reflectPreference()

      // now this script can find and listen for clicks on the control
      document.querySelectorAll(".js-dark-mode-trigger").forEach(trigger => {
        trigger.addEventListener("click", e => this.onClick(e))
      })
    }

    // sync with system changes
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", ({ matches: isDark }) => {
      this.theme.value = isDark ? "dark" : "light"
      this.setPreference()
    })
  }

  getColorPreference() {
    if (localStorage.getItem(this.storageKey)) {
      return localStorage.getItem(this.storageKey)
    } else {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    }
  }

  setPreference() {
    localStorage.setItem(this.storageKey, this.theme.value)
    this.reflectPreference()
  }

  reflectPreference() {
    document.firstElementChild.className = ""
    document.firstElementChild.classList.add(this.theme.value)

    document.querySelectorAll(".js-dark-mode-trigger").forEach(trigger => {
      trigger?.setAttribute("aria-label", this.theme.value)
    })
  }

  onClick(e) {
    e.preventDefault()
    // flip current value
    this.theme.value = this.theme.value === "light" ? "dark" : "light"

    this.setPreference()
  }
}

new DarkMode()
