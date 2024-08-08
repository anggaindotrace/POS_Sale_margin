/** @odoo-module **/

import { Orderline } from "@point_of_sale/app/store/models";
import { patch } from "@web/core/utils/patch";


patch(Orderline.prototype, {
    set_unit_price(price) {
        super.set_unit_price(price);

        console.log(`The price was set to: ${this.price}`);

    },
});