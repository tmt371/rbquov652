// File: 04-core-code/ui/views/f2-summary-view.js

import { EVENTS } from '../../config/constants.js';

/**
 * @fileoverview A dedicated sub-view for handling all logic related to the F2 (Summary) tab.
 */
export class F2SummaryView {
    constructor({ panelElement, eventAggregator }) {
        this.panelElement = panelElement;
        this.eventAggregator = eventAggregator;

        // [MODIFIED] Define the focus order array BEFORE it is used.
        this.focusOrder = [
            'f2-b10-wifi-qty', 'f2-b13-delivery-qty', 'f2-b14-install-qty',
            'f2-b15-removal-qty', 'f2-b17-mul-times', 'f2-b18-discount'
        ];

        this._cacheF2Elements();
        this._initializeF2Listeners();

        console.log("F2SummaryView Initialized.");
    }

    _cacheF2Elements() {
        const query = (id) => this.panelElement.querySelector(id);
        this.f2 = {
            b2_winderPrice: query('#f2-b2-winder-price'),
            b3_dualPrice: query('#f2-b3-dual-price'),
            b4_acceSum: query('#f2-b4-acce-sum'),
            b6_motorPrice: query('#f2-b6-motor-price'),
            b7_remotePrice: query('#f2-b7-remote-price'),
            b8_chargerPrice: query('#f2-b8-charger-price'),
            b9_cordPrice: query('#f2-b9-cord-price'),
            b10_wifiQty: query('#f2-b10-wifi-qty'),
            c10_wifiSum: query('#f2-c10-wifi-sum'),
            b11_eAcceSum: query('#f2-b11-e-acce-sum'),
            b13_deliveryQty: query('#f2-b13-delivery-qty'),
            c13_deliveryFee: query('#f2-c13-delivery-fee'),
            b14_installQty: query('#f2-b14-install-qty'),
            c14_installFee: query('#f2-c14-install-fee'),
            b15_removalQty: query('#f2-b15-removal-qty'),
            c15_removalFee: query('#f2-c15-removal-fee'),
            b16_surchargeFee: query('#f2-b16-surcharge-fee'),
            a17_totalSum: query('#f2-a17-total-sum'),
            b17_mulTimes: query('#f2-b17-mul-times'),
            c17_1stRbPrice: query('#f2-c17-1st-rb-price'),
            b18_discount: query('#f2-b18-discount'),
            b19_disRbPrice: query('#f2-b19-dis-rb-price'),
            b20_singleprofit: query('#f2-b20-singleprofit'),
            b21_rbProfit: query('#f2-b21-rb-profit'),
            b22_sumprice: query('#f2-b22-sumprice'),
            b23_sumprofit: query('#f2-b23-sumprofit'),
            b24_gst: query('#f2-b24-gst'),
            b25_netprofit: query('#f2-b25-netprofit'),
        };
    }

    _initializeF2Listeners() {
        this.focusOrder.forEach((elementId, index) => {
            const currentElement = this.panelElement.querySelector(`#${elementId}`);
            if (currentElement) {
                currentElement.addEventListener('change', (event) => {
                    this.eventAggregator.publish(EVENTS.F2_VALUE_CHANGED, { id: event.target.id, value: event.target.value });
                });

                currentElement.addEventListener('keydown', (event) => {
                    if (event.key === 'Enter' || (event.key === 'Tab' && !event.shiftKey)) {
                        event.preventDefault();
                        const nextIndex = index + 1;
                        if (nextIndex < this.focusOrder.length) {
                            const nextElementId = this.focusOrder[nextIndex];
                            this.eventAggregator.publish(EVENTS.FOCUS_ELEMENT, { elementId: nextElementId });
                        } else {
                            event.target.blur(); // Lose focus
                        }
                    }
                });
            }
        });

        const feeCells = [
            { el: this.f2.c13_deliveryFee, type: 'delivery' },
            { el: this.f2.c14_installFee, type: 'install' },
            { el: this.f2.c15_removalFee, type: 'removal' }
        ];
        feeCells.forEach(({ el, type }) => {
            if (el) {
                el.addEventListener('click', () => {
                    this.eventAggregator.publish(EVENTS.TOGGLE_FEE_EXCLUSION, { feeType: type });
                });
            }
        });
    }

    render(state) {
        if (!state || !state.ui.f2 || !this.f2.b2_winderPrice) return;
        
        const f2State = state.ui.f2;
        const productSummary = state.quoteData.products[state.quoteData.currentProduct]?.summary;
        const accessories = productSummary?.accessories || {};

        const formatIntegerCurrency = (value) => (typeof value === 'number') ? `$${value.toFixed(0)}` : '$';
        const formatDecimalCurrency = (value) => (typeof value === 'number') ? `$${value.toFixed(2)}` : '$';
        const formatValue = (value) => (value !== null && value !== undefined) ? value : '';

        const winderPrice = accessories.winderCostSum || 0;
        const dualPrice = accessories.dualCostSum || 0;
        const motorPrice = accessories.motorCostSum || 0;
        const remotePrice = accessories.remoteCostSum || 0;
        const chargerPrice = accessories.chargerCostSum || 0;
        const cordPrice = accessories.cordCostSum || 0;

        this.f2.b2_winderPrice.textContent = formatIntegerCurrency(winderPrice);
        this.f2.b3_dualPrice.textContent = formatIntegerCurrency(dualPrice);
        this.f2.b6_motorPrice.textContent = formatIntegerCurrency(motorPrice);
        this.f2.b7_remotePrice.textContent = formatIntegerCurrency(remotePrice);
        this.f2.b8_chargerPrice.textContent = formatIntegerCurrency(chargerPrice);
        this.f2.b9_cordPrice.textContent = formatIntegerCurrency(cordPrice);

        const wifiSum = f2State.wifiSum || 0;
        const deliveryFee = f2State.deliveryFee || 0;
        const installFee = f2State.installFee || 0;
        const removalFee = f2State.removalFee || 0;

        const acceSum = winderPrice + dualPrice;
        const eAcceSum = motorPrice + remotePrice + chargerPrice + cordPrice + wifiSum;
        const surchargeFee =
            (f2State.deliveryFeeExcluded ? 0 : deliveryFee) +
            (f2State.installFeeExcluded ? 0 : installFee) +
            (f2State.removalFeeExcluded ? 0 : removalFee);

        this.f2.b4_acceSum.textContent = formatIntegerCurrency(acceSum);
        this.f2.c10_wifiSum.textContent = formatIntegerCurrency(wifiSum);
        this.f2.b11_eAcceSum.textContent = formatIntegerCurrency(eAcceSum);
        this.f2.c13_deliveryFee.textContent = formatIntegerCurrency(deliveryFee);
        this.f2.c14_installFee.textContent = formatIntegerCurrency(installFee);
        this.f2.c15_removalFee.textContent = formatIntegerCurrency(removalFee);
        this.f2.b16_surchargeFee.textContent = formatIntegerCurrency(surchargeFee);
        
        this.f2.a17_totalSum.textContent = formatValue(f2State.totalSumForRbTime);
        this.f2.c17_1stRbPrice.textContent = formatDecimalCurrency(f2State.firstRbPrice);
        this.f2.b19_disRbPrice.textContent = formatDecimalCurrency(f2State.disRbPrice);
        this.f2.b20_singleprofit.textContent = formatDecimalCurrency(f2State.singleprofit);
        this.f2.b21_rbProfit.textContent = formatDecimalCurrency(f2State.rbProfit);
        this.f2.b22_sumprice.textContent = formatDecimalCurrency(f2State.sumPrice);
        this.f2.b23_sumprofit.textContent = formatDecimalCurrency(f2State.sumProfit);
        this.f2.b24_gst.textContent = formatDecimalCurrency(f2State.gst);
        this.f2.b25_netprofit.textContent = formatDecimalCurrency(f2State.netProfit);

        if (document.activeElement !== this.f2.b10_wifiQty) this.f2.b10_wifiQty.value = formatValue(f2State.wifiQty);
        if (document.activeElement !== this.f2.b13_deliveryQty) this.f2.b13_deliveryQty.value = formatValue(f2State.deliveryQty);
        if (document.activeElement !== this.f2.b14_installQty) this.f2.b14_installQty.value = formatValue(f2State.installQty);
        if (document.activeElement !== this.f2.b15_removalQty) this.f2.b15_removalQty.value = formatValue(f2State.removalQty);
        if (document.activeElement !== this.f2.b17_mulTimes) this.f2.b17_mulTimes.value = formatValue(f2State.mulTimes);
        if (document.activeElement !== this.f2.b18_discount) this.f2.b18_discount.value = formatValue(f2State.discount);

        this.f2.c13_deliveryFee.classList.toggle('is-excluded', f2State.deliveryFeeExcluded);
        this.f2.c14_installFee.classList.toggle('is-excluded', f2State.installFeeExcluded);
        this.f2.c15_removalFee.classList.toggle('is-excluded', f2State.removalFeeExcluded);
    }

    activate() {
        this.eventAggregator.publish(EVENTS.F2_TAB_ACTIVATED);
        // [MODIFIED] Set default focus when the tab becomes active.
        this.eventAggregator.publish(EVENTS.FOCUS_ELEMENT, { elementId: 'f2-b10-wifi-qty' });
    }
}