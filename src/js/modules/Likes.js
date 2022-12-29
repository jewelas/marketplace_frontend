class Likes {
  constructor() {
    this.likes = document.querySelectorAll(".js-likes")
    this.events()
  }

  events() {
    if (this.likes.length > 0) {
      this.likes.forEach(like => {
        like.addEventListener("click", e => this.handleClick(e))
      })
    }
  }

  handleClick(e) {
    const number = e.currentTarget.nextElementSibling
    e.currentTarget.classList.toggle("js-likes--active")

    if (!number) return

    if (e.currentTarget.matches(".js-likes--active")) {
      number.textContent = Number(number.textContent) + 1
    } else {
      number.textContent = Number(number.textContent) - 1
    }
  }
}

export default Likes
