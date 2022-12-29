import countdown from "countdown-updated"

class Counters {
  constructor() {
    this.timers = document.querySelectorAll(".js-countdown-timer")
    this.timer = document.querySelector(".js-countdown-single-timer")
    this.timerDays = document.querySelector(".js-countdown-days-number")
    this.timerHours = document.querySelector(".js-countdown-hours-number")
    this.timerMinutes = document.querySelector(".js-countdown-minutes-number")
    this.timerSeconds = document.querySelector(".js-countdown-seconds-number")
    this.timerEndsLabel = document.querySelector(".js-countdown-ends-label")
    this.initCountdown()
    this.initCountdownSingle()
  }

  format(n) {
    return n < 10 ? "0" + n : n
  }

  initCountdownSingle() {
    if (!this.timer) return
    const date = this.timer.dataset.countdown.toString()

    const timer = countdown(
      new Date(date),
      ts => {
        if (ts.value > 0) {
          this.timer.innerHTML = this.timer.dataset.expired
          this.timerEndsLabel.remove()
          window.clearInterval(timer)
        } else {
          this.timerDays.innerHTML = this.format(ts.days)
          this.timerHours.innerHTML = this.format(ts.hours)
          this.timerMinutes.innerHTML = this.format(ts.minutes)
          this.timerSeconds.innerHTML = this.format(ts.seconds)
        }
      },
      countdown.DAYS | countdown.HOURS | countdown.MINUTES | countdown.SECONDS
    )
  }

  initCountdown() {
    if (!this.timers) return

    this.timers.forEach(counter => {
      const date = counter.dataset.countdown.toString()

      const timer = countdown(
        new Date(date),

        ts => {
          const days = ts.days ? this.format(ts.days) + " : " : ""
          const hours = ts.hours | ts.days ? this.format(ts.hours) + " : " : ""

          if (ts.value > 0) {
            counter.innerHTML = counter.dataset.expired

            if (counter.nextElementSibling) {
              counter.nextElementSibling.remove()
            }

            if (counter.previousElementSibling) {
              counter.previousElementSibling.remove()
            }
            window.clearInterval(timer)
          } else {
            const left = counter.nextElementSibling.dataset.countdownleft
            counter.innerHTML = days + hours + this.format(ts.minutes) + " : " + this.format(ts.seconds)
            counter.nextElementSibling.textContent = left
          }
        },
        countdown.DAYS | countdown.HOURS | countdown.MINUTES | countdown.SECONDS
      )
    })
  }
}

new Counters()
