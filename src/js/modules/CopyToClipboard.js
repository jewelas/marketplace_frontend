class CopyToClipboard {
  constructor() {
    this.copyBtn = document.querySelectorAll(".js-copy-clipboard")
    this.events()
  }

  events() {
    this.copyBtn.forEach(btn => {
      btn.addEventListener("click", e => this.handleClick(e))
    })
  }

  copyToClipboard(textToCopy) {
    if (navigator.clipboard && window.isSecureContext) {
      // navigator clipboard api method'
      return navigator.clipboard.writeText(textToCopy);
    } else {
      // text area method
      let textArea = document.createElement("textarea");
      textArea.value = textToCopy;
      // make the textarea out of viewport
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      return new Promise((res, rej) => {
        // here the magic happens
        document.execCommand('copy') ? res() : rej();
        textArea.remove();
      });
    }
  }

  handleClick(e) {
    const btn = e.currentTarget
    const tippyLabel = btn.dataset.tippyContent

    if (document.body.createTextRange) {
      const range = document.body.createTextRange()

      range.moveToElementText(btn)
      range.select()
      range.setSelectionRange(0, 99999) /* For mobile devices */
      this.copyToClipboard(range.value)
        .then(() => {
          btn._tippy.setContent("Copied!")
          btn._tippy.show()
          setTimeout(() => {
            btn._tippy.setContent(tippyLabel)
          }, 1000)
        })
        .catch(() => console.log('clipboard error'))
    } else {
      const selection = window.getSelection()
      const range = document.createRange()

      range.selectNodeContents(btn)
      selection.removeAllRanges()
      selection.addRange(range)

      this.copyToClipboard(selection.focusNode.innerText)
        .then(() => {
          btn._tippy.setContent("Copied!")
          btn._tippy.show()
          setTimeout(() => {
            btn._tippy.setContent(tippyLabel)
          }, 1000)
        })
        .catch(() => console.log('clipboard error'));
    }
  }
}

export default CopyToClipboard
