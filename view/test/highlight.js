const highlightMenu = document.getElementById("highlight-menu");
let selectedRange = null;

// Highlight text
document.getElementById("passage").addEventListener("mouseup", () => {
  const selection = window.getSelection();
  if (selection.toString().trim() !== "") {
    const rect = selection.getRangeAt(0).getBoundingClientRect();
    selectedRange = selection.getRangeAt(0);

    highlightMenu.style.top = `${window.scrollY + rect.bottom}px`;
    highlightMenu.style.left = `${window.scrollX + rect.left}px`;
    highlightMenu.style.display = "block";
  }
});

// Save highlight
document.getElementById("save-note").addEventListener("click", () => {
  if (selectedRange) {
    const note = document.getElementById("note-input").value.trim();
    const color = document.querySelector(".color-btn.active").dataset.color || "yellow";

    const span = document.createElement("span");
    span.className = "highlight";
    span.style.backgroundColor = color;
    span.setAttribute("data-note", note);
    span.textContent = selectedRange.toString();

    selectedRange.deleteContents();
    selectedRange.insertNode(span);

    highlightMenu.style.display = "none";
    document.getElementById("note-input").value = "";
  }
});
