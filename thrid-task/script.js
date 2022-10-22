"use strict";
var dateNow = new Date()
const month = dateNow.getMonth() + 1;
const year = dateNow.getFullYear();
const day = dateNow.getDate();
const wrapper = document.querySelector(`.wrapper`);
const container = document.querySelector('.container');

const arrRoutes = {
    empty: '', 
    to: 'из A в B', 
    from: 'из B в A',
    toFrom: 'из A в B и обратно в А',
}
const prices = {
    to: 700,
    from: 700,
    toFrom: 1200,
}
const timeTravel = 50;
const timesArr = {
    to: [
        '',
        '18:00',
        '18:30',
        '18:45',
        '19:00',
        '19:15',
        '21:00',
    ],
    from: [
        '',
        '18:30',
        '18:45',
        '19:00',
        '19:15',
        '19:35',
        '21:50',
        '21:55',
    ],
    toFrom: [
        '',
        '17:30',
        '18:00',
        '18:30',
        '18:45',
        '19:00',
        '19:15',
        '19:35',
        '21:50',
        '21:55',
    ]
}
const order = {
    direction: null,
    timeTicket: null,
    timeBack: null,
    timeTravel: null,
    ticketPrice: null,
    totalPrice: null,
    quantity: null,
}

function cleaner(){
    const selectTo = document.querySelector(`.choice-to`);
    const selectFrom = document.querySelector(`.choice-from`);
    const selectToFrom = document.querySelector(`.choice-toFrom`);
    const quantity = document.querySelector(`.quantity`);
    const result = document.querySelector(`.result`);
    if(selectTo){
        selectTo.remove()
    }
    if(selectFrom){
        selectFrom.remove()
    }
    if(selectToFrom){
        selectToFrom.remove()
    }
    if(quantity){
        quantity.remove()
    }
    if(result){
        result.remove()
    }
    for(const [key, el] of Object.entries(order)){
        order[key] = null
    }
    document.getElementById('route-route').selectedIndex = 0;
}

/**
 * 
 * @param {*} orderTime время из заказа
 * @returns значение в формате времени, за минусом времени на сам маршрут
 */
function calcTime(orderTime){
    const date = new Date(`${month}.${day}.${year} ${orderTime}`);
    const time = new Date(+date + 50 * 6e4)
    return `${time.getHours()}:${time.getMinutes()}`;
}

/**
 * 
 * @param {String} timeValue - значение времени которое необходимо преобразовать. ПРиходит в формате String '18:00';
 * @returns возвращает преобразованное в дату значение 
 */
function gettingTime(timeValue){
    const date = new Date(`${month}.${day}.${year} ${timeValue}`);
    return date
}

/**
 * Метод работает в том случае, когда выбрано направление to и в данном направление выбрано конкретное время.
 * Данный метод получает выбранное значение, парсит имеющийся массив со временем toFrom b убирает время которое пересекается
 * с направлением to.
 * После корректировки массива, происходит перерендеринг select toFrom
 */
function checkArrFrom(){
    const orderClock = gettingTime(order.timeTicket)
    const toFromClock = timesArr.toFrom.map(el => gettingTime(el))
    const convertArrTime = ['',];
    toFromClock.forEach(el => {
        if(((el - orderClock) / 60000) > 50){
            convertArrTime.push(`${el.getHours()}:${el.getMinutes()}`)
        }
    })
    timesArr.toFrom = convertArrTime
    document.querySelector(`.choice-toFrom`).remove()
    renderSelects({title: 'time', direction: 'toFrom', routerValue: timesArr.toFrom, arrParse: arrRoutes, text: `Выберите время для обратного билета`})
}

/**
 * метод рендерит общую информацию о совершенном заказе
 */
function renderOrderInfo(){
    const div = document.createElement('div');
    div.classList.add('result');
    div.innerHTML = `
    Вы выбрали ${order.quantity} билета по маршруту ${arrRoutes[order.direction]} стоимостью ${order.totalPrice}.
    Это путешествие займет у вас ${order.timeTravel} минут. 
    Теплоход отправляется в ${order.timeTicket}, а прибудет в ${calcTime(order.timeTicket)}.
    `
    if(document.querySelector(`.result`)){
        document.querySelector(`.result`).remove()
    }
    container.insertAdjacentElement('afterbegin', div)
}

/**
 * метод по рендерингу на странице ошибки
 */
function renderErr(){
    let div = document.createElement('div');
    div.classList.add('err')
    div.innerHTML = `Пожалуйста заполните все поля для оформления заказа`
    container.insertAdjacentElement('afterbegin', div)
}

/**
 * основной метод формирования заказа.
 * ПРоисходит проверка заполнены ли все поля в заказе, если false, то вызывается рендеринг ошибки
 * если true, то вызывается метод по рендерингу результата с информацией о заказе
 */
function initBtnOrder(){
    let result = null;
    order.ticketPrice = prices[order.direction]
    order.totalPrice = order.quantity * order.ticketPrice
    if(order.direction === 'toFrom'){
        order.timeTravel = timeTravel * 2;
    } else{
        order.timeTravel = timeTravel;
    }
    for(const[key, el] of Object.entries(order)){
        if(key != 'timeBack'){
            if(el != null){
                result = true
            }else{
                result = false;
                break
            }
        }
    }
    if(!result){
        if(document.querySelector(`.result`)){
            document.querySelector(`.result`).remove()
        }
        renderErr()
    } else{
        if(document.querySelector(`.err`)){
            document.querySelector(`.err`).remove()
        }
        renderOrderInfo()
    }
}

/**
 * 
 * @param {*} e - target кнопки + и - 
 * Методы изменяет количество билетов, изменяя order  и значение на странице 
 */
function calcQuantity(e){
    if(e.target.id === 'minus'){
        if(order.quantity > 0){
            order.quantity--
        }
        if(order.quantity === 0){
            order.quantity = null;
        }
    } 
    if(e.target.id === 'plus'){
        if(order.quantity === null){
            order.quantity = 1 
        } else{
            order.quantity++
        }
    }
    document.querySelector(`.counter__value`).innerHTML = order.quantity === null? 0: order.quantity
}

/**
 * инициализация кнопок и навешивание слушателя событий на click
 */
function initBtn(){
    const btnQuantity = document.querySelectorAll('.counter__btn');
    const btnOrder = document.querySelector(`.btn`)
    btnQuantity.forEach(btn => btn.addEventListener('click', calcQuantity))
    btnOrder.addEventListener('click', initBtnOrder)
}

/**
 * Рендеринг послденего поля с кнопка добавления и уменьшения колчество билетов.
 * Так же Рендериться основная кнопка, по созданию заказа. 
 */
function renderBtn(){
    if(!document.querySelector(`.quantity`)){
    let div = document.createElement('div');
    div.classList.add('quantity');
    div.innerHTML = `
        <div class="counter">
            <div class="counter__btn" id="minus">-</div>
            <div class="counter__value">${order.quantity === null? 0: order.quantity}</div>
            <div class="counter__btn" id="plus">+</div>
        </div>
        <div class="btn">Оформить заказ</div>
        `
    wrapper.insertAdjacentElement('beforeend', div)
    initBtn()
    }
}

/**
 * @param {String} valueClear - стрианг значение направления (в данном случае возможно to,from,toFrom)
 * @param {*} valueSplit - значение маршрута не очищенное, в виде 'из А в В'
 * метод в зависимости от переденного названия направления рендерит элементы. 
 * Если данные элементы уже имеются, то метод подставляет новые значения в элементы.
 * Так же идет заполнение заказа, значениями
 */
function routing (valueClear, valueSplit){
    const selectTo =  document.querySelector(`.choice-to`);
    const selectToFrom =  document.querySelector(`.choice-toFrom`);
    const blockFrom = document.querySelector(`.choice-from`);
    if(valueClear === 'to'){
        if(!selectTo){
            if(blockFrom){
                blockFrom.remove()
                for(const [key, el] of Object.entries(order)){
                    order[key] = null
                }
                document.querySelector(`.counter__value`).innerHTML =0;
            }
            renderSelects({title: 'time', direction: 'to', routerValue: timesArr.to, arrParse: arrRoutes, text: `Выберите время`})
            order.direction = valueClear;
            order.ticketPrice = prices.to
            renderSelects({title: 'time', direction: 'toFrom', routerValue: timesArr.toFrom, arrParse: arrRoutes, text: `Выберите время для обратного билета`})
        } else{
            order.timeTicket = valueSplit[0];
            order.timeTravel = timeTravel;
            checkArrFrom()
            renderBtn()
        }
    }
    if(valueClear === 'from'){
        if(!blockFrom){
            if(selectTo){
                selectTo.remove()
                selectToFrom.remove()
                for(const [key, el] of Object.entries(order)){
                    order[key] = null
                }
                document.querySelector(`.counter__value`).innerHTML =  0;
            }
            renderSelects({title: 'time', direction: 'from', routerValue: timesArr.from, arrParse: arrRoutes, text: `Выберите время`})
            order.direction = valueClear;
            order.ticketPrice = prices.to
        } else{
            order.timeTicket = valueSplit[0];
            order.timeTravel = timeTravel;
            renderBtn()
        }
    }
    if(valueClear === 'toFrom'){
        order.direction = valueClear;
        order.ticketPrice = prices.toFrom
        order.timeBack = valueSplit[0];
    }
}

/**
 * 
 * @param {String} value значение для идентификации общего названия маршрута
 * метод преобразует навание маршрута из 'из A в B' в 'to'
 * @returns chekValue - очищенное и приведенное к необходимому вижду значение направления маршрута
 */
function switcher (value){
    let chekValue = null;
    switch(value){
        case 'из A в B':
            chekValue = 'to'
            break;
        case 'из B в A':
            chekValue = 'from'
            break;
        case 'из A в B и обратно в А':
            chekValue = 'toFrom';
    }
    return chekValue
}
/**
 * @param {*} e - элемент события (option)
 * Метод конвертирует значение option, убирает пробелы, отрбрасывает скобки.
 * В случае если у option (а это первые элементы в Select) аттрибует value = null, идет "зачистка страницы"
 * В противном случае вызывается роутинг, для выбора дальнейшей схемы действия
 */
function eventOptions(e){
        const value = e.target[e.target.selectedIndex].value.trim()
        if(value != '' && value != 'empty'){
            const valueSplit = value.split("(");
            let valueClear = null;
            if(valueSplit.length > 1){
                valueClear = valueSplit[1].replace(/[()]/g,' ').trim()
            } else{
                valueClear = valueSplit[0]
            }
            valueClear = switcher(valueClear)
            routing(valueClear, valueSplit)
        } else{
            cleaner()
        }
}

/**
 * @param {String} block - id отрисованного Selector
 * Метод инициализируем отрисованный элемент и добавляет слушаеть события
 */
function initOptions(block){
    const optionsEl = document.getElementById(block);
    optionsEl.addEventListener('change', eventOptions)
}

/**
 * принимает объект со свойствами для отрисовываемых объектов
 * @param {string}  title - название Selector (route, time)
 * @param {Array}  routerValue - массив со значениями для каждого Selector
 * @param {string}  direction -название направления билета
 * @param {Object}  arrParse - объект со временем конкретного направления
 * @param {string}  text - текст для Label
 */

function renderSelects (obj){
    const div = document.createElement('div');
    const select = document.createElement('select');

    div.insertAdjacentHTML('beforeend', `<label class="label-${obj.title === 'route'? obj.title: obj.direction}" for="${obj.title}">${obj.text}</label>`)

    select.setAttribute('name', `${obj.title}`)
    select.setAttribute('id', `${obj.title}-${obj.direction}`)

    div.classList.add(`choice-${obj.direction}`)

    if(obj.direction === 'route'){
        for(const [key, el] of Object.entries(obj.arrParse)){
            if(obj.arrParse[key] != 'из A в B и обратно в А'){
                select.insertAdjacentHTML('beforeend', `<option value="${obj.arrParse[key] != ''? obj.arrParse[key]: ''}">${obj.arrParse[key]}</option>`)
            }
        }
    }
    if(obj.direction === 'to' || obj.direction ==='toFrom' || obj.direction === 'from'){
        for(const [key, el] of Object.entries(obj.routerValue)){
            if(obj.routerValue[key] != ''){
                select.insertAdjacentHTML('beforeend', `<option value="${obj.routerValue[key] != ''? obj.routerValue[key] : 'empty'}(${obj.routerValue[key] != ''? (arrRoutes[obj.direction]): ''})">${obj.routerValue[key]}</option>`)
            } else{
                select.insertAdjacentHTML('beforeend', `<option value="empty">${obj.routerValue[key]}</option>`)
            }
          
        }
    }

    div.insertAdjacentElement('beforeend', select)
    container.insertAdjacentElement('beforeend', div)
    initOptions(`${obj.title}-${obj.direction}`)
}

/**
 * При загрузке страницы, вызывается метод в который передается информация для первого Selector
 */
window.onload = renderSelects({title: 'route', direction: 'route', routerValue: null, arrParse: arrRoutes, text: `Выберите направление`})
