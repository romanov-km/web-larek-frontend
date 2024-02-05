export type EventName = string | RegExp;
export type Subscriber = Function;
export type EmitterEvent = {
    eventName: string,
    data: unknown
};

export type FormErrors = Partial<Record<keyof IOrder, string>>;

export type ApiPostMethods = 'POST' | 'PUT' | 'DELETE';

export type ApiListResponse<Type> = {
    total: number,
    items: Type[],
};

export interface IFormState {
    valid: boolean;
    errors: string[];
}

export interface IProductItem {
	image: string;
	title: string;
	category: string;
	price: number | null;
    id: string;
    description: string;
}

export interface ICard extends IProductItem {
	index?: number;
}

export interface ICardActions {
    onClick: (event: MouseEvent) => void;
}

export interface IOrderModal {
	payment: string;
	address: string;
}

export interface IContactModal {
	email: string;
	phone: string;
}

export interface IOrder extends IOrderModal, IContactModal {
	items: string[];
	total: number;
}

export interface IAppState {
    catalog: IProductItem[];
    basket: IProductItem[];
    preview: string | null;
    order: IOrder | null;
    delivery: IOrderModal | null;
    contact: IContactModal | null;
}

export interface IWebLarekAPI {
    getProductList: () => Promise<IProductItem[]>;
    getProductItem: (id: string) => Promise<IProductItem>;
    orderProducts: (order: IOrder) => Promise<IOrderResult>;
}

export interface IOrderResult {
    id: string;
    total: number;
}

export interface IFormState {
    valid: boolean;
    errors: string[];
}

export interface IPage {
    counter: number;
    catalog: HTMLElement[];
}

export interface IEvents {
    on<T extends object>(event: EventName, callback: (data: T) => void): void;
    emit<T extends object>(event: string, data?: T): void;
    trigger<T extends object>(event: string, context?: Partial<T>): (data: T) => void;
}

export interface ISuccess {
    total: number;
}

export interface ISuccessActions {
    onClick: () => void;
}


export interface IBasketView {
    items: HTMLElement[];
    total: number;
}

export interface IModalData {
    content: HTMLElement;
}
