import { modal, modalClose, modalForeground } from "./dom";
import { closeModal } from "./utils";

// modal
modal.addEventListener("click", closeModal);
modalForeground.addEventListener("click", (e) => {
  e.stopPropagation();
});
modalClose.addEventListener("click", closeModal);
