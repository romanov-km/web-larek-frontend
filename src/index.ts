import './scss/styles.scss';

import { WebLarekAPI } from "./components/WebLarekApi";
import { API_URL, CDN_URL } from "./utils/constants";
import { EventEmitter } from "./components/base/events";
import { AppState, CatalogChangeEvent, ProductItem } from "./components/AppData";
import { Page } from "./components/Page";
import { Card } from "./components/Card";
import { cloneTemplate, ensureElement} from "./utils/utils";
import { Modal } from "./components/common/Modal";
import { Basket } from "./components/common/Basket";
import { IOrder, IContactModal, IOrderModal } from "./types";
import { OrderModal, ContactModal } from "./components/Order";
import { Success } from "./components/common/Success";

const events = new EventEmitter();
const api = new WebLarekAPI(CDN_URL, API_URL);

// Чтобы мониторить все события, для отладки
events.onAll(({ eventName, data }) => {
    console.log(eventName, data);
})

// Все шаблоны
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket')
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactTemplate = ensureElement<HTMLTemplateElement>('#contacts');


// Модель данных приложения
const appData = new AppState({}, events);

// Глобальные контейнеры
const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

// Переиспользуемые части интерфейса
const basket = new Basket(cloneTemplate(basketTemplate), events);

const contact = new ContactModal(cloneTemplate(contactTemplate), events);
const order = new OrderModal(cloneTemplate(orderTemplate), events, { onClick: (event: Event) => events.emit('payment:change', event.target) });

// Дальше идет бизнес-логика
// Поймали событие, сделали что нужно

// Изменились элементы каталога
events.on<CatalogChangeEvent>('items:changed', () => {
    page.catalog = appData.catalog.map(item => {
        const card = new Card(cloneTemplate(cardCatalogTemplate), {
            onClick: () => events.emit('card:select', item)
        });
        return card.render({
            title: item.title,
            image: item.image,
            price: item.price,
            category: item.category,
        });
    });
});

// Делаем заказ
events.on('contacts:submit', () => {
    api.orderProducts(appData.order)
        .then((result) => {
            const success = new Success(cloneTemplate(successTemplate), {
                onClick: () => {
                    modal.close();
                    appData.clearBasket();
                    
                }
            });
            success.total = result.total.toString();

            modal.render({
                content: success.render({})
            });
        })
        .catch(err => {
            console.error(err);
        });
});

// Изменилось состояние валидации формы
events.on('formErrors:change', (errors: Partial<IOrder>) => {
    const {address, payment, email, phone} = errors;
    order.valid = !address && !payment;
    contact.valid = !email && !phone;

    contact.errors = Object.values({email, phone}).filter(i => !!i).join('; ');
    order.errors = Object.values({address, payment}).filter(i => !!i).join('; ');
});


// Изменилось одно из полей для доставки
events.on(/^order\..*:change/, (data: { field: keyof IOrderModal, value: string }) => {
    appData.setOrderField(data.field, data.value);
});
// Изменилось одно из полей для контактов  
events.on(/^contacts\..*:change/, (data: { field: keyof IContactModal, value: string }) => {
    appData.setContactField(data.field, data.value);
});


//Открыть форму заказа
events.on('order:open', () => {
    modal.render({
        content: order.render({
            payment: '',
            address: '',
            valid: false,
            errors: [],
        })
    });
    appData.order.items = appData.basket.map(function(item) {
        return item.id;
    });    
});

events.on('order:submit', () => {
        modal.render({
            content: contact.render({
                email: '',
                phone: '',
                valid: false,
                errors: []
        })
    });
});

const categoryPayment: {[key: string]: string} = {
    "card": "card",
    "cash": "cash",
}

events.on('payment:change', (target: HTMLElement) => {
    if (!target.classList.contains('button_alt-active')) {
        order.toggleClassButton(target);
        appData.order.payment = categoryPayment[target.getAttribute('name')];
    }
})

// Открыть корзину
events.on('basket:open', () => {
    modal.render({
        content: basket.render({})
    });
});

// Открыть карточку товара
events.on('card:select', (item: ProductItem) => {
    appData.setPreview(item);
});

// Добавление товара в корзину
events.on('product:chooseaction', (item: ProductItem) => {
    modal.close();
    if(appData.basket.indexOf(item) < 0) {
        events.emit('product:add', item);
    } else {
        events.emit('product:delete', item);
    }
});

events.on('product:add', (item: ProductItem) => {
    appData.addProductItemToBasket(item);
});

// Удаление товара из корзины
events.on('product:delete', (item: ProductItem) => {
    appData.deleteProductItemFromBasket(item);
});

//Изменение корзины
events.on('basket:changed', (items: ProductItem[]) => {
    basket.items = items.map((item, index) => {
        const card = new Card(cloneTemplate(cardBasketTemplate), {
            onClick: () => {
                events.emit('product:delete', item)
            }
        });
        return card.render({
            title: item.title,
            price: item.price,
            index: index+1,
        })
    });
    const total = items.reduce((total, item) => total + item.price, 0)
    basket.total = total;
    appData.order.total = total;
});

//Счетчик товаров на корзинке
events.on('counter:changed', () => {
    page.counter = appData.basket.length;
});

// Изменен открытый выбранный товар
events.on('preview:changed', (item: ProductItem) => {

        const card = new Card(cloneTemplate(cardPreviewTemplate), {
            onClick: () => {
                events.emit('product:chooseaction', item);
                card.titleButton = (appData.basket.indexOf(item) < 0) ? 'Купить' : 'Удалить из корзины';
            }
        });

        modal.render({
            content: card.render({
                title: item.title,
                image: item.image,
                description: item.description,
                category: item.category,
                price: item.price,
                id: item.id,
                titleButton: (appData.basket.indexOf(item) < 0 ? 'Купить' : 'Удалить из корзины'),
                })
        });

});


// Блокируем прокрутку страницы если открыта модалка
events.on('modal:open', () => {
    page.locked = true;
});

// ... и разблокируем
events.on('modal:close', () => {
    page.locked = false;
});

// Получаем товары с сервера
api.getProductList()
    .then(appData.setCatalog.bind(appData))
    .catch(err => {
        console.error(err);
});