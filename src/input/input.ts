import { css, html, Nexwidget } from 'nexwidget';

declare global {
  interface HTMLElementTagNameMap {
    'input-widget': InputWidget;
  }
}

export type InputType = 'text' | 'tel' | 'number' | 'textarea' | 'url' | 'password';

export interface InputWidget {
  get hasValue(): boolean;
  set hasValue(v: boolean);

  get invalid(): boolean;
  set invalid(v: boolean);

  get placeholder(): string;
  set placeholder(v: string);

  get label(): string;
  set label(v: string);

  get type(): InputType;
  set type(v: InputType);
}

export class InputWidget extends Nexwidget {
  static get styles(): CSSStyleSheet[] {
    return [
      ...super.styles,
      css`
        :host {
          border-radius: 8px 8px 0px 0px;
          position: relative;
          margin: 0px 16px;
        }

        :host::before {
          content: '';
          position: absolute;
          top: 0px;
          width: 100%;
          height: 100%;
          border-radius: inherit;
          background: var(--onSurfaceColor);
          opacity: 0.04;
          pointer-events: none;
          z-index: 1;
          transition: opacity calc(var(--durationLvl2) - 50ms) var(--deceleratedEase);
        }

        :host(:focus-within)::before {
          opacity: 0.08;
          transition-duration: var(--durationLvl2);
        }

        :host::after {
          content: '';
          position: absolute;
          bottom: 0px;
          left: 0;
          width: 100%;
          height: 2px;
          opacity: 0.08;
          background: var(--onSurfaceColor);
          pointer-events: none;
          z-index: 1;
          transition: background calc(var(--durationLvl2) - 50ms) var(--deceleratedEase),
            opacity calc(var(--durationLvl2) - 50ms) var(--deceleratedEase);
        }

        :host([invalid])::after {
          opacity: 1;
          transition-duration: var(--durationLvl2);
          background: var(--errorColor);
        }

        :host .label {
          color: var(--onSurfaceColor);
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 16px;
          letter-spacing: 0.25px;
          font-family: 'Dana VF', 'Jost VF';
          font-variation-settings: 'wght' 425;
          transform-origin: top right;
          transition: transform calc(var(--durationLvl2) - 50ms) var(--deceleratedEase),
            top calc(var(--durationLvl2) - 50ms) var(--deceleratedEase),
            color calc(var(--durationLvl2) - 50ms) var(--deceleratedEase);
          pointer-events: none;
          z-index: 1;
        }

        :host(:dir(ltr)) .label {
          right: initial;
          left: 16px;
          transform-origin: top left;
        }

        :host([invalid]) .label {
          color: var(--errorColor);
        }

        :host([has-value]) .label,
        :host(:focus-within) .label {
          top: 6px;
          transform: scale(0.9);
          transition-duration: var(--durationLvl2);
        }

        :host(:focus-within) .label {
          color: var(--primaryColor);
        }

        :host .field {
          background: transparent;
          position: relative;
          color: var(--onSurfaceColor);
          width: 100%;
          box-sizing: border-box;
          height: 24px;
          border-radius: 4px 4px 0px 0px;
          font-size: 16px;
          letter-spacing: 0.25px;
          font-family: 'Dana VF', 'Jost VF';
          font-variation-settings: 'wght' 350;
          margin: 0px;
          border: none;
          outline: none;
          opacity: 0;
          margin: 26px 0px 6px 0px;
          padding: 0px 16px 0px 16px;
          transition: opacity calc(var(--durationLvl2) - 50ms) var(--deceleratedEase);
        }

        :host textarea.field {
          resize: vertical;
          height: 92px;
        }

        :host(:focus-within) .field,
        :host([has-value]) .field {
          opacity: 1;
          transition-duration: var(--durationLvl2);
        }

        :host .bottom-bar {
          position: absolute;
          width: 100%;
          height: 2px;
          background: var(--primaryColor);
          left: 0px;
          bottom: 0px;
          transform: scaleX(0);
          transition: transform calc(var(--durationLvl2) - 50ms) var(--deceleratedEase);
          z-index: 2;
        }

        :host(:focus-within) .bottom-bar {
          transform: scaleX(1);
          transition-duration: var(--durationLvl2);
        }
      `,
    ];
  }

  #field?: HTMLTextAreaElement | HTMLInputElement;

  focus() {
    this.#field?.focus();
  }

  updatedCallback() {
    super.updatedCallback();
    this.#field = this.shadowRoot!.querySelector(this.type === 'textarea' ? 'textarea' : 'input')!;

    if (this.invalid) this.scrollIntoView({ block: 'center' });
  }

  get value() {
    return this.#field?.value;
  }

  get template() {
    return html`
      <div class="label">${this.label}</div>
      ${this.type === 'textarea'
        ? html`
            <textarea
              dir="auto"
              class="field"
              placeholder=${this.placeholder ?? ''}
              @input=${this.#handleInput.bind(this)}
              @change=${this.#handleChange.bind(this)}
            ></textarea>
          `
        : html`
            <input
              dir="auto"
              class="field"
              placeholder=${this.placeholder ?? ''}
              type=${this.type}
              @input=${this.#handleInput.bind(this)}
              @change=${this.#handleChange.bind(this)}
              @keyup=${this.#focusNext.bind(this)}
            />
          `}

      <div class="bottom-bar"></div>
    `;
  }

  #handleInput() {
    this.dispatchEvent(new CustomEvent('input'));
  }

  #handleChange() {
    this.hasValue = !!this.#field?.value;
    this.dispatchEvent(new CustomEvent('change'));
  }

  #focusNext({ key }: KeyboardEvent) {
    if (key === 'Enter' && this.nextElementSibling instanceof this.constructor)
      (<InputWidget>this.nextElementSibling).focus();
  }
}

InputWidget.createAttributes([
  ['placeholder', String],
  ['type', String],
  ['label', String],
  ['hasValue', Boolean],
  ['invalid', Boolean],
]);

InputWidget.createReactives(['placeholder', 'type', 'label', 'invalid']);
InputWidget.register('input-widget');
