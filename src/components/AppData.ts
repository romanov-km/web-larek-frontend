
import { Model } from "./base/Model";
import { FormErrors, IAppState, IProductItem, IOrder, IContactModal, IOrderModal } from "../types";

export type CatalogChangeEvent = {
    catalog: ProductItem[]
};

export class ProductItem extends Model<IProductItem> {
    title: string;
    id: string;
	name: string;
	price: number | null;
	description: string;
	category: string;
	image: string;
    about: string;
}

export class AppState extends Model<IAppState> {
    basket: ProductItem[] = [];
    catalog: ProductItem[];
    order: IOrder = {
        payment: 'online',
        address: '',
        email: '',
        phone: '',
        items: [],
        total: 0,
    };
    preview: string | null;
    formErrors: FormErrors = {};

    addProductItemToBasket(item: ProductItem) {
            this.basket.push(item);
            this.updateBasket();
    }

    deleteProductItemFromBasket(item: ProductItem) {
        this.basket = this.basket.filter((i) => i.id !== item.id);
        this.updateBasket();
    }

    updateBasket() {
        this.emitChanges('basket:changed', this.basket);
        this.emitChanges('counter:changed', this.basket);
    }

    clearBasket() {
        this.basket = [];
        this.updateBasket();
    }

    setCatalog(items: IProductItem[]) {
        this.catalog = items.map(item => new ProductItem(item, this.events));
        this.emitChanges('items:changed', { catalog: this.catalog });
    }

    setPreview(item: ProductItem) {
        this.preview = item.id;
        this.emitChanges('preview:changed', item);
    }

    setOrderField(field: keyof IOrderModal, value: string) {
        this.order[field] = value;

        if (this.validateOrder()) {
            this.events.emit('order:ready', this.order);
        }
    }

    validateOrder() {
        const errors: typeof this.formErrors = {};
        if (!this.order.address) {
            errors.address = 'Необходимо указать адрес';
        }
        this.formErrors = errors;
        this.events.emit('formErrors:change', this.formErrors);
        return Object.keys(errors).length === 0;
    }

    setContactField(field: keyof IContactModal, value: string) {
        this.order[field] = value;

        if (this.validateContact()) {
            this.events.emit('contact:ready', this.order);
        }
    }

    validateContact() {
        const errors: typeof this.formErrors = {};
        if (!this.order.email) {
            errors.email = 'Необходимо указать email';
        }
        if (!this.order.phone) {
            errors.phone = 'Необходимо указать телефон';
        }
        this.formErrors = errors;
        this.events.emit('formErrors:change', this.formErrors);
        return Object.keys(errors).length === 0;
    }
}