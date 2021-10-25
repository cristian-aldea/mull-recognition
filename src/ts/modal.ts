import { closeModal } from "./utils";

const modal = document.getElementById("modal") as HTMLDivElement;
const modalForeground = document.getElementById("modal-foreground") as HTMLDivElement;
const modalClose = document.getElementById("modal-close-button") as HTMLButtonElement;

modal.addEventListener("click", closeModal);
modalForeground.addEventListener("click", (e) => {
  e.stopPropagation();
});
modalClose.addEventListener("click", closeModal);
