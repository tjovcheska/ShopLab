// <shoplab-rating label="Product quality" value="0" max="5">
//
// A Web Component with an OPEN shadow root. Its buttons live inside the
// shadow DOM, not the page's DOM. Playwright locators (CSS, role, text)
// pierce open shadow roots automatically; document.querySelector does not.
//
// When a star is clicked it fires a "rating-change" event
// (bubbles + composed, so it crosses the shadow boundary) with
// `event.detail.value`.
//
// This file uses browser-only APIs: import it from the browser only.

const STYLE = `
  :host { display: inline-block; font-family: inherit; }
  .group { display: flex; align-items: center; gap: 4px; }
  button { font: inherit; cursor: pointer; border: none; background: none; }
  .star { font-size: 1.75rem; line-height: 1; color: #d1d5db; padding: 0 2px; }
  .star.on { color: #f59e0b; }
  .star:focus-visible, .clear:focus-visible { outline: 2px solid #6366f1; border-radius: 4px; }
  .clear { margin-left: 8px; font-size: 0.875rem; color: #4338ca; text-decoration: underline; }
  .summary { margin-left: 8px; font-size: 0.875rem; color: #374151; }
`;

export class ShoplabRating extends HTMLElement {
  static observedAttributes = ["value", "label"];
  private root: ShadowRoot;
  private stars: HTMLButtonElement[] = [];
  private summary: HTMLSpanElement | null = null;
  private group: HTMLDivElement | null = null;

  constructor() {
    super();
    this.root = this.attachShadow({ mode: "open" });
  }

  get value(): number {
    return Number(this.getAttribute("value") ?? 0) || 0;
  }

  set value(value: number) {
    this.setAttribute("value", String(value));
  }

  get max(): number {
    return Number(this.getAttribute("max") ?? 5) || 5;
  }

  connectedCallback() {
    if (this.group) return; // already built
    const style = document.createElement("style");
    style.textContent = STYLE;

    this.group = document.createElement("div");
    this.group.className = "group";
    this.group.setAttribute("role", "group");

    for (let i = 1; i <= this.max; i++) {
      const star = document.createElement("button");
      star.type = "button";
      star.className = "star";
      star.textContent = "★";
      star.setAttribute("aria-label", `${i} ${i === 1 ? "star" : "stars"}`);
      star.addEventListener("click", () => this.select(i));
      this.stars.push(star);
      this.group.append(star);
    }

    const clear = document.createElement("button");
    clear.type = "button";
    clear.className = "clear";
    clear.textContent = "Clear";
    clear.addEventListener("click", () => this.select(0));

    this.summary = document.createElement("span");
    this.summary.className = "summary";
    this.summary.setAttribute("part", "summary");

    this.group.append(clear, this.summary);
    this.root.append(style, this.group);
    this.update();
  }

  attributeChangedCallback() {
    this.update();
  }

  /** Updates the existing shadow DOM in place (keeps keyboard focus). */
  private update() {
    if (!this.group || !this.summary) return;
    const value = this.value;
    this.group.setAttribute(
      "aria-label",
      this.getAttribute("label") ?? "Rating",
    );
    this.stars.forEach((star, index) => {
      star.classList.toggle("on", index < value);
      star.setAttribute("aria-pressed", String(index + 1 === value));
    });
    this.summary.textContent =
      value === 0 ? "Not rated" : `${value} of ${this.max}`;
  }

  private select(value: number) {
    this.value = value;
    this.dispatchEvent(
      new CustomEvent("rating-change", {
        detail: { value },
        bubbles: true,
        composed: true, // lets the event leave the shadow root
      }),
    );
  }
}

if (!customElements.get("shoplab-rating")) {
  customElements.define("shoplab-rating", ShoplabRating);
}
