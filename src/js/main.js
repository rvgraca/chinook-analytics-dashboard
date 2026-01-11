import { createElement } from "./modules/dom.js";
import { log } from "./modules/utils.js";

document.getElementById("btn-test").addEventListener("click", () => {
    const el = createElement("p", "Este párrafo fue creado dinámicamente.");
    document.getElementById("app").appendChild(el);
    log("Evento ejecutado.");
});
