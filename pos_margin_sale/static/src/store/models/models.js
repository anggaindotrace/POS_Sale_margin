/** @odoo-module **/

import { Orderline, Product, Order } from "@point_of_sale/app/store/models";
import { patch } from "@web/core/utils/patch";
import { _t } from "@web/core/l10n/translation";
import { ConfirmPopup } from "@point_of_sale/app/utils/confirm_popup/confirm_popup";


patch(Product.prototype, {
    get_minimum_sale_price() {
        return this.minimum_sale_price;
    }
})


patch(Orderline.prototype, {
    set_unit_price(price) {
        super.set_unit_price(price);
    },

    getDisplayData() {
        return {
            productName: this.get_full_product_name(),
            price: this.getPriceString(),
            qty: this.get_quantity_str(),
            unit: this.get_unit().name,
            unitPrice: this.env.utils.formatCurrency(this.get_unit_display_price()),
            unitPriceInt: this.get_unit_display_price(),
            oldUnitPrice: this.env.utils.formatCurrency(this.get_old_unit_display_price()),
            discount: this.get_discount_str(),
            customerNote: this.get_customer_note(),
            internalNote: this.getNote(),
            comboParent: this.comboParent?.get_full_product_name(),
            pack_lot_lines: this.get_lot_lines(),
            price_without_discount: this.env.utils.formatCurrency(
                this.getUnitDisplayPriceBeforeDiscount()
            ),
            attributes: this.attribute_value_ids
                ? this.findAttribute(this.attribute_value_ids, this.custom_attribute_value_ids)
                : [],
            minimumSalePrice: this.product.get_minimum_sale_price(), // Added minimum_sale_price
            isLessMinimumSalePrice: this.get_unit_display_price() < this.product.get_minimum_sale_price()
        };
    }

});

patch(Order.prototype, {
    async pay() {
        const orderLines = this.get_orderlines();
        const lines = orderLines.filter(line => line.get_unit_display_price() < line.product.get_minimum_sale_price());
        
        if (lines.length > 0) {
            // Display the confirmation popup with the constructed message
            const  {confirmed } = await this.env.services.popup.add(ConfirmPopup, {
                title: _t("Price unit less than minimum price"),
                body: _t("Some products are below the minimum price. Proceed to payment?")
            });
            if (!confirmed) {
                return;
            }
        }
   
        return super.pay(...arguments);
    }
});