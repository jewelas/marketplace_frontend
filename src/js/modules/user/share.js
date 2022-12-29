class Share {
    constructor() {
        document.getElementById("share-copy")?.addEventListener("click", e => this.copy(e))
    }

    copy = (e) => {
        if (navigator.clipboard && window.isSecureContext) {
            // navigator clipboard api method'
            navigator.clipboard.writeText(location.href)
        } else {
            // text area method
            let textArea = document.createElement("textarea");
            textArea.value = location.href;
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
}

export default Share