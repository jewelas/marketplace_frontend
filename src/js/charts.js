import { toMiliseconds } from "./modules/utils"

class Charts {
  constructor(props) {
    this.data = props.data
    document.getElementById("price-daterange").addEventListener("change", e => this.changePriceDateRange(e, props.data))
    this.renderChart(this.data)
    if (this.data.length > 0) document.getElementById("no-sale").style.display = "none"
  }

  renderChart = (data) => {
    document.getElementById("avg-price").innerHTML = `Ξ ${data?.length > 0 ? (data.reduce((accumulator, each) => accumulator + each.price, 0)) / data.length : 0} WDOGE`

    const chartElement = document.getElementById("activityChart")
    if (!chartElement) return
    const chartData = {
      labels: data.map(x => x.date),
      datasets: [
        {
          type: "line",
          label: "Price",
          backgroundColor: "#10B981",
          borderColor: "#10B981",
          data: data.map(x => x.price)
        },
        {
          type: "bar",
          backgroundColor: "#E7E8EC",
          data: data.map(x => x.price)
        }
      ]
    }

    this.footer = tooltipItems => {
      let sum = 1
      tooltipItems.forEach(function (tooltipItem) {
        sum *= tooltipItem.parsed.y
      })
      return "Volume: " + Intl.NumberFormat("en-US", { notation: "compact" }).format(sum)
    }

    const config = {
      data: chartData,
      options: {
        maintainAspectRatio: false,
        responsive: true,
        interaction: {
          intersect: false,
          mode: "index"
        },
        scales: {
          x: {
            // type: "time",
            // time: {
            //   unit: "week"
            // },
            grid: {
              display: false
            }
          },
          y: {
            ticks: {
              stepSize: 50
              // format: { notation: "compact" }
            }
          }
        },
        plugins: {
          legend: { display: false },
          decimation: {
            enabled: true
          },
          tooltip: {
            usePointStyle: true,
            position: "nearest",
            backgroundColor: "#131740",
            titleAlign: "center",
            bodyAlign: "center",
            footerAlign: "center",
            padding: 12,
            displayColors: false,
            yAlign: "bottom",
            callbacks: {
              // footer: this.footer
            }
          }
        },
        animation: false
      }
    }

    let chartStatus = Chart.getChart("activityChart");
    if (chartStatus != undefined) {
      chartStatus.destroy();
    }
    Chart.defaults.font.size = 14
    Chart.defaults.font.family = "'DM Sans', 'Helvetica', 'Arial', sans-serif"
    Chart.defaults.color = "#5A5D79"
    Chart.defaults.borderColor = "rgba(196, 197, 207, .25)"

    this.activityChart = new Chart(chartElement, config)
  }

  changePriceDateRange = (e, allData) => {
    if (parseInt(e.target.value) == -1) {
      document.getElementById("avg-price-label").innerHTML = `All-time Avg. Price:`
      this.renderChart(allData)
    }
    else {
      document.getElementById("avg-price-label").innerHTML = `${e.target.value} Day Avg. Price:`
      this.renderChart(allData.filter(x => {
        return new Date().getTime() - new Date(x.date.slice(0, 10)).getTime() <= toMiliseconds(24 * parseInt(e.target.value), 0, 0)
      }))
    }
  }
}

export default Charts