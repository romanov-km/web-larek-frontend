import { Form } from "./common/Form";
import { IOrderModal, IContactModal, IEvents} from "../types";
import { ensureElement } from "../utils/utils";

export class ContactModal extends Form<IContactModal> {
    constructor(container: HTMLFormElement, events: IEvents) {
        super(container, events);
    }

    set phone(value: string) {
        (this.container.elements.namedItem('phone') as HTMLInputElement).value = value;
    }

    set email(value: string) {
        (this.container.elements.namedItem('email') as HTMLInputElement).value = value;
    }
}

export class OrderModal extends Form<IOrderModal> {
    protected _online: HTMLButtonElement;
    protected _cash: HTMLButtonElement;

    constructor(container: HTMLFormElement, events: IEvents) {
    
        super(container, events);
        this._online = ensureElement<HTMLButtonElement>('button[name="card"]', this.container);
        this._online.classList.add('button_alt-active');
    }

    set address(value: string) {
        (this.container.elements.namedItem('address') as HTMLInputElement).value = value;
    }

}